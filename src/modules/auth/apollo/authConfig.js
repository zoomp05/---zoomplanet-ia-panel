// src/modules/auth/apollo/authConfig.js
import * as ApolloClient from "@apollo/client";
const { gql } = ApolloClient;

export const GET_AUTH_CONFIG = gql`
  query authConfig($accountId: ID!) {
    authConfig(accountId: $accountId) {
      ... on AuthConfig {
        id
        account
        google {
          client_id
          client_secret
          redirect_uri
          scopes
          enabled
        }
        facebook {
          app_id
          app_secret
          redirect_uri
          scopes
          enabled
        }
        jwt {
          secret
          expiration
          refresh_token_expiration
        }
        password_policy {
          min_length
          require_uppercase
          require_lowercase
          require_numbers
          require_symbols
          password_history_limit
          max_login_attempts
          lockout_duration
        }
        two_factor_auth {
          enabled
          method
          issuer
        }
        session {
          timeout
          extend_on_activity
          single_session
        }
        cors {
          allowed_origins
          allow_credentials
        }
        createdAt
        updatedAt
      }
      ... on AuthConfigNotFoundError {
        message
        resource
      }
      ... on AuthConfigValidationError {
        message
        field
      }
    }
  }
`;

export const GET_AUTH_CONFIGS = gql`
  query authConfigs {
    authConfigs {
      id
      account
      google {
        client_id
        enabled
      }
      facebook {
        app_id
        enabled
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_AUTH_CONFIG = gql`
  mutation createAuthConfig($input: CreateAuthConfigInput!) {
    createAuthConfig(input: $input) {
      ... on AuthConfig {
        id
        account
        google {
          client_id
          client_secret
          redirect_uri
          scopes
          enabled
        }
        facebook {
          app_id
          app_secret
          redirect_uri
          scopes
          enabled
        }
        jwt {
          secret
          expiration
          refresh_token_expiration
        }
        password_policy {
          min_length
          require_uppercase
          require_lowercase
          require_numbers
          require_symbols
          password_history_limit
          max_login_attempts
          lockout_duration
        }
        two_factor_auth {
          enabled
          method
          issuer
        }
        session {
          timeout
          extend_on_activity
          single_session
        }
        cors {
          allowed_origins
          allow_credentials
        }
        createdAt
        updatedAt
      }
      ... on AuthConfigValidationError {
        message
        field
      }
    }
  }
`;

export const UPDATE_AUTH_CONFIG = gql`
  mutation updateAuthConfig($id: ID!, $input: UpdateAuthConfigInput!) {
    updateAuthConfig(id: $id, input: $input) {
      ... on AuthConfig {
        id
        account
        google {
          client_id
          client_secret
          redirect_uri
          scopes
          enabled
        }
        facebook {
          app_id
          app_secret
          redirect_uri
          scopes
          enabled
        }
        jwt {
          secret
          expiration
          refresh_token_expiration
        }
        password_policy {
          min_length
          require_uppercase
          require_lowercase
          require_numbers
          require_symbols
          password_history_limit
          max_login_attempts
          lockout_duration
        }
        two_factor_auth {
          enabled
          method
          issuer
        }
        session {
          timeout
          extend_on_activity
          single_session
        }
        cors {
          allowed_origins
          allow_credentials
        }
        createdAt
        updatedAt
      }
      ... on AuthConfigValidationError {
        message
        field
      }
      ... on AuthConfigNotFoundError {
        message
        resource
      }
    }
  }
`;

export const DELETE_AUTH_CONFIG = gql`
  mutation deleteAuthConfig($id: ID!) {
    deleteAuthConfig(id: $id)
  }
`;
