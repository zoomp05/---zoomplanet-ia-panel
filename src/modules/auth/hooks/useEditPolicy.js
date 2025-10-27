import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userHasRole } from '@modules/user/utils/roleUtils.js';

/**
 * Política por defecto de edición: 
 * - Solo el propio usuario puede editar su perfil
 * - Roles con privilegio (admin) pueden editar a otros
 */
export default function useEditPolicy() {
  const { user } = useAuth();

  const isAdmin = useMemo(() => userHasRole(user, 'admin'), [user]);

  const canEditUser = (targetUserId) => {
    if (!user) return false;
    if (isAdmin) return true;
    const myId = user.id || user._id;
    return String(myId) === String(targetUserId);
  };

  return { isAdmin, canEditUser };
}
