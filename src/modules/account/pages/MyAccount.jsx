import React from 'react';
import { Card, Form, Input, Select, Button, Space, message, Descriptions } from 'antd';
import * as ApolloClient from '@apollo/client';

const { gql, useQuery, useMutation } = ApolloClient;

const GET_MY_ACCOUNT = gql`
  query GetMyAccount {
    myAccount {
      __typename
      ... on Account { id name slug description type status maxMembers maxProjects }
      ... on NotFoundError { message }
      ... on ValidationError { message code }
    }
  }
`;

// Nueva query para obtener roles del usuario y decidir permisos de edición
const GET_ME = gql`
  query MeRole { 
    me { id role { name } } 
  }
`;

const UPDATE_MY_ACCOUNT = gql`
  mutation UpdateMyAccount($input: UpdateAccountInput!) {
    updateMyAccount(input: $input) {
      __typename
      ... on Account { id name slug description type status maxMembers maxProjects }
      ... on ValidationError { message code }
      ... on NotFoundError { message }
    }
  }
`;

const MyAccount = () => {
  const { data, loading, refetch } = useQuery(GET_MY_ACCOUNT);
  const { data: meData } = useQuery(GET_ME);
  const [updateMyAccount, { loading: saving }] = useMutation(UPDATE_MY_ACCOUNT);

  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = React.useState(false);

  // Permiso de edición: por ahora solo roles admin / account_admin / account_edit
  const canEdit = React.useMemo(() => {
    const roleName = meData?.me?.role?.name;
    return ['admin', 'account_admin', 'account_edit'].includes(roleName);
  }, [meData]);

  const acc = data?.myAccount?.__typename === 'Account' ? data.myAccount : null;

  React.useEffect(() => {
    if (acc) {
      form.setFieldsValue({
        name: acc.name,
        slug: acc.slug,
        description: acc.description,
        type: acc.type,
        status: acc.status,
        maxMembers: acc.maxMembers,
        maxProjects: acc.maxProjects,
      });
      // Siempre al cargar quedamos en modo vista (informativo)
      setIsEditing(false);
    }
  }, [acc, form]);

  const onFinish = async (values) => {
    if (!canEdit) return; // Seguridad UI
    try {
      const res = await updateMyAccount({ variables: { input: values } });
      const result = res.data?.updateMyAccount;
      if (result?.__typename === 'Account') {
        message.success('Cuenta actualizada');
        setIsEditing(false);
        refetch();
      } else {
        message.error(result?.message || 'Error al actualizar');
      }
    } catch (e) {
      message.error(e.message);
    }
  };

  const renderView = () => (
    <Descriptions bordered column={1} size="middle">
      <Descriptions.Item label="Nombre">{acc?.name || '-'}</Descriptions.Item>
      <Descriptions.Item label="Slug">{acc?.slug || '-'}</Descriptions.Item>
      <Descriptions.Item label="Descripción">{acc?.description || '-'}</Descriptions.Item>
      <Descriptions.Item label="Tipo">{acc?.type || '-'}</Descriptions.Item>
      <Descriptions.Item label="Estatus">{acc?.status || '-'}</Descriptions.Item>
      <Descriptions.Item label="Máx. Miembros">{acc?.maxMembers ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="Máx. Proyectos">{acc?.maxProjects ?? '-'}</Descriptions.Item>
    </Descriptions>
  );

  const renderEditForm = () => (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Slug" name="slug">
        <Input />
      </Form.Item>
      <Form.Item label="Descripción" name="description">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item label="Tipo" name="type">
        <Select
          options={[
            { value: 'PERSONAL', label: 'Personal' },
            { value: 'TEAM', label: 'Equipo' },
            { value: 'ENTERPRISE', label: 'Enterprise' },
          ]}
        />
      </Form.Item>
      <Form.Item label="Estatus" name="status">
        <Select
          options={[
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'SUSPENDED', label: 'Suspendido' },
            { value: 'CANCELLED', label: 'Cancelado' },
          ]}
        />
      </Form.Item>
      <Form.Item label="Máx. Miembros" name="maxMembers">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="Máx. Proyectos" name="maxProjects">
        <Input type="number" />
      </Form.Item>
    </Form>
  );

  return (
    <Card
      title="Mi Cuenta"
      loading={loading}
      extra={
        canEdit ? (
          isEditing ? (
            <Space>
              <Button onClick={() => { form.resetFields(); setIsEditing(false); }}>Cancelar</Button>
              <Button type="primary" onClick={() => form.submit()} loading={saving}>Guardar</Button>
            </Space>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )
        ) : null
      }
    >
      {isEditing && canEdit ? renderEditForm() : renderView()}
    </Card>
  );
};

export default MyAccount;
