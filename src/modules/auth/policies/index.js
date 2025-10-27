import { getUserRoleNames } from '@modules/user/utils/roleUtils.js';

/**
 * Políticas base abstractas - sin referencias específicas a roles o sitios
 */
export const authPolicies = {
  // Políticas fundamentales
  requireAuth: (user) => {
    return !!user && !!user.id;
  },
  
  requireRole: (requiredRole) => (user) => {
    if (!requiredRole) return false;
    return getUserRoleNames(user).includes(requiredRole);
  },
  
  requireAnyRole: (allowedRoles) => (user) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
    const roleNames = getUserRoleNames(user);
    return allowedRoles.some((role) => roleNames.includes(role));
  },
  
  requirePermission: (permission) => (user) => {
    return user?.permissions?.includes(permission);
  },
  
  requireAnyPermission: (permissions) => (user) => {
    return Array.isArray(permissions) && 
           permissions.some(permission => user?.permissions?.includes(permission));
  },
  
  requireAllPermissions: (permissions) => (user) => {
    return Array.isArray(permissions) && 
           permissions.every(permission => user?.permissions?.includes(permission));
  },
  
  requireProperty: (property, value) => (user) => {
    return user?.[property] === value;
  },
  
  requireCustomCheck: (checkFunction) => (user) => {
    return typeof checkFunction === 'function' ? checkFunction(user) : false;
  }
};

/**
 * Factory para crear políticas complejas
 */
export const createPolicy = {
  requireRole: (role) => authPolicies.requireRole(role),
  requireAnyRole: (roles) => authPolicies.requireAnyRole(roles),
  requirePermission: (permission) => authPolicies.requirePermission(permission),
  
  // Combinar políticas con AND
  and: (...policies) => (user) => {
    return policies.every(policy => evaluatePolicy(policy, user));
  },
  
  // Combinar políticas con OR
  or: (...policies) => (user) => {
    return policies.some(policy => evaluatePolicy(policy, user));
  }
};

/**
 * Función helper para evaluar políticas
 */
export const evaluatePolicy = (policy, user, context = {}) => {
  if (typeof policy === 'function') {
    return policy(user, context);
  }
  
  if (typeof policy === 'string') {
    const policyFunction = authPolicies[policy];
    return policyFunction ? policyFunction(user, context) : false;
  }
  
  if (Array.isArray(policy)) {
    // Si es un array, todas las políticas deben cumplirse (AND)
    return policy.every(p => evaluatePolicy(p, user, context));
  }
  
  if (typeof policy === 'object' && policy !== null) {
    // Objeto de configuración de política
    const { type, ...config } = policy;
    if (type && authPolicies[type]) {
      return authPolicies[type](config)(user, context);
    }
  }
  
  return false;
};