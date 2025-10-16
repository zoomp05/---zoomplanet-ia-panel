import { gql } from '@apollo/client';

// Query to get directory contents by workspace ID and parent ID
export const GET_DIRECTORY_CONTENTS = gql`
  query GetDirectoryContents($workspaceId: ID!, $parentId: ID) {
    directoryContents(workspaceId: $workspaceId, parentId: $parentId) {
      directories {
        id
        name
        path
        hasChildren
        parentDirectory {
          id
        }
      }
      files {
        id
        name
        path
        size
        type
      }
    }
  }
`;

// Mutation to create a new directory
export const CREATE_DIRECTORY = gql`
  mutation CreateDirectory($input: CreateDirectoryInput!) {
    createDirectory(input: $input) {
      id
      name
      path
      parentDirectory {
        id
        name
      }
      workspace {
        id
        name
      }
      is_deleted
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update an existing directory
export const UPDATE_DIRECTORY = gql`
  mutation UpdateDirectory($id: ID!, $input: UpdateDirectoryInput!) {
    updateDirectory(id: $id, input: $input) {
      id
      name
      path
      parentDirectory {
        id
      }
      workspace {
        id
        name
      }
    }
  }
`;

// Mutation to delete a directory
export const DELETE_DIRECTORY = gql`
  mutation DeleteDirectory($id: ID!, $permanent: Boolean!) {
    deleteDirectory(id: $id, permanent: $permanent)
  }
`;

// Mutation to restore a directory
export const RESTORE_DIRECTORY = gql`
  mutation RestoreDirectory($id: ID!) {
    restoreDirectory(id: $id)
  }
`;

// Mutation to upload directory structure
export const UPLOAD_DIRECTORY_STRUCTURE = gql`
  mutation UploadDirectoryStructure($workspaceId: ID!, $files: [Upload!]!, $paths: [String!]!) {
    uploadDirectoryStructure(workspaceId: $workspaceId, files: $files, paths: $paths) {
      success
      message
      directories {
        id
        name
        path
        parentDirectory {
          id
          name
        }
      }
    }
  }
`;
