import { gql } from '@apollo/client';

export const GET_CONTACT_GROUPS = gql`
  query GetContactGroups($filter: ContactGroupFilter, $limit: Int, $offset: Int) {
    contactGroups(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        name
        description
        contacts {
          id
          name
          email
        }
        isActive
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

export const GET_CONTACT_GROUP = gql`
  query GetContactGroup($id: ID!) {
    contactGroup(id: $id) {
      ... on ContactGroup {
        id
        name
        description
        contacts {
          id
          name
          email
        }
        isActive
        createdAt
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

export const CREATE_CONTACT_GROUP = gql`
  mutation CreateContactGroup($input: CreateContactGroupInput!) {
    createContactGroup(input: $input) {
      ... on ContactGroup {
        id
        name
        description
        contacts {
          id
          name
          email
        }
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const UPDATE_CONTACT_GROUP = gql`
  mutation UpdateContactGroup($id: ID!, $input: UpdateContactGroupInput!) {
    updateContactGroup(id: $id, input: $input) {
      ... on ContactGroup {
        id
        name
        description
        contacts {
          id
          name
          email
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

export const SOFT_DELETE_CONTACT_GROUP = gql`
  mutation SoftDeleteContactGroup($id: ID!) {
    softDeleteContactGroup(id: $id) {
      ... on ContactGroup {
        id
        isDeleted
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

export const RESTORE_CONTACT_GROUP = gql`
  mutation RestoreContactGroup($id: ID!) {
    restoreContactGroup(id: $id) {
      ... on ContactGroup {
        id
        isDeleted
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

export const ADD_CONTACTS_TO_GROUP = gql`
  mutation AddContactsToGroup($groupId: ID!, $contactIds: [ID!]!) {
    addContactsToGroup(groupId: $groupId, contactIds: $contactIds) {
      ... on ContactGroup {
        id
        name
        contacts {
          id
          name
          email
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

export const REMOVE_CONTACTS_FROM_GROUP = gql`
  mutation RemoveContactsFromGroup($groupId: ID!, $contactIds: [ID!]!) {
    removeContactsFromGroup(groupId: $groupId, contactIds: $contactIds) {
      ... on ContactGroup {
        id
        name
        contacts {
          id
          name
          email
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