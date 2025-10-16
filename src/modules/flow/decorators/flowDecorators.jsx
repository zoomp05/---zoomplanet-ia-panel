import { CREATE_FLOW_ACTION } from '../apollo/flow';

const registeredActions = new Map();
const createFlowAction = CREATE_FLOW_ACTION;

export function FlowAction(metadata) {
  return function(target, propertyKey, descriptor) {
    const actionMetadata = {
      ...metadata,
      method: propertyKey,
      handler: descriptor.value
    };

    registeredActions.set(metadata.code, actionMetadata);

    // Registrar la acción en el backend
    createFlowAction({
      variables: {
        input: {
          code: metadata.code,
          name: metadata.name,
          description: metadata.description,
          config: metadata.config,
          method: propertyKey
        }
      }
    });

    return descriptor;
  };
}

export function getRegisteredActions() {
  return Array.from(registeredActions.values());
}
