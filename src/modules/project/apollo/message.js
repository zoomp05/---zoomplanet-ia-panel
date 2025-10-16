import { gql } from '@apollo/client';

export const GET_THREAD_MESSAGES = gql`
  query GetThreadMessages($threadId: ID!, $limit: Int, $before: DateTime) {
    messages(threadId: $threadId, limit: $limit, before: $before) {
      id
      threadId
      role
      content
      contextFiles {
        id
        name
        type
        metadata
      }
      outputFiles {
        id
        name
        type
        metadata
      }
      createdAt
      updatedAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: MessageInput!) {
    createMessage(input: $input) {
      success
      message {
        id
        threadId
        role
        content
        contextFiles {
          id
          name
          type
          metadata
        }
        outputFiles {
          id
          name
          type
          metadata
        }
        createdAt
        updatedAt
      }
      error
    }
  }
`;