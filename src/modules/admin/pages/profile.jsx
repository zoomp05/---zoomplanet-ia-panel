import React from 'react';
import { Card, Descriptions, Avatar, Button, Space, Tag } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/contexts/AuthContext';
import useEditPolicy from '../../auth/hooks/useEditPolicy';
import ProfileModal from '../../user/components/user/UserProfileModal.jsx';
import ChangePasswordModal from '../../user/components/user/ChangePasswordModal.jsx';
import * as ApolloClient from '@apollo/client';
import { normalizeUserRoles, getUserRoleNames } from '@modules/user/utils/roleUtils.js';

const { gql, useQuery } = ApolloClient;

const GET_ME = gql`query MeBasic { me { id email name roles { id name } profile { firstName lastName phone timezone bio } } }`;

const AdminProfile = () => {
  const { user: authUser } = useAuth();
  const { data, refetch } = useQuery(GET_ME, { fetchPolicy: 'cache-and-network' });
  const rawUser = data?.me || authUser; // fallback
  const normalizedUser = React.useMemo(() => (rawUser ? normalizeUserRoles(rawUser) : null), [rawUser]);
  const user = normalizedUser || rawUser;
  const roleNames = React.useMemo(() => getUserRoleNames(user), [user]);
  const { canEditUser } = useEditPolicy();

  // Politica: el propio usuario siempre puede editar sus datos personales (perfil) excepto email, roles y estado
  const selfId = authUser?.id || authUser?._id;
  const canSelfEditProfile = selfId && user?.id === selfId; 
  const canEdit = canSelfEditProfile || (user ? canEditUser(user.id || user._id) : false);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [pwdOpen, setPwdOpen] = React.useState(false);

  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => { setProfileOpen(false); refetch(); };
  const openPwd = () => setPwdOpen(true);
  const closePwd = () => setPwdOpen(false);

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Space align="center">
          <Avatar size={64} icon={<UserOutlined />} src={user?.avatar} />
          <div>
            <h2 style={{ margin: 0 }}>{user?.name || user?.email}</h2>
            <div style={{ color: '#888' }}>{user?.email}</div>
            <div style={{ marginTop: 4 }}>
              {user?.roles?.length
                ? user.roles.map((r) => <Tag key={r.id || r.name}>{r.name}</Tag>)
                : <Tag>-</Tag>
              }
            </div>
          </div>
        </Space>
      </Card>

      <Card title="Mi Perfil">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Nombre">{user?.profile?.firstName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Apellidos">{user?.profile?.lastName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nombre Completo">{user?.name || `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Roles">{roleNames.join(', ') || '-'}</Descriptions.Item>
          <Descriptions.Item label="Estado">Activo</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{user?.profile?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Zona Horaria">{user?.profile?.timezone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Bio">{user?.profile?.bio || '-'}</Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 16 }}>
          <Button icon={<EditOutlined />} onClick={openProfile} disabled={!canEdit}>Editar Perfil</Button>
          <Button icon={<LockOutlined />} onClick={openPwd} disabled={!canEdit}>Cambiar Contraseña</Button>
        </Space>
      </Card>

      <ProfileModal
        visible={profileOpen}
        user={user}
        onClose={closeProfile}
      />
      <ChangePasswordModal
        visible={pwdOpen}
        user={user}
        onClose={closePwd}
      />
    </div>
  );
};

export default AdminProfile;
