import { gql } from "@apollo/client";

export const GET_THREADS = gql`
  query GetThreads($taskId: ID!) {
    threads(taskId: $taskId) {
      id
      name
      worker {
        id
        name
      }
      messageCount
      createdAt
    }
  }
`;

export const CREATE_THREAD = gql`
  mutation CreateThread($input: ThreadInput!) {
    createThread(input: $input) {
      success
      thread {
        id
        name
        worker {
          id
          name
        }
        messageCount
        createdAt
      }
      error
    }
  }
`;

export const UPDATE_THREAD = gql`
  mutation UpdateThread($id: ID!, $input: UpdateThreadInput!) {
    updateThread(id: $id, input: $input) {
      success
      thread {
        id
        name
        worker {
          id
          name
        }
        messageCount
        createdAt
      }
      error
    }
  }
`;