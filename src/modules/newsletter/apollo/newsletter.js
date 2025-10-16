import { gql } from "@apollo/client";

export const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      edges {
        id
        email
        name
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
        totalItems 
      }
    }
  }
`;

export const GET_NEWSLETTERS = gql`
  query GetNewsletters($filter: NewsletterFilter, $limit: Int, $offset: Int) {
    newsletters(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        name
        subject
        status
        schedule {
          startDate
          endDate
        }
        plainText
        createdAt
        isDeleted
        updatedAt
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
        totalItems
      }
      totalCount
    }
  }
`;

export const GET_NEWSLETTER = gql`
  query GetNewsletter($id: ID!) {
    newsletter(id: $id) {
      ... on Newsletter {
        id
        name
        subject
        content
        status
        schedule {
          startDate
          endDate
          interval
          timezone
        }
        plainText
        isActive
        createdAt
      }
    }
  }
`;

export const SOFT_DELETE_NEWSLETTER = gql`
  mutation SoftDeleteNewsletter($id: ID!) {
    softDeleteNewsletter(id: $id) {
      ... on Newsletter {
        id
        isActive
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const CREATE_NEWSLETTER = gql`
  mutation CreateNewsletter($input: CreateNewsletterInput!) {
    createNewsletter(input: $input) {
      ... on Newsletter {
        id
        name
        subject
        status
        schedule {
          startDate
          endDate
        }
        plainText
        isActive
        createdAt
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const UPDATE_NEWSLETTER = gql`
  mutation UpdateNewsletter($id: ID!, $input: UpdateNewsletterInput!) {
    updateNewsletter(id: $id, input: $input) {
      ... on Newsletter {
        id
        name
        subject
        status
        schedule {
          startDate
          endDate
        }
        content
        plainText
        isActive
        createdAt
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;


