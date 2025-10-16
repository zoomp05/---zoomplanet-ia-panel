import shopActions from '../actions/shopActions';
import shopPlanActions from '../actions/shopPlanActions';

// Importar todas las clases que contienen acciones
const actionModules = [
  shopActions,
  shopPlanActions
];

export const initializeActions = () => {
  // Los decoradores se ejecutarán cuando se importen las clases
  console.log('Acciones registradas:', getRegisteredActions());
};

const registeredActions = new Map();

export const registerAction = (metadata, handler) => {
  registeredActions.set(metadata.code, {
    ...metadata,
    handler
  });
};

export const getRegisteredActions = () => {
  return Array.from(registeredActions.values());
};
