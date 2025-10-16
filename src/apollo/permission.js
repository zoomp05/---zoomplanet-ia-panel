import { gql } from "@apollo/client";

export const GET_PERMISSIONS = gql`
  query GetPermissions($filter: PermissionFilter) {
    permissions(filter: $filter) {
      edges {
        id
        name
        code
        description
        resource
        action
        conditions
        createdAt
        isDeleted
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
      totalCount
    }
  }
`;

export const GET_PERMISSION = gql`
  query GetPermission($id: ID!) {
    permission(id: $id) {
      id
      name
      code
      description
      resource
      action
      conditions
      isDeleted
    }
  }
`;

export const CREATE_PERMISSION = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      ... on Permission {
        id
        name
        code
        description
        resource
        action
        isDeleted
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const UPDATE_PERMISSION = gql`
  mutation UpdatePermission($id: ID!, $input: UpdatePermissionInput!) {
    updatePermission(id: $id, input: $input) {
      ... on Permission {
        id
        name
        code
        description
        resource
        action
        isDeleted
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const DELETE_PERMISSION = gql`
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id)
  }
`;

export const DELETE_SOFT_PERMISSION = gql`
  mutation DeleteSoftPermission($id: ID!) {
    deleteSoftPermission(id: $id) {
      ... on Permission {
        id
        name
        code
        description
        resource
        action
        isDeleted 
      }
      ... on NotFoundError {
        message
        code
        resource
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const RESTORE_PERMISSION = gql`
  mutation RestorePermission($id: ID!) {
    restorePermission(id: $id) {
      ... on Permission {
        id
        name
        code
        description
        resource
        action
        isDeleted 
      }
      ... on NotFoundError {
        message
        code
        resource
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

