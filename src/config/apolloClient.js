import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { resolveLoginRoute } from '../modules/auth/hooks/resolveLoginRoute.js';

// En Vite usamos import.meta.env en lugar de process.env
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

// Detección de archivos
const isExtractableFile = (value) => {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)
  );
};

// Recorre variables y recopila archivos (manteniendo referencias originales antes de serializar)
const extractFiles = (value, path = 'variables', files = [], map = {}) => {
  if (isExtractableFile(value)) {
    const fileIndex = files.length;
    files.push(value);
    map[fileIndex] = [path];
    return null; // nullified en operaciones
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => extractFiles(v, `${path}.${i}`, files, map));
  }
  if (value && typeof value === 'object') {
    const clone = Array.isArray(value) ? [] : {};
    Object.keys(value).forEach(k => {
      clone[k] = extractFiles(value[k], `${path}.${k}`, files, map);
    });
    return clone;
  }
  return value;
};

const uploadLink = new ApolloLink(operation => {
  // Solo manejar si hay archivos
  const { variables, operationName, query } = operation;
  const files = [];
  const map = {};
  const nullified = extractFiles(variables, 'variables', files, map);
  // Inyectar token directamente (fallback por si authLink falla)
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  const ctxHeaders = new Headers(operation.getContext().headers || {});
  if (token && !ctxHeaders.get('authorization')) ctxHeaders.set('authorization', `Bearer ${token}`);
  if (!files.length) {
    return new Observable(observer => {
      const printedQuery = print(query);
      const baseHeaders = ctxHeaders;
      // Anti-CSRF header en todas las requests
      if (operationName) baseHeaders.set('x-apollo-operation-name', operationName);
      baseHeaders.set('apollo-require-preflight', 'true');
      if (!baseHeaders.has('content-type')) baseHeaders.set('content-type','application/json');
      // Debug headers
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[uploadLink][no-files] headers', Object.fromEntries(baseHeaders.entries()));
      }
      fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ operationName, query: printedQuery, variables }),
        credentials: 'include'
      }).then(r => r.json()).then(result => {
        observer.next(result);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }
  const form = new FormData();
  const printedQuery = print(query);
  const operations = JSON.stringify({ operationName, query: printedQuery, variables: nullified });
  form.append('operations', operations);
  form.append('map', JSON.stringify(map));
  files.forEach((f, i) => form.append(String(i), f));
  return new Observable(observer => {
    const baseHeaders = ctxHeaders;
    if (operationName) baseHeaders.set('x-apollo-operation-name', operationName);
    baseHeaders.set('apollo-require-preflight', 'true');
    // Nunca forzar content-type aquí (que lo gestione el browser) pero añadir debug
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[uploadLink][files] map', map);
      console.debug('[uploadLink][files] headers', Object.fromEntries(baseHeaders.entries()));
    }
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: baseHeaders, // Authorization ya agregado por authLink
      body: form,
      credentials: 'include'
    }).then(r => r.json()).then(result => {
      observer.next(result);
      observer.complete();
    }).catch(err => observer.error(err));
  });
});

const httpLink = createHttpLink({ 
  uri: GRAPHQL_URL,
  fetch: (uri, options = {}) => {
    // Asegurar headers CSRF también en peticiones sin archivo
    const h = new Headers(options.headers || {});
    if (!h.has('apollo-require-preflight')) h.set('apollo-require-preflight','true');
    return fetch(uri, { ...options, headers: h });
  }
});

// Crear el link de autenticación
/*const authLink = setContext((_, { headers }) => {
  // Obtener el token del localStorage
  let token = localStorage.getItem('authToken');
  if (!token) {
    // Fallback a claves nuevas usadas por AuthContext
    token = localStorage.getItem('auth.accessToken');
    if (token && !localStorage.getItem('authToken')) {
      try { localStorage.setItem('authToken', token); } catch{}
    }
  }
  
  // Retornar los headers con o sin token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});*/
console.log("GraphQL URL:", GRAPHQL_URL);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED' && 
          extensions?.reason === 'TOKEN_EXPIRED') {
        
        console.log('[apolloClient errorLink] 🔒 Token expirado detectado');
        
        // PROTECCIÓN ANTI-LOOP: No redirigir si ya estamos en una página de login
        const currentPath = window.location.pathname;
        if (currentPath.includes('/auth/login')) {
          console.warn('[apolloClient errorLink] ⚠️ Ya estamos en página de login, evitando redirección');
          return;
        }
        
        // Limpiar tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth.accessToken');
        localStorage.removeItem('auth.user');
        localStorage.removeItem('user');
        localStorage.removeItem('account');
        
        // Redirigir al login correcto según jerarquía
        const target = resolveLoginRoute();
        console.log('[apolloClient errorLink] ➡️ Redirigiendo a:', target);
        
        // Verificar que target no sea la misma ruta actual (loop)
        if (target === currentPath) {
          console.warn('[apolloClient errorLink] ⚠️ Loop detectado, target === currentPath:', target);
          return;
        }
        
        window.location.href = target;
      }
    });
  }

  if (networkError) {
    console.error('[apolloClient] ❌ Network error:', networkError);
  }
});


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[authLink] token present?', !!token);
  }
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
  'apollo-require-preflight': 'true'
    }
  };
});


// Crear el cliente Apollo
const client = new ApolloClient({
  // order: error -> auth -> upload (termina si hay archivos) -> http
  link: ApolloLink.from([errorLink, authLink, uploadLink, httpLink]),
  cache: new InMemoryCache(),
  credentials: 'include',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// (Se eliminó uploadFile manual para usar flujo nativo Apollo + fetch custom)

export default client;