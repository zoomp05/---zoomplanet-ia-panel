import { gql } from '@apollo/client';

export const GET_CAMPAIGNS = gql`
  query GetCampaigns($filter: CampaignFilter, $limit: Int, $offset: Int) {
    campaigns(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        id
        name
        description
        status
        stats {
          totalSent
          opened
          clicked
          bounced
        }
        newsletters {
          id
          name
        }
        contactGroups {
          id
          name
        }
        targetTags
        startDate
        endDate
        sendRandomly
        interval
        isDeleted
        createdAt
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

export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      name
      description
      newsletters {
        id
        name
      }
      contactGroups {
        id
        name
      }
      targetTags
      status
      startDate
      endDate
      sendRandomly
      interval
      stats {
        totalSent
        opened
        clicked
        bounced
      }
    }
  }
`;

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CreateCampaignInput!) {
    createCampaign(input: $input) {
      ... on Campaign {
        id
        name
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: UpdateCampaignInput!) {
    updateCampaign(id: $id, input: $input) {
      ... on Campaign {
        id
        name
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;

export const SOFT_DELETE_CAMPAIGN = gql`
  mutation SoftDeleteCampaign($id: ID!) {
    softDeleteCampaign(id: $id) {
      ... on Campaign {
        id
        isDeleted
      }
      ... on ValidationError {
        message
        code
      }
    }
  }
`;