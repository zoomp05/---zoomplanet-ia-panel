// src/modules/googleAds/graphql/mutations.js
import { gql } from '@apollo/client';
import { GADS_ACCOUNT_FRAGMENT, GADS_CAMPAIGN_FRAGMENT } from './queries';

// ============================================
// MUTATIONS - ACCOUNTS
// ============================================

export const CREATE_GADS_ACCOUNT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation CreateGAdsAccount($input: CreateGAdsAccountInput!) {
    createGAdsAccount(input: $input) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const UPDATE_GADS_ACCOUNT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation UpdateGAdsAccount($id: ID!, $input: UpdateGAdsAccountInput!) {
    updateGAdsAccount(id: $id, input: $input) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const DELETE_GADS_ACCOUNT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation DeleteGAdsAccount($id: ID!) {
    deleteGAdsAccount(id: $id) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const REFRESH_GADS_ACCOUNT_TOKEN = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation RefreshGAdsAccountToken($id: ID!) {
    refreshGAdsAccountToken(id: $id) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const RECONNECT_GADS_ACCOUNT = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation ReconnectGAdsAccount($id: ID!) {
    reconnectGAdsAccount(id: $id) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

export const SYNC_GADS_ACCOUNT_INFO = gql`
  ${GADS_ACCOUNT_FRAGMENT}
  mutation SyncGAdsAccountInfo($id: ID!) {
    syncGAdsAccountInfo(id: $id) {
      success
      message
      account {
        ...GAdsAccountFragment
      }
      errors
    }
  }
`;

// ============================================
// MUTATIONS - CAMPAIGNS
// ============================================

export const CREATE_GADS_CAMPAIGN = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation CreateGAdsCampaign($input: CreateGAdsCampaignInput!) {
    createGAdsCampaign(input: $input) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const UPDATE_GADS_CAMPAIGN = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation UpdateGAdsCampaign($id: ID!, $input: UpdateGAdsCampaignInput!) {
    updateGAdsCampaign(id: $id, input: $input) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const DELETE_GADS_CAMPAIGN = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation DeleteGAdsCampaign($id: ID!) {
    deleteGAdsCampaign(id: $id) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const LINK_GADS_CAMPAIGN_TO_MARKETING = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation LinkGAdsCampaignToMarketing(
    $gAdsCampaignId: ID!
    $marketingCampaignId: ID!
  ) {
    linkGAdsCampaignToMarketing(
      gAdsCampaignId: $gAdsCampaignId
      marketingCampaignId: $marketingCampaignId
    ) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const UNLINK_GADS_CAMPAIGN_FROM_MARKETING = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation UnlinkGAdsCampaignFromMarketing($gAdsCampaignId: ID!) {
    unlinkGAdsCampaignFromMarketing(gAdsCampaignId: $gAdsCampaignId) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;

export const UPDATE_GADS_CAMPAIGN_STATUS = gql`
  ${GADS_CAMPAIGN_FRAGMENT}
  mutation UpdateGAdsCampaignStatus($id: ID!, $status: GAdsCampaignStatus!) {
    updateGAdsCampaignStatus(id: $id, status: $status) {
      success
      message
      campaign {
        ...GAdsCampaignFragment
      }
      errors
    }
  }
`;
