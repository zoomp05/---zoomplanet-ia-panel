import { gql } from "@apollo/client";

export const GET_CONTACTS = gql`
  query GetContacts($filter: ContactFilter, $sort: ContactSort, $limit: Int, $offset: Int) {
    contacts(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      edges {
        id
        email
        name
        type
        status
        phone
        whatsapp
        address
        tags {
          id
          name
          color
        }
        notes
        lastEmailSent
        subscriptionDate
        generatedAt
        isDeleted
        createdAt
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

export const GET_CONTACT_TAGS = gql`
  query GetContactTags($search: String) {
    contactTags(search: $search) {
      id
      name
      color
    }
  }
`;

export const CREATE_CONTACT_TAG = gql`
  mutation CreateContactTag($input: ContactTagInput!) {
    createContactTag(input: $input) {
      id
      name
      color
    }
  }
`;

export const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      ... on Contact {
        id
        email
        name
        type
        status
        phone
        whatsapp
        address
        tags {
          name
          color
        }
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
      }
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) {
      ... on Contact {
        id
        email
        name
        type
        status
        phone
        whatsapp
        address
        tags {
          id
          name
          color
        }
        notes
      }
      ... on ValidationError {
        message
        code
      }
      ... on NotFoundError {
        message
        code
      }
    }
  }
`;

export const DELETE_SOFT_CONTACT = gql`
  mutation SoftDeleteContact($id: ID!) {
    softDeleteContact(id: $id) {
      ... on Contact {
        id
        isDeleted
      }
      ... on NotFoundError {
        message
        code
      }
    }
  }
`;

export const RESTORE_CONTACT = gql`
  mutation RestoreContact($id: ID!) {
    restoreContact(id: $id) {
      ... on Contact {
        id
        isDeleted
      }
      ... on NotFoundError {
        message
        code
      }
    }
  }
`;
