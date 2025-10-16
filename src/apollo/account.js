// apollo/Account.js
import { gql } from '@apollo/client';

export const ACCOUNT_FRAGMENT = gql`
  fragment AccountFields on Account {
    id
    name
    slug
    description
    type
    status
    maxMembers
    maxProjects
    owner {
      id
      email
      profile {
        firstName
        lastName
      }
    }
    subscription {
      plan
      status
      startDate
      endDate
    }
    members {
      id
      role
      status
      joinedAt
    }
    createdAt
    updatedAt
  }
`;
export const GET_ACCOUNTS = gql`
  query GetAccounts(
    $filter: AccountFilter
    $limit: Int
    $offset: Int
  ) {
    accounts(
      filter: $filter
      limit: $limit
      offset: $offset
    ) {
      edges {
        ...AccountFields
      }
      totalCount
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
        totalItems
      }
    }
  }
  ${ACCOUNT_FRAGMENT}
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      ... on Account {
        ...AccountFields
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
  ${ACCOUNT_FRAGMENT}
`;


  export const UPDATE_ACCOUNT = gql`
    mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
      updateAccount(id: $id, input: $input) {
        ... on Account {
          ...AccountFields
        }
        ... on ValidationError {
          message
          code
        }
      }
    }
    ${ACCOUNT_FRAGMENT}
  `;

  export const DELETE_ACCOUNT = gql`
    mutation DeleteAccount($id: ID!) {
      deleteAccount(id: $id)
    }
  `;