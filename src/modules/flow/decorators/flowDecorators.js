import { registerAction } from '../utils/actionRegistry';

export function FlowAction(metadata) {
  return function(target, propertyKey, descriptor) {
    registerAction({
      ...metadata,
      method: propertyKey,
    }, descriptor.value);
    return descriptor;
  };
}
