import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilter, $limit: Int, $offset: Int) {
    products(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        name
        slug
        sku
        type
        description
        attributes
        features {
          name
          description
          value
        }
        pricing {
          interval
          amount
          currency
        }
        createdAt
        isDeleted
        updatedAt
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
        totalItems
      }
      totalCount
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ... on Product {
        id
        name
        slug
        sku
        type
        description
        attributes
        features {
          name
          description
          value
        }
        pricing {
          interval
          amount
          currency
        }
        createdAt
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
        resource
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ... on Product {
        id
        name
        slug
        sku
        type
        description
        attributes
        features {
          name
          description
          value
        }
        pricing {
          interval
          amount
          currency
        }
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
        resource
      }
    }
  }
`;

export const SOFT_DELETE_PRODUCT = gql`
  mutation SoftDeleteProduct($id: ID!) {
    softDeleteProduct(id: $id) {
      ... on Product {
        id
        isDeleted
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
        resource
      }
    }
  }
`;

export const RESTORE_PRODUCT = gql`
  mutation RestoreProduct($id: ID!) {
    restoreProduct(id: $id) {
      ... on Product {
        id
        isDeleted
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
        resource
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
