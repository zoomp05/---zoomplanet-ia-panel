import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Política por defecto de edición: 
 * - Solo el propio usuario puede editar su perfil
 * - Roles con privilegio (admin) pueden editar a otros
 */
export default function useEditPolicy() {
  const { user } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (Array.isArray(user.roles)) {
      return user.roles.some(r => (r?.name || r) === 'admin');
    }
    return user.role === 'admin';
  }, [user]);

  const canEditUser = (targetUserId) => {
    if (!user) return false;
    if (isAdmin) return true;
    const myId = user.id || user._id;
    return String(myId) === String(targetUserId);
  };

  return { isAdmin, canEditUser };
}
