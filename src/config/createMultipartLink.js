import { ApolloLink, Observable } from '@apollo/client';

function containsFile(value){
  if (!value) return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (Array.isArray(value)) return value.some(v=> containsFile(v));
  if (typeof value === 'object') return Object.values(value).some(v=> containsFile(v));
  return false;
}

function extractFiles(value, pathPrefix='variables', files=[], map={}){
  if (!value) return { clone: value, files, map };
  if (typeof File !== 'undefined' && value instanceof File){
    const index = files.length; files.push(value); map[index] = [pathPrefix]; return { clone: null, files, map };
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob){
    const index = files.length; files.push(value); map[index] = [pathPrefix]; return { clone: null, files, map };
  }
  if (Array.isArray(value)){
    const cloneArr = value.map((item,i)=> { const res = extractFiles(item, `${pathPrefix}.${i}`, files, map); files = res.files; map = res.map; return res.clone; });
    return { clone: cloneArr, files, map };
  }
  if (typeof value === 'object'){
    const cloneObj = {};
    for (const [k,v] of Object.entries(value)){
      const res = extractFiles(v, `${pathPrefix}.${k}`, files, map);
      files = res.files; map = res.map; cloneObj[k] = res.clone;
    }
    return { clone: cloneObj, files, map };
  }
  return { clone: value, files, map };
}

export function createMultipartLink({ uri }){
  return new ApolloLink(operation => new Observable(observer => {
    const context = operation.getContext();
    const { headers = {} } = context;
    const hasFile = containsFile(operation.variables);

    const fetchOptions = { method:'POST', headers: { ...headers }, body:null };
    if (hasFile){
      const { clone, files, map } = extractFiles(operation.variables);
      const form = new FormData();
      const queryString = operation.query.loc ? operation.query.loc.source.body : operation.query;
      const operations = JSON.stringify({ query: queryString, variables: clone, operationName: operation.operationName });
      form.append('operations', operations);
      const mapObj = {}; Object.keys(map).forEach(k=> { mapObj[k] = map[k]; });
      form.append('map', JSON.stringify(mapObj));
      files.forEach((file, i)=> form.append(i, file, file.name || `file-${i}`));
      fetchOptions.body = form;
      Object.keys(fetchOptions.headers).forEach(h=> { if (h.toLowerCase()==='content-type') delete fetchOptions.headers[h]; });
      // Apollo Server CSRF prevention: exigir preflight header en content-types simples
      fetchOptions.headers['apollo-require-preflight'] = 'true';
      if (operation.operationName) fetchOptions.headers['x-apollo-operation-name'] = operation.operationName;
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json';
      const queryString = operation.query.loc ? operation.query.loc.source.body : operation.query;
      fetchOptions.body = JSON.stringify({ query: queryString, variables: operation.variables, operationName: operation.operationName });
      // También podemos añadir el header para uniformidad
      if (operation.operationName) fetchOptions.headers['x-apollo-operation-name'] = operation.operationName;
    }

    fetch(uri, fetchOptions)
      .then(res=> res.json())
      .then(result=> { observer.next(result); observer.complete(); })
      .catch(err=> observer.error(err));
  }));
}
