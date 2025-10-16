import { gql } from "@apollo/client";

export const GET_NEWSLETTER_CONFIGS = gql`
  query GetNewsletterConfigs($filter: NewsletterConfigFilter) {
    newsletterConfigs(filter: $filter) {
      id
      defaultFromEmail
      defaultFromName
      baseUrl
      smtpConfig {
        host
        port
        secure
        auth {
          user
          pass
        }
      }
      rateLimits {
        maxPerMinute
        maxPerHour
        maxPerDay
      }
      isActive
      isDefault
      entityType
      entityId 
      signature
      footer
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_NEWSLETTER_CONFIG = gql`
  mutation DeleteNewsletterConfig($id: ID!) {
    deleteNewsletterConfig(id: $id) {
      ... on NewsletterConfig {
        id
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

export const CREATE_NEWSLETTER_CONFIG = gql`
  mutation CreateNewsletterConfig($input: CreateNewsletterConfigInput!) {
    createNewsletterConfig(input: $input) {
      ... on NewsletterConfig {
        id
        defaultFromEmail
        defaultFromName
        baseUrl
        smtpConfig {
          host
          port
          secure
          auth {
            user
            pass
          }
        }
        rateLimits {
          maxPerMinute
          maxPerHour
          maxPerDay
        }
        isActive
        isDefault
        entityType
        entityId
        createdAt
        signature
        footer
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const UPDATE_NEWSLETTER_CONFIG = gql`
  mutation UpdateNewsletterConfig(
    $id: ID!
    $input: UpdateNewsletterConfigInput!
  ) {
    updateNewsletterConfig(id: $id, input: $input) {
      ... on NewsletterConfig {
        id
        defaultFromEmail
        defaultFromName
        baseUrl
        smtpConfig {
          host
          port
          secure
          auth {
            user
            pass
          }
        }
        rateLimits {
          maxPerMinute
          maxPerHour
          maxPerDay
        }
        isActive
        isDefault
        entityType
        entityId
        createdAt
        signature
        footer
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

export const TEST_SMTP_CONNECTION = gql`
  mutation TestSmtpConnection($input: SmtpTestConnectionInput!) {
    testSmtpConnection(input: $input) {
      success
      message
    }
  }
`;