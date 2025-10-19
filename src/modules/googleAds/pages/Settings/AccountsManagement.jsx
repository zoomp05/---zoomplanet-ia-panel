import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Typography,
  Card,
  Button,
  Table,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Spin,
  Empty,
  Badge,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  GoogleOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  ApiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

// Configurar dayjs
dayjs.extend(relativeTime);
dayjs.locale('es');

// GraphQL
import {
  GET_GADS_ACCOUNTS_BY_PROJECT,
  GET_GADS_ACCOUNTS,
  TEST_GADS_CONNECTION
} from '../../graphql/queries';
import {
  CREATE_GADS_ACCOUNT,
  UPDATE_GADS_ACCOUNT,
  DELETE_GADS_ACCOUNT,
  RECONNECT_GADS_ACCOUNT,
  SYNC_GADS_ACCOUNT_INFO,
  REFRESH_GADS_ACCOUNT_TOKEN
} from '../../graphql/mutations';

// Componentes
import AccountForm from '../../components/AccountForm';
import ConnectionTestModal from '../../components/ConnectionTestModal';
import LinkSubAccountsModal from '../../components/LinkSubAccountsModal';

const { Title, Text } = Typography;

/**
 * Página de Gestión de Cuentas de Google Ads
 */
const AccountsManagement = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [linkSubAccountsVisible, setLinkSubAccountsVisible] = useState(false);
  const [selectedMCCAccount, setSelectedMCCAccount] = useState(null);

  // TODO: Obtener projectId del contexto o props
  const projectId = null; // Temporalmente deshabilitado hasta obtener projectId real

  // Queries - Comentado temporalmente hasta tener projectId válido
  // const { data, loading, refetch } = useQuery(GET_GADS_ACCOUNTS_BY_PROJECT, {
  //   variables: { projectId },
  //   fetchPolicy: 'cache-and-network'
  // });

  // Usar query general mientras tanto
  const { data: accountsData, loading, refetch } = useQuery(GET_GADS_ACCOUNTS, {
    variables: {
      filters: {},
      limit: 100,
      offset: 0
    },
    fetchPolicy: 'cache-and-network'
  });

  // Adaptar data para compatibilidad
  const data = accountsData?.gAdsAccounts?.edges?.map(edge => edge.node) || [];

  // Mutations
  const [createAccount, { loading: creating }] = useMutation(CREATE_GADS_ACCOUNT, {
    onCompleted: (data) => {
      if (data.createGAdsAccount.success) {
        message.success('Cuenta creada exitosamente');
        setFormVisible(false);
        refetch();
      } else {
        message.error(data.createGAdsAccount.message || 'Error al crear la cuenta');
      }
    },
    onError: (error) => {
      message.error('Error al crear la cuenta: ' + error.message);
    }
  });

  const [updateAccount, { loading: updating }] = useMutation(UPDATE_GADS_ACCOUNT, {
    onCompleted: (data) => {
      if (data.updateGAdsAccount.success) {
        message.success('Cuenta actualizada exitosamente');
        setFormVisible(false);
        setSelectedAccount(null);
        refetch();
      } else {
        message.error(data.updateGAdsAccount.message || 'Error al actualizar');
      }
    },
    onError: (error) => {
      message.error('Error al actualizar: ' + error.message);
    }
  });

  const [deleteAccount] = useMutation(DELETE_GADS_ACCOUNT, {
    onCompleted: (data) => {
      if (data.deleteGAdsAccount.success) {
        message.success('Cuenta eliminada exitosamente');
        refetch();
      } else {
        message.error(data.deleteGAdsAccount.message || 'Error al eliminar');
      }
    },
    onError: (error) => {
      message.error('Error al eliminar: ' + error.message);
    }
  });

  const [reconnectAccount] = useMutation(RECONNECT_GADS_ACCOUNT, {
    onCompleted: (data) => {
      if (data.reconnectGAdsAccount.success) {
        message.success('Reconexión exitosa');
        refetch();
      } else {
        message.error(data.reconnectGAdsAccount.message || 'Error al reconectar');
      }
    },
    onError: (error) => {
      message.error('Error al reconectar: ' + error.message);
    }
  });

  const [syncAccountInfo] = useMutation(SYNC_GADS_ACCOUNT_INFO, {
    onCompleted: (data) => {
      if (data.syncGAdsAccountInfo.success) {
        message.success('Información sincronizada');
        refetch();
      } else {
        message.error(data.syncGAdsAccountInfo.message || 'Error al sincronizar');
      }
    },
    onError: (error) => {
      message.error('Error al sincronizar: ' + error.message);
    }
  });

  const [refreshToken] = useMutation(REFRESH_GADS_ACCOUNT_TOKEN, {
    onCompleted: (data) => {
      if (data.refreshGAdsAccountToken.success) {
        message.success('Token refrescado exitosamente');
        refetch();
      } else {
        message.error(data.refreshGAdsAccountToken.message || 'Error al refrescar token');
      }
    },
    onError: (error) => {
      message.error('Error al refrescar token: ' + error.message);
    }
  });

  // Handlers
  const handleCreate = () => {
    setSelectedAccount(null);
    setFormVisible(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (selectedAccount) {
        // Editar - preparar input
        const input = {
          name: values.name,
          customerId: values.customerId,
          settings: values.settings
        };

        // Solo incluir credenciales si fueron modificadas (no están vacías)
        if (values.credentials) {
          const credentials = {};
          let hasCredentials = false;

          if (values.credentials.clientId) {
            credentials.clientId = values.credentials.clientId;
            hasCredentials = true;
          }
          if (values.credentials.clientSecret) {
            credentials.clientSecret = values.credentials.clientSecret;
            hasCredentials = true;
          }
          if (values.credentials.developerToken) {
            credentials.developerToken = values.credentials.developerToken;
            hasCredentials = true;
          }
          if (values.credentials.refreshToken) {
            credentials.refreshToken = values.credentials.refreshToken;
            hasCredentials = true;
          }

          if (hasCredentials) {
            input.credentials = credentials;
          }
        }

        const result = await updateAccount({
          variables: {
            id: selectedAccount._id,
            input
          }
        });
        return result?.data?.updateGAdsAccount?.success !== false;
      } else {
        // Crear
        const input = { ...values };
        if (projectId) {
          input.projectId = projectId;
        }
        const result = await createAccount({
          variables: { input }
        });
        return result?.data?.createGAdsAccount?.success !== false;
      }
    } catch (error) {
      console.error('Error en handleSave:', error);
      return false; // Indicar que falló
    }
  };

  const handleDelete = async (accountId) => {
    await deleteAccount({
      variables: { id: accountId }
    });
  };

  const handleReconnect = async (accountId) => {
    await reconnectAccount({
      variables: { id: accountId }
    });
  };

  const handleSync = async (accountId) => {
    await syncAccountInfo({
      variables: { id: accountId }
    });
  };

  const handleRefreshToken = async (accountId) => {
    await refreshToken({
      variables: { id: accountId }
    });
  };

  const handleTestConnection = (account) => {
    setTestingConnection(account);
    setTestModalVisible(true);
  };

  // Renderizar estado de conexión
  const renderConnectionStatus = (status) => {
    const statusConfig = {
      CONNECTED: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Conectado'
      },
      DISCONNECTED: {
        color: 'default',
        icon: <CloseCircleOutlined />,
        text: 'Desconectado'
      },
      ERROR: {
        color: 'error',
        icon: <ExclamationCircleOutlined />,
        text: 'Error'
      },
      PENDING: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Pendiente'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <Badge status={config.color} text={config.text} />
    );
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Cuenta',
      key: 'account',
      render: (_, record) => {
        const isSubAccount = !!record?.managerAccount?._id;
        return (
          <Space direction="vertical" size={0} style={{ marginLeft: isSubAccount ? 24 : 0 }}>
            <Space>
              <GoogleOutlined style={{ color: '#4285f4' }} />
              <Text strong>{record.name}</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.customerId}
            </Text>
            {record.accountInfo?.descriptiveName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.accountInfo.descriptiveName}
              </Text>
            )}
            {isSubAccount && (
              <Tag color="blue" style={{ fontSize: 11 }}>
                Subcuenta de {record.managerAccount?.name || record.managerAccount?.customerId}
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Estado',
      dataIndex: 'connectionStatus',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical" size={0}>
          {renderConnectionStatus(status)}
          {record.connectionDetails?.lastConnectedAt && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Última conexión:{' '}
              {dayjs(record.connectionDetails.lastConnectedAt).fromNow()}
            </Text>
          )}
          {record.connectionDetails?.lastErrorMessage && (
            <Tooltip title={record.connectionDetails.lastErrorMessage}>
              <Text type="danger" style={{ fontSize: 11 }}>
                Error: {record.connectionDetails.lastErrorMessage.substring(0, 30)}...
              </Text>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Configuración',
      key: 'settings',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            <strong>Moneda:</strong> {record.settings?.currency || 'N/A'}
          </Text>
          <Text style={{ fontSize: 12 }}>
            <strong>Zona:</strong>{' '}
            {record.settings?.timezone?.split('/').pop() || 'N/A'}
          </Text>
          {record.settings?.autoTaggingEnabled && (
            <Tag color="blue" style={{ fontSize: 11 }}>
              Auto-tagging
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Info',
      key: 'info',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.hasCredentials ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Con credenciales
            </Tag>
          ) : (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              Sin credenciales
            </Tag>
          )}
          {record.inheritsCredentials && (
            <Tag color="geekblue" style={{ fontSize: 11 }}>
              Hereda credenciales
            </Tag>
          )}
          {record.accountInfo?.testAccount && (
            <Tag color="orange">Cuenta de prueba</Tag>
          )}
          {record.accountInfo?.canManageClients && (
            <Tag color="purple">Manager</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'test',
            label: 'Probar Conexión',
            icon: <ApiOutlined />,
            onClick: () => handleTestConnection(record)
          },
          {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'reconnect',
            label: 'Reconectar',
            icon: <ApiOutlined />,
            onClick: () => handleReconnect(record._id),
            disabled: record.connectionStatus === 'CONNECTED'
          },
          {
            key: 'sync',
            label: 'Sincronizar Info',
            icon: <SyncOutlined />,
            onClick: () => handleSync(record._id)
          },
          !record.managerAccount && {
            key: 'link-subaccounts',
            label: 'Vincular Subcuentas',
            icon: <ApiOutlined />,
            onClick: () => {
              setSelectedMCCAccount(record);
              setLinkSubAccountsVisible(true);
            }
          },
          {
            key: 'refresh',
            label: 'Refrescar Token',
            icon: <ReloadOutlined />,
            onClick: () => handleRefreshToken(record._id)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: 'Eliminar',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              // Will be handled by Popconfirm
            }
          }
        ];

        const filteredItems = items.filter(Boolean).filter(item => item.key !== 'delete');

        return (
          <Space>
            <Dropdown
              menu={{ items: filteredItems }}
              trigger={['click']}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
            <Popconfirm
              title="¿Eliminar cuenta?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDelete(record._id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  const accounts = useMemo(() => {
    if (!data || data.length === 0) return [];

    const managers = [];
    const subAccountsByManager = new Map();

    data.forEach(account => {
      if (account.managerAccount?._id) {
        const list = subAccountsByManager.get(account.managerAccount._id) || [];
        list.push(account);
        subAccountsByManager.set(account.managerAccount._id, list);
      } else {
        managers.push(account);
      }
    });

    const ordered = [];
    managers.forEach(manager => {
      ordered.push(manager);
      const subs = subAccountsByManager.get(manager._id) || [];
      subs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      ordered.push(...subs);
      subAccountsByManager.delete(manager._id);
    });

    // Append orphan subaccounts (sin manager cargado) al final
    subAccountsByManager.forEach(subs => {
      subs.forEach(sub => ordered.push(sub));
    });

    return ordered;
  }, [data]);

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <GoogleOutlined /> Gestión de Cuentas
            </Title>
            <Text type="secondary">
              Administra tus cuentas de Google Ads y sus credenciales
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Actualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nueva Cuenta
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="_id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay cuentas configuradas"
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  Crear Primera Cuenta
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      <AccountForm
        visible={formVisible}
        account={selectedAccount}
        onSave={handleSave}
        onCancel={() => {
          setFormVisible(false);
          setSelectedAccount(null);
        }}
        loading={creating || updating}
      />

      <ConnectionTestModal
        visible={testModalVisible}
        accountId={testingConnection?._id}
        accountName={testingConnection?.name}
        onClose={() => {
          setTestModalVisible(false);
          setTestingConnection(null);
        }}
      />

      <LinkSubAccountsModal
        visible={linkSubAccountsVisible}
        managerAccount={selectedMCCAccount}
        onClose={() => {
          setLinkSubAccountsVisible(false);
          setSelectedMCCAccount(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default AccountsManagement;
