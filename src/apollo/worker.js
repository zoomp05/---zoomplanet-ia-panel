import { gql } from "@apollo/client";

export const GET_WORKER = gql`
  query GetWorker($id: ID!) {
    worker(id: $id) {
      __typename
      ... on Worker {
        id
        name
        instructions
        model
        tools
        openai_id
        openai_files_ids {
          id
        }
      }
      ... on NotFoundError {
        message
        code
        resource
      }
      ... on ValidationError {
        message
        code
        field
      }
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($input: CreateWorkerInput!) {
    createWorker(input: $input) {
      __typename
      ... on Worker {
        id
        name
        instructions
        model
        tools
        openai_id
      }
      ... on ValidationError {
        message
        code
        field
      }
    }
  }
`;

export const UPDATE_WORKER = gql`
  mutation UpdateWorker($id: ID!, $input: UpdateWorkerInput!) {
    updateWorker(id: $id, input: $input) {
      __typename
      ... on Worker {
        id
        name
        instructions
        model
        tools
        openai_id
        openai_files_ids {
          id
        }
      }
      ... on ValidationError {
        message
        code
        field
      }
      ... on NotFoundError {
        message
        code
        resource
      }
    }
  }
`;
