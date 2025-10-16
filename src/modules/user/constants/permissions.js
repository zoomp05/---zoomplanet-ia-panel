export const RESOURCES = {
    ACCOUNT: 'ACCOUNT',
    WORKER: 'WORKER',
    PERMISSION: 'PERMISSION',
    DIRECTORY: 'DIRECTORY',
    ROLE: 'ROLE',
    USER: 'USER',
    PROJECT: 'PROJECT',
    TASK: 'TASK',
    CONFIGURATION: 'CONFIGURATION'
  };
  
  export const ACTIONS = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    MANAGE: 'MANAGE',
    LIST: 'LIST',
    ASSIGN: 'ASSIGN'
  };
  
  export const formatEnumValue = (value) => {
    return value.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };