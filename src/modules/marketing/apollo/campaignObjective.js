// apollo/campaignObjective.js
import { gql } from '@apollo/client';

// === CAMPAIGN OBJECTIVE FRAGMENTS === //

export const CAMPAIGN_OBJECTIVE_FIELDS = gql`
  fragment CampaignObjectiveFields on CampaignObjective {
    id
    campaign { id name }
    name
    description
    type
    targetValue
    currentValue
    unit
    progress
    priority
    dueDate
    isCompleted
    completedAt
    kpiMapping { primaryKpi secondaryKpis calculationMethod }
    milestones { name value targetDate isCompleted completedAt }
    automationTriggers
    isOverdue
    daysRemaining
    progressPercentage
    isDeleted
    createdAt
    updatedAt
  }
`;

// === CAMPAIGN OBJECTIVE QUERIES === //

export const GET_CAMPAIGN_OBJECTIVES = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  query GetCampaignObjectives($campaignId: ID!) {
    campaignObjectives(campaignId: $campaignId) {
      ...CampaignObjectiveFields
    }
  }
`;

export const GET_CAMPAIGN_OBJECTIVE = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  query GetCampaignObjective($id: ID!) {
    campaignObjective(id: $id) {
      ...CampaignObjectiveFields
    }
  }
`;

// === CAMPAIGN OBJECTIVE MUTATIONS === //

export const CREATE_CAMPAIGN_OBJECTIVE = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  mutation CreateCampaignObjective($input: CreateObjectiveInput!) {
    createCampaignObjective(input: $input) {
      ...CampaignObjectiveFields
    }
  }
`;

export const UPDATE_CAMPAIGN_OBJECTIVE = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  mutation UpdateCampaignObjective($id: ID!, $input: UpdateObjectiveInput!) {
    updateCampaignObjective(id: $id, input: $input) {
      ...CampaignObjectiveFields
    }
  }
`;

export const DELETE_CAMPAIGN_OBJECTIVE = gql`
  mutation DeleteCampaignObjective($id: ID!) {
    deleteCampaignObjective(id: $id) {
      success
      message
    }
  }
`;

export const COMPLETE_CAMPAIGN_OBJECTIVE = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  mutation CompleteObjective($id: ID!) {
    completeObjective(id: $id) {
      ...CampaignObjectiveFields
    }
  }
`;

export const UPDATE_OBJECTIVE_PROGRESS = gql`
  ${CAMPAIGN_OBJECTIVE_FIELDS}
  mutation UpdateObjectiveProgress($id: ID!, $progress: Float!) {
    updateObjectiveProgress(id: $id, progress: $progress) {
      ...CampaignObjectiveFields
    }
  }
`;
