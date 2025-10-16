// apollo/campaignBrief.js
import { gql } from '@apollo/client';

// === CAMPAIGN BRIEF FRAGMENTS === //

export const CAMPAIGN_BRIEF_FIELDS = gql`
  fragment CampaignBriefFields on CampaignBrief {
    id
    name
    description
    objectives
    targetAudience
    keyMessages
    toneOfVoice
    budget
    timeline
    constraints
    successMetrics
    version {
      major
      minor
      patch
      full
    }
    changeHistory {
      version
      timestamp
      description
      changeType
    }
    aiGenerated
    aiGenerationInfo {
      model
      generatedAt
      processingTime
      cost
    }
    qualityScore
    tags
    isActive
    createdAt
    updatedAt
    createdBy {
      id
      email
      profile {
        firstName
        lastName
      }
    }
  }
`;

// === CAMPAIGN BRIEF QUERIES === //

export const GET_CAMPAIGN_BRIEFS = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  query GetCampaignBriefs($filter: VersionedDocumentFilter, $pagination: PaginationInput, $sort: SortInput) {
    campaignBriefs(filter: $filter, pagination: $pagination, sort: $sort) {
      nodes {
        ...CampaignBriefFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_CAMPAIGN_BRIEF = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  query GetCampaignBrief($id: ID!) {
    campaignBrief(id: $id) {
      ...CampaignBriefFields
    }
  }
`;

export const GET_CAMPAIGN_BRIEF_VERSIONS = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  query GetCampaignBriefVersions($id: ID!) {
    campaignBriefVersions(id: $id) {
      ...CampaignBriefFields
    }
  }
`;

// === CAMPAIGN BRIEF MUTATIONS === //

export const CREATE_CAMPAIGN_BRIEF = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  mutation CreateCampaignBrief($input: CampaignBriefInput!) {
    createCampaignBrief(input: $input) {
      ...CampaignBriefFields
    }
  }
`;

export const UPDATE_CAMPAIGN_BRIEF = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  mutation UpdateCampaignBrief($id: ID!, $input: CampaignBriefInput!) {
    updateCampaignBrief(id: $id, input: $input) {
      ...CampaignBriefFields
    }
  }
`;

export const DELETE_CAMPAIGN_BRIEF = gql`
  mutation DeleteCampaignBrief($id: ID!) {
    deleteCampaignBrief(id: $id)
  }
`;

// === AI GENERATION MUTATIONS === //

export const GENERATE_CAMPAIGN_BRIEF = gql`
  mutation GenerateCampaignBrief($input: CampaignBriefInput!, $options: AIGenerationInput) {
    generateCampaignBrief(input: $input, options: $options) {
      success
      message
      data
      metadata {
        model
        processingTime
        tokensUsed
        cost
      }
    }
  }
`;

// === VERSION CONTROL === //

export const CREATE_BRIEF_VERSION = gql`
  mutation CreateBriefVersion($documentId: ID!, $description: String!) {
    createVersion(documentId: $documentId, documentType: CAMPAIGN_BRIEF, description: $description)
  }
`;

export const ROLLBACK_BRIEF_VERSION = gql`
  mutation RollbackBriefVersion($documentId: ID!, $targetVersion: String!) {
    rollbackVersion(documentId: $documentId, documentType: CAMPAIGN_BRIEF, targetVersion: $targetVersion)
  }
`;

// === CONTENT IMPROVEMENT === //

export const IMPROVE_BRIEF_CONTENT = gql`
  mutation ImproveBriefContent($documentId: ID!, $improvements: [ImprovementInput!]!, $options: AIGenerationInput) {
    improveContent(documentId: $documentId, documentType: CAMPAIGN_BRIEF, improvements: $improvements, options: $options) {
      success
      message
      data
      improvements {
        type
        description
        implementation
      }
    }
  }
`;
