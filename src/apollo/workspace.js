// /src/graphql/workspaceQueries.js

import { gql } from '@apollo/client';

// Query para obtener todos los Workspaces
export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      type
      description
      createdAt
      updatedAt
    }
  }
`;

// Mutación para crear un Workspace
export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
      type
      description
      createdAt
      updatedAt
    }
  }
`;

export const GET_WORKSPACE_BY_PROJECT = gql`
  query GetWorkspaceByProject($projectId: ID!) {
    workspacesByProject(projectId: $projectId) {
      id
      name
      description
      project {
        id
        title
      }
      gitConfig {
        repository
        branch
        username
        email
      }
      is_deleted
      createdAt
      updatedAt
    }
  }
`;
