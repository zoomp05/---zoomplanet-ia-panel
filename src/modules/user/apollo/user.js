// src/apollo/user.js
import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query users($filter: UserFilter, $limit: Int, $offset: Int) {
    users(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        email
        status
        profile {
          firstName
          lastName
          phone
          timezone
          bio
        }
        role {
          id
          name
        }
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser($input: UserInput!) {
    createUser(input: $input) {
      ... on User {
        id
        email
        status
        profile {
          firstName
          lastName
          phone
          timezone
          bio
        }
        role {
          id
          name
        }
        createdAt
        updatedAt
      }
      ... on ValidationError {
        message
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      ... on User {
        id
        email
        status
        profile {
          firstName
          lastName
          phone
          timezone
          bio
        }
        role {
          id
          name
        }
        createdAt
        updatedAt
      }
      ... on ValidationError {
        message
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: ID!, $input: UserProfileInput!) {
    updateUserProfile(id: $id, input: $input) {
      ... on User {
        id
        email
        status
        profile {
          firstName
          lastName
          phone
          timezone
          bio
        }
        role {
          id
          name
        }
        createdAt
        updatedAt
      }
      ... on ValidationError {
        message
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;

export const DELETE_SOFT_USER = gql`
  mutation deleteSoftUser($id: ID!) {
    deleteSoftUser(id: $id) {
      ... on User {
        id
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;

export const RESTORE_USER = gql`
  mutation restoreUser($id: ID!) {
    restoreUser(id: $id) {
      ... on User {
        id
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;

export const CHANGE_USER_PASSWORD = gql`
  mutation changeUserPassword($id: ID!, $input: ChangePasswordInput!) {
    changeUserPassword(id: $id, input: $input) {
      ... on User {
        id
      }
      ... on ValidationError {
        message
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;
