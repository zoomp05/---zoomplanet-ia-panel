/**
 * GraphQL Queries para Google Ads Campaigns
 */

import { gql } from '@apollo/client';

/**
 * Fragmento de campos de campaña
 */
export const CAMPAIGN_FIELDS = gql`
  fragment CampaignFields on GAdsCampaign {
    _id
    name
    googleAdsId
    status
    campaignType
    isActive
    budget {
      dailyBudget
      totalBudget
      currency
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
    account {
      _id
      name
      customerId
    }
    marketingCampaign {
      _id
      name
    }
    createdAt
    updatedAt
  }
`;

/**
 * Query: Obtener listado de campañas
 */
export const GET_CAMPAIGNS = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaigns(
    $filters: GAdsCampaignFilters
    $limit: Int
    $offset: Int
  ) {
    gAdsCampaigns(filters: $filters, limit: $limit, offset: $offset) {
      edges {
        node {
          ...CampaignFields
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

/**
 * Query: Obtener una campaña por ID
 */
export const GET_CAMPAIGN = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaign($id: ID!) {
    gAdsCampaign(id: $id) {
      success
      message
      campaign {
        ...CampaignFields
        targeting {
          locations
          languages
          demographics
          keywords
        }
        adGroups {
          id
          name
          status
        }
      }
      errors
    }
  }
`;

/**
 * Query: Obtener campañas por cuenta
 */
export const GET_CAMPAIGNS_BY_ACCOUNT = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaignsByAccount($accountId: ID!, $limit: Int, $offset: Int) {
    gAdsCampaigns(
      filters: { accountId: $accountId }
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          ...CampaignFields
        }
      }
      pageInfo {
        totalPages
        currentPage
        hasNextPage
        totalItems
      }
      totalCount
    }
  }
`;

/**
 * Query: Obtener campañas vinculadas a campaña de marketing
 */
export const GET_CAMPAIGNS_BY_MARKETING = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaignsByMarketing($marketingCampaignId: ID!) {
    gAdsCampaignsByMarketingCampaign(marketingCampaignId: $marketingCampaignId) {
      ...CampaignFields
    }
  }
`;

/**
 * Mutation: Sincronizar métricas de una campaña
 */
export const SYNC_CAMPAIGN_METRICS = gql`
  ${CAMPAIGN_FIELDS}
  mutation SyncCampaignMetrics($id: ID!) {
    syncGAdsCampaignMetrics(id: $id) {
      success
      message
      campaign {
        ...CampaignFields
      }
      errors
    }
  }
`;

/**
 * Mutation: Actualizar estado de campaña
 */
export const UPDATE_CAMPAIGN_STATUS = gql`
  ${CAMPAIGN_FIELDS}
  mutation UpdateCampaignStatus($id: ID!, $status: String!) {
    updateGAdsCampaignStatus(id: $id, status: $status) {
      success
      message
      campaign {
        ...CampaignFields
      }
      errors
    }
  }
`;

/**
 * Mutation: Importar campañas desde Google Ads
 */
export const IMPORT_CAMPAIGNS_FROM_GOOGLE_ADS = gql`
  ${CAMPAIGN_FIELDS}
  mutation ImportCampaignsFromGoogleAds(
    $accountId: ID!
    $projectId: ID!
  ) {
    importCampaignsFromGoogleAds(
      accountId: $accountId
      projectId: $projectId
    ) {
      success
      message
      campaigns {
        ...CampaignFields
      }
      errors
    }
  }
`;

/**
 * Mutation: Crear campaña en Google Ads
 */
export const CREATE_CAMPAIGN = gql`
  ${CAMPAIGN_FIELDS}
  mutation CreateCampaign($input: CreateGAdsCampaignInput!) {
    createGAdsCampaign(input: $input) {
      success
      message
      campaign {
        ...CampaignFields
      }
      errors
    }
  }
`;

/**
 * Mutation: Actualizar campaña
 */
export const UPDATE_CAMPAIGN = gql`
  ${CAMPAIGN_FIELDS}
  mutation UpdateCampaign($id: ID!, $input: UpdateGAdsCampaignInput!) {
    updateGAdsCampaign(id: $id, input: $input) {
      success
      message
      campaign {
        ...CampaignFields
      }
      errors
    }
  }
`;

/**
 * Mutation: Eliminar campaña
 */
export const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteGAdsCampaign(id: $id) {
      success
      message
      errors
    }
  }
`;
