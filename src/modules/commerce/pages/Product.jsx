import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../apollo/product';
import ProductList from '../components/product/ProductList';
import ProductModal from '../components/product/ProductModal';
import { Button, Space, message, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const ProductsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    type: null,
    showDeleted: false
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      filter,
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilter(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTypeFilter = (type) => {
    setFilter(prev => ({ ...prev, type }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleModalClose = (refreshList = false) => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    if (refreshList) refetch();
  };

  const handleFilterChange = (newFilters) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      ...newFilters
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };



  return (
    <div className="products-page">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="page-header">
          <div className="page-title">
            <h1>Products</h1>
          </div>
          <Space>
            <Input.Search
              placeholder="Search products..."
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Type"
              allowClear
              onChange={handleTypeFilter}
              style={{ width: 120 }}
            >
              <Select.Option value="PLAN">Plan</Select.Option>
              <Select.Option value="PROJECT">Project</Select.Option>
              <Select.Option value="PHYSIC">Physical</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={loading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create Product
            </Button>
          </Space>
        </div>

        <ProductList
        loading={loading}
        products={data?.products.edges || []}
        filters={filter} // Pass complete filter object
        onFilterChange={handleFilterChange}
        pagination={{
          ...pagination,
          total: data?.products.totalCount || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`
        }}
        onChange={handleTableChange}
        onEdit={handleEdit}
        onRefresh={refetch}
      />

        <ProductModal
          visible={isModalVisible}
          product={selectedProduct}
          onClose={handleModalClose}
        />
      </Space>
    </div>
  );
};

export default ProductsPage;