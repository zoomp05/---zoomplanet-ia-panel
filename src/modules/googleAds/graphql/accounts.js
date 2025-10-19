/**
 * GraphQL Queries para Google Ads Accounts
 */

import { gql } from '@apollo/client';

/**
 * Fragmento de campos de cuenta
 */
export const ACCOUNT_FIELDS = gql`
  fragment AccountFields on GAdsAccount {
    _id
    name
    customerId
    isActive
    connectionStatus
    hasCredentials
    inheritsCredentials
    connectionDetails {
      lastConnectedAt
      lastErrorAt
      lastErrorMessage
    }
    createdAt
    updatedAt
  }
`;

/**
 * Query: Obtener listado de cuentas
 */
export const GET_ACCOUNTS = gql`
  ${ACCOUNT_FIELDS}
  query GetAccounts($filters: GAdsAccountFilters) {
    gAdsAccounts(filters: $filters) {
      edges {
        node {
          ...AccountFields
        }
      }
      pageInfo {
        totalItems
      }
      totalCount
    }
  }
`;

/**
 * Query: Obtener una cuenta por ID
 */
export const GET_ACCOUNT = gql`
  ${ACCOUNT_FIELDS}
  query GetAccount($id: ID!) {
    gAdAccount(id: $id) {
      success
      message
      account {
        ...AccountFields
        accountInfo {
          descriptiveName
          currencyCode
          timeZone
          isManager
        }
      }
      errors
    }
  }
`;

/**
 * Query: Obtener cuentas activas conectadas
 */
export const GET_CONNECTED_ACCOUNTS = gql`
  ${ACCOUNT_FIELDS}
  query GetConnectedAccounts {
    gAdsAccounts(filters: { isActive: true }) {
      edges {
        node {
          ...AccountFields
          managerAccount {
            _id
            name
            customerId
          }
          subAccounts {
            ...AccountFields
            managerAccount {
              _id
              name
              customerId
            }
          }
        }
      }
      totalCount
    }
  }
`;

/**
 * Query: Obtener subcuentas de una cuenta MCC
 */
export const GET_SUB_ACCOUNTS = gql`
  ${ACCOUNT_FIELDS}
  query GetSubAccounts($managerAccountId: ID!, $includeInactive: Boolean) {
    gAdsSubAccounts(managerAccountId: $managerAccountId, includeInactive: $includeInactive) {
      ...AccountFields
    }
  }
`;

/**
 * Mutation: Probar conexión de cuenta
 */
export const TEST_ACCOUNT_CONNECTION = gql`
  mutation TestAccountConnection($id: ID!) {
    testGAdAccountConnection(id: $id) {
      success
      message
      connectionDetails {
        isConnected
        accountInfo {
          descriptiveName
          customerId
        }
      }
      errors
    }
  }
`;
