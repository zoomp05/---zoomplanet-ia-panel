// src/apollo/role.js
import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query Roles($filter: RoleFilter, $limit: Int, $offset: Int) {
    roles(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        name
        description
        permissions {
          id
          name
          description
          code
          resource
          action
        }
        isSystem
        scope
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
        totalItems
      }
      totalCount
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($input: RoleInput!) {
    createRole(input: $input) {
      ... on Role {
        # Inline fragment
        id
        name
        description
        permissions {
          id
          name
        }
        isSystem
        scope
        createdAt
        updatedAt
      }
      ... on ValidationError {
        # Error handling
        message
        code
      }
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $input: RoleInput!) {
    updateRole(id: $id, input: $input) {
      ... on Role {
        id
        name
        description
        permissions {
          id
          name
        }
        isSystem
        scope
        createdAt
        updatedAt
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const DELETE_SOFT_ROLE = gql`
  mutation DeleteSoftRole($id: ID!) {
    deleteSoftRole(id: $id) {
      ... on Role {
        id
        name
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

export const RESTORE_ROLE = gql`
  mutation RestoreRole($id: ID!) {
    restoreRole(id: $id) {
      ... on Role {
        id
        name
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