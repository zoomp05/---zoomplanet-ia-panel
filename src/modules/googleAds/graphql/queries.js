// src/modules/googleAds/graphql/queries.js
import { gql } from '@apollo/client';

/**
 * Fragment de cuenta de Google Ads
 */
export const GADS_ACCOUNT_FRAGMENT = gql`
  fragment GAdsAccountFragment on GAdsAccount {
    _id
    customerId
    name
    credentials {
      clientId
      clientSecret
      developerToken
      refreshToken
    }
    hasCredentials
    connectionStatus
    connectionDetails {
      lastConnectedAt
      lastErrorAt
      lastErrorMessage
    }
    settings {
      currency
      timezone
      autoTaggingEnabled
    }
    accountInfo {
      descriptiveName
      managerCustomerId
      canManageClients
      testAccount
    }
    quotas {
      dailyLimit
      remainingQuota
      lastResetAt
    }
    isActive
    createdAt
    updatedAt
    inheritsCredentials
    managerAccount {
      _id
      customerId
      name
    }
    subAccounts {
      _id
      customerId
      name
      inheritsCredentials
      hasCredentials
      managerAccount {
        _id
        name
      }
    }
  }
`;

/**
 * Fragment de campaña
 */
export const GADS_CAMPAIGN_FRAGMENT = gql`
  fragment GAdsCampaignFragment on GAdsCampaign {
    _id
    googleAdsId
    name
    campaignType
    status
    budget {
      dailyBudget
      totalBudget
      currency
    }
    biddingStrategy {
      type
      targetCpa
      targetRoas
    }
    metrics {
      impressions
      clicks
      conversions
      cost
      ctr
      cpc
      cpa
      conversionRate
      lastSyncedAt
    }
    hasMarketingCampaign
    isActive
    createdAt
    updatedAt
  }
`;

// ============================================
// QUERIES - ACCOUNTS
// ============================================

export const GET_GADS_ACCOUNT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  query GetGAdsAccount($id: ID!) {
    gAdsAccount(id: $id) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const GET_GADS_ACCOUNTS = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  query GetGAdsAccounts(
    $filters: GAdsAccountFilters
    $limit: Int
    $offset: Int
  ) {
    gAdsAccounts(filters: $filters, limit: $limit, offset: $offset) {
      edges {
        node {
          ...GAdsAccountFragment
        }
        cursor
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

export const GET_GADS_ACCOUNTS_BY_PROJECT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  query GetGAdsAccountsByProject($projectId: ID!) {
    gAdsAccountsByProject(projectId: $projectId) {
      ...GAdsAccountFragment
    }
  }
`;

export const TEST_GADS_CONNECTION = gql`
  query TestGAdsConnection($accountId: ID!) {
    testGAdsConnection(accountId: $accountId) {
      success
      message
      accountInfo {
        customerId
        name
        descriptiveName
        status
        currency
        timezone
        accountType
        managerCustomerId
        canManageClients
        testAccount
        lastTested
      }
      errors
    }
  }
`;

// ============================================
// QUERIES - CAMPAIGNS
// ============================================

export const GET_GADS_CAMPAIGN = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  query GetGAdsCampaign($id: ID!) {
    gAdsCampaign(id: $id) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const GET_GADS_CAMPAIGNS = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  query GetGAdsCampaigns(
    $filters: GAdsCampaignFilters
    $limit: Int
    $offset: Int
  ) {
    gAdsCampaigns(filters: $filters, limit: $limit, offset: $offset) {
      edges {
        node {
          ...GAdsCampaignFragment
        }
        cursor
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

export const GET_GADS_CAMPAIGNS_BY_MARKETING = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  query GetGAdsCampaignsByMarketingCampaign($marketingCampaignId: ID!) {
    gAdsCampaignsByMarketingCampaign(
      marketingCampaignId: $marketingCampaignId
    ) {
      ...GAdsCampaignFragment
    }
  }
`;

export const SYNC_GADS_CAMPAIGN_METRICS = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  query SyncGAdsCampaignMetrics($id: ID!) {
    syncGAdsCampaignMetrics(id: $id) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;
