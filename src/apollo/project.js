// apollo/project.js
import { gql } from '@apollo/client';

// Fragments
export const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    title
    description
    type
    typeInfo {
      key
      label
      description
      metadata
    }
    openai_key
    project {
      id
      title
    }
    is_deleted
    createdAt
    updatedAt
  }
`;

// Fragments para los tipos de error
const ERROR_FIELDS = gql`
  fragment ValidationErrorFields on ValidationError {
    message
    code
    field
  }

  fragment NotFoundErrorFields on NotFoundError {
    message
    code
    resource
  }
`;

// Queries
export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      ... on Project {
        ...ProjectFields
      }
      ... on ValidationError {
        ...ValidationErrorFields
      }
      ... on NotFoundError {
        ...NotFoundErrorFields
      }
    }
  }
  ${PROJECT_FIELDS}
  ${ERROR_FIELDS}
`;

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    projects(page: 1, pageSize: 10) {
      items {
        ...ProjectFields
      }
      totalItems
    }
    workers(active: true) {
      id
      name
      model
      instructions
      tools
      openai_files_ids {
        id
      }
    }
  }
  ${PROJECT_FIELDS}
`;

export const GET_RECENT_PROJECTS = gql`
  query GetRecentProjects {
    projects(page: 1, pageSize: 5) {
      items {
        ...ProjectFields
      }
    }
  }
  ${PROJECT_FIELDS}
`;

// Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      ... on Project {
        ...ProjectFields
      }
      ... on ValidationError {
        ...ValidationErrorFields
      }
    }
  }
  ${PROJECT_FIELDS}
  ${ERROR_FIELDS}
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      ... on Project {
        ...ProjectFields
      }
      ... on ValidationError {
        ...ValidationErrorFields
      }
      ... on NotFoundError {
        ...NotFoundErrorFields
      }
    }
  }
  ${PROJECT_FIELDS}
  ${ERROR_FIELDS}
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const RESTORE_PROJECT = gql`
  mutation RestoreProject($id: ID!) {
    restoreProject(id: $id) {
      ... on Project {
        ...ProjectFields
      }
      ... on NotFoundError {
        ...NotFoundErrorFields
      }
    }
  }
  ${PROJECT_FIELDS}
  ${ERROR_FIELDS}
`;

export const DUPLICATE_PROJECT = gql`
  mutation DuplicateProject($id: ID!) {
    duplicateProject(id: $id) {
      ... on Project {
        ...ProjectFields
      }
      ... on ValidationError {
        ...ValidationErrorFields
      }
      ... on NotFoundError {
        ...NotFoundErrorFields
      }
    }
  }
  ${PROJECT_FIELDS}
  ${ERROR_FIELDS}
`;

// Query con filtros y paginación
export const GET_PROJECTS = gql`
  query GetProjects(
    $page: Int = 1,
    $pageSize: Int = 10,
    $filter: ProjectFilterInput,
    $sortField: String,
    $sortOrder: SortOrder
  ) {
    projects(
      page: $page,
      pageSize: $pageSize,
      filter: $filter,
      sortField: $sortField,
      sortOrder: $sortOrder
    ) {
      items {
        ...ProjectFields
      }
      totalItems
      totalPages
      currentPage
      pageSize
      hasNextPage
      hasPreviousPage
    }
  }
  ${PROJECT_FIELDS}
`;