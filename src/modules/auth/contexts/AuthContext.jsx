import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient, gql } from '@apollo/client';

// Creación (o reutilización) singleton del contexto para evitar duplicados cuando el archivo
// se importa mediante rutas dinámicas y estáticas diferentes (Vite puede evaluarlo dos veces
// si el normalizador no unifica el specifier de import).
let AuthContext;
if (typeof window !== 'undefined' && window.__AUTH_SINGLETON_CTX) {
  AuthContext = window.__AUTH_SINGLETON_CTX;
} else {
  AuthContext = createContext(null);
  if (typeof window !== 'undefined') window.__AUTH_SINGLETON_CTX = AuthContext;
}
// Instrumentación para detectar múltiple evaluación del módulo (no debería pasar tras singleton)
if (typeof window !== 'undefined') {
  // Guardamos referencia global para comparar identidades entre módulos.
  window.__AuthContextRef = window.__AuthContextRef || new Set();
  window.__AuthContextRef.add(AuthContext);
  // Si detectamos más de un objeto distinto, lo logueamos.
  if (window.__AuthContextRef.size > 1) {
    console.warn('[AuthProvider][diagnostic] Se han registrado múltiples instancias de AuthContext:', window.__AuthContextRef.size);
  }
}

// Queries / Mutations (ajustar a tu esquema real)
const ME_QUERY = gql`query Me { me { ... on User { id email roles { id name } profile { firstName lastName } } } }`;
const REFRESH_MUTATION = gql`
  mutation Refresh($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user { id email }
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const client = useApolloClient();

  // State principal
  const [isInitializing, setIsInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [remember, setRemember] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Helpers de storage
  const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const writeJSON = (k,v) => localStorage.setItem(k, JSON.stringify(v));

  const STORAGE_KEYS = {
    access: 'auth.accessToken',
    refresh: 'auth.refreshToken',
    remember: 'auth.remember',
    user: 'auth.userSnapshot',
    account: 'auth.accountSnapshot'
  };

  const clearStorage = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  };

  const saveTokens = ({ accessToken: at, refreshToken: rt, remember: rm }) => {
    if (rm !== undefined) { setRemember(rm); writeJSON(STORAGE_KEYS.remember, rm); }
    if (at) { setAccessToken(at); writeJSON(STORAGE_KEYS.access, at); }
    if (rt && (rm || remember)) { setRefreshToken(rt); writeJSON(STORAGE_KEYS.refresh, rt); }
    if (!rm && rm !== undefined) { localStorage.removeItem(STORAGE_KEYS.refresh); }
    // Sincronizar clave legacy usada por authLink actual
    if (at) { localStorage.setItem('authToken', at); }
  };

  // loginParams: { user, account?, accessToken, refreshToken?, remember }
  const login = useCallback((loginParams) => {
    if (!loginParams) return;
    const { user: u, account: acc, accessToken: at, refreshToken: rt, remember: rm } = loginParams;
  if (!u || !at) return;
    setUser(u); writeJSON(STORAGE_KEYS.user, u);
    if (acc) { setAccount(acc); writeJSON(STORAGE_KEYS.account, acc); }
    saveTokens({ accessToken: at, refreshToken: rt, remember: rm });
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setAccount(null);
    setRemember(false);
  }, []);

  const updateUserProfile = (updated) => {
    setUser(updated);
    writeJSON(STORAGE_KEYS.user, updated);
  };

  // Silent refresh flow
  const tryRefresh = useCallback(async () => {
    if (!refreshToken) return false;
    try {
      const { data } = await client.mutate({
        mutation: REFRESH_MUTATION,
        variables: { refreshToken },
        fetchPolicy: 'no-cache'
      });
      const at = data?.refreshToken?.accessToken;
      if (at) {
        saveTokens({ accessToken: at });
        return true;
      }
    } catch (e) {
      console.warn('Refresh failed', e);
    }
    return false;
  }, [client, refreshToken]);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await client.query({ query: ME_QUERY, fetchPolicy: 'network-only' });
      const u = data?.me; // Ajustar según el schema real (puede ser data.me.user)
      if (u && (u.id || u._id)) {
        const normalized = { ...u, id: u.id || u._id };
        setUser(normalized);
        writeJSON(STORAGE_KEYS.user, normalized);
        return { ok: true };
      }
      return { ok: false, reason: 'NO_USER_RETURNED' };
    } catch (e) {
      const code = e?.graphQLErrors?.[0]?.extensions?.code || e?.networkError?.statusCode;
      return { ok: false, error: e, code };
    }
  }, [client]);

  // Inicialización: rehidratación + validación
  useEffect(() => {
  console.info('[AuthProvider] Montando e iniciando rehidratación');
    (async () => {
      try {
        const rm = readJSON(STORAGE_KEYS.remember) === true;
        const at = readJSON(STORAGE_KEYS.access);
        const rt = readJSON(STORAGE_KEYS.refresh);
        const snapUser = readJSON(STORAGE_KEYS.user);
        const snapAccount = readJSON(STORAGE_KEYS.account);
        if (snapUser) setUser(snapUser);
        if (snapAccount) setAccount(snapAccount);
        if (rm) setRemember(true);
        if (rt) setRefreshToken(rt);
  if (at) { setAccessToken(at); localStorage.setItem('authToken', at); }

        let valid = false;
        if (at) {
          const res = await fetchMe();
            valid = res.ok;
            // Si falla pero tenemos snapshot y no es 401, mantener sesión provisional
            if (!valid && snapUser && res.code !== 'UNAUTHENTICATED' && res.code !== 401) {
              console.warn('[Auth] fetchMe falló pero manteniendo snapshot (modo tolerante)', res);
              valid = true; // permitir uso provisional
            }
        } else if (rt && rm) {
          const refreshed = await tryRefresh();
          if (refreshed) {
            const res = await fetchMe();
            valid = res.ok;
          }
        }
  if (!valid) {
          logout();
        }
      } catch (e) {
        setLastError(e.message);
        logout();
      } finally {
        setIsInitializing(false);
  console.info('[AuthProvider] Inicialización completada. isAuthenticated=', !!user);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh (interval) cada 15 min si remember y hay refreshToken
  useEffect(() => {
    if (!remember || !refreshToken) return;
    const id = setInterval(() => { tryRefresh(); }, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [remember, refreshToken, tryRefresh]);

  const value = {
    isInitializing,
    accessToken,
    refreshToken,
    user,
    account,
    remember,
    lastError,
    login,
    logout,
    updateUserProfile,
    isAuthenticated: !!user && !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitializing ? <div style={{ padding: 48, textAlign: 'center' }}>Cargando sesión...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // En lugar de lanzar de inmediato, registramos diagnóstico para investigar doble carga.
    if (typeof window !== 'undefined') {
      window.__AuthContextMisses = (window.__AuthContextMisses || 0) + 1;
      console.error('[useAuth][MISS] Contexto no disponible. Posible doble instancia o render fuera de AuthProvider.', {
        misses: window.__AuthContextMisses,
        contextObjects: window.__AuthContextRef ? [...window.__AuthContextRef] : 'n/a'
      });
    }
    // Fallback temporal para evitar crash mientras diagnosticamos.
    return {
      isInitializing: true,
      isAuthenticated: false,
      user: null,
      account: null,
      accessToken: null,
      refreshToken: null,
      remember: false,
      lastError: 'AUTH_CONTEXT_MISS',
      login: () => console.warn('[useAuth fallback] login() ignorado por ausencia de provider'),
      logout: () => console.warn('[useAuth fallback] logout() ignorado por ausencia de provider'),
      updateUserProfile: () => console.warn('[useAuth fallback] updateUserProfile() ignorado')
    };
  }
  return ctx;
};