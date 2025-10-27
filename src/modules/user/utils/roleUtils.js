export const normalizeRoleEntry = (role) => {
  if (!role) return null;
  if (typeof role === "string") {
    return { id: role, name: role };
  }
  if (Array.isArray(role)) {
    return role.map(normalizeRoleEntry).filter(Boolean);
  }
  if (typeof role === "object") {
    const id = role.id || role._id || role.code || role.name || null;
    const name = role.name || role.code || role.id || role._id || null;
    return { ...role, id, name };
  }
  return null;
};

export const gatherUserRoleEntries = (user) => {
  if (!user) return [];
  const collected = [];
  if (Array.isArray(user.roles)) {
    collected.push(...user.roles);
  }
  if (user.role) {
    if (Array.isArray(user.role)) {
      collected.push(...user.role);
    } else {
      collected.push(user.role);
    }
  }
  return collected;
};

export const normalizeUserRoles = (user) => {
  if (!user) return user;
  const rawRoles = gatherUserRoleEntries(user);
  const normalizedRoles = [];
  const seen = new Set();
  rawRoles.forEach((raw) => {
    const entry = normalizeRoleEntry(raw);
    if (!entry) return;
    const key = entry.id || entry.name || JSON.stringify(entry);
    if (seen.has(key)) return;
    seen.add(key);
    normalizedRoles.push(entry);
  });
  const primaryRole = normalizedRoles[0] || null;
  const roleNames = normalizedRoles.map((entry) => entry?.name).filter(Boolean);
  return {
    ...user,
    roles: normalizedRoles,
    role: primaryRole,
    roleNames,
  };
};

export const getUserRoleNames = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roleNames) && user.roleNames.length > 0) {
    return user.roleNames;
  }
  const normalized = normalizeUserRoles(user);
  return normalized.roleNames;
};

export const userHasRole = (user, roleName) => {
  if (!roleName) return false;
  return getUserRoleNames(user).includes(roleName);
};

export const getPrimaryRole = (user) => {
  if (!user) return null;
  if (user.role && typeof user.role === "object") {
    return user.role;
  }
  const normalized = normalizeUserRoles(user);
  return normalized.role;
};
