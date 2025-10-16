import React, { useState } from 'react';
import { Table, Space, Button, Tag, Modal, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { SOFT_DELETE_PRODUCT, RESTORE_PRODUCT } from '../../apollo/product';
import { toast } from 'react-hot-toast';

const { confirm } = Modal;

const ProductList = ({ loading, products, filters, pagination, onChange, onEdit, onRefresh, onFilterChange }) => {
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [restoringProductId, setRestoringProductId] = useState(null);

  

  const [softDeleteProduct] = useMutation(SOFT_DELETE_PRODUCT, {
    onCompleted: onRefresh
  });

  const [restoreProduct] = useMutation(RESTORE_PRODUCT, {
    onCompleted: onRefresh
  });

  const handleDelete = (record) => {
    confirm({
      title: "¿Está seguro de eliminar este producto?",
      icon: <ExclamationCircleOutlined />,
      content: `Se eliminará el producto: ${record.name}`,
      okText: "Sí",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        setDeletingProductId(record.id);
        try {
          const { data } = await softDeleteProduct({ 
            variables: { id: record.id }
          });
          if (data.softDeleteProduct.__typename === "NotFoundError") {
            toast.error(data.softDeleteProduct.message);
            return;
          }
          toast.success("Product soft-deleted successfully");
        } catch (error) {
          toast.error("Error soft-deleting product");
        } finally {
          setDeletingProductId(null);
        }
      }
    });
  };

  const handleRestore = async (id) => {
    setRestoringProductId(id);
    try {
      const { data } = await restoreProduct({ variables: { id } });
      if (data?.restoreProduct.__typename === "NotFoundError") {
        toast.error(data.restoreProduct.message);
        return;
      }
      toast.success("Product restored successfully!");
    } catch (error) {
      toast.error("Error restoring product");
    } finally {
      setRestoringProductId(null);
    }
  };

  const handleShowDeletedChange = (checked) => {
    onFilterChange({ 
      ...filters,
      showDeleted: checked 
    });
  };



  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={
          type === 'PLAN' ? 'blue' : 
          type === 'PROJECT' ? 'green' : 
          'orange'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'pricing',
      key: 'pricing',
      render: (pricing) => pricing?.[0]?.amount || 'N/A',
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => 
          filters.showDeleted ? (
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => handleRestore(record.id)}
              loading={restoringProductId === record.id}
            >
              Restore
            </Button>
          ) : (
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                loading={deletingProductId === record.id}
              />
            </Space>
          ),
      },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <span>Show Deleted</span>
        <Switch
          checked={filters.showDeleted}
          onChange={handleShowDeletedChange}
        />
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={products}
        rowKey="id"
        pagination={pagination}
        onChange={onChange}
      />
    </div>
  );
};

export default ProductList;