export const cleanTypenameField = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => cleanTypenameField(item));
    }
    
    if (obj && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        if (key !== '__typename') {
          newObj[key] = cleanTypenameField(obj[key]);
        }
      });
      return newObj;
    }
    
    return obj;
  };
  