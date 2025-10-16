// apollo/marketingCampaign.js - CLEAN VERSION
import { gql } from '@apollo/client';

// === MARKETING CAMPAIGN FRAGMENTS === //

export const MARKETING_CAMPAIGN_FIELDS = gql`
  fragment MarketingCampaignFields on MarketingCampaign {
    id
    name
    description
    type
    status
    priority
    dates {
      startDate
      endDate
      actualStartDate
      actualEndDate
      duration
      daysRemaining
      timezone
    }
    budget {
      total
      allocated
      spent
      remaining
      type
      dailyLimit
      currency
      utilization
      projectedSpend
      isOverBudget
    }
    targetAudience {
      demographics
      interests
      behaviors
      customSegments
      lookalikeSources
      excludedAudiences
      estimatedReach
      audienceSize
    }
    goals {
      primary
      secondary
      kpis
      targetMetrics
      achievedMetrics
      progressPercentage
    }
    channels
    tags
    isActive
    aiSettings {
      enabled
      autoOptimization
      smartBidding
      audienceInsights
      contentGeneration
      performancePrediction
      optimizationGoals
      automationLevel
      learningMode
      model
      parameters
    }
    integration {
      platform
      platforms
      accountId
      campaignId
      status
      lastSync
      settings
      syncSettings
      webhooks
    }
    performance {
      overall
      roi
      conversionRate
      costPerLead
      engagement
      reach
      byChannel
      byAudience
      byTimeframe
      insights
      recommendations
    }
    # Performance metrics
    impressions
    clicks
    conversions
    cost
    revenue
    # Calculated fields
    ctr
    cpc
    cpm
    conversionRate
    roi
    roas
    # Additional fields
    kpis
    notes
    progressPercentage
    # Relations count
    leadSourcesCount
    automationRulesCount
    objectivesCount
    mediaAssetsCount
    # Status fields
    isCompleted
    isExpired
    isOverBudget
    performanceScore
    healthScore
    # Meta
    createdBy {
      id
      email
      profile {
        firstName
        lastName
      }
    }
    isDeleted
    createdAt
    updatedAt
  }
`;

// === MARKETING CAMPAIGN QUERIES === //

export const GET_MARKETING_CAMPAIGNS = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetMarketingCampaigns(
    $filter: CampaignFilterInput
    $pagination: PaginationInput
    $sort: SortInput
  ) {
    marketingCampaigns(filter: $filter, pagination: $pagination, sort: $sort) {
      campaigns {
        ...MarketingCampaignFields
      }
      pagination {
        page
        limit
        hasNextPage
      }
    }
  }
`;

export const GET_MARKETING_CAMPAIGN = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetMarketingCampaign($id: ID!) {
    marketingCampaign(id: $id) {
      ...MarketingCampaignFields
    }
  }
`;

export const GET_CAMPAIGN_DASHBOARD = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetCampaignDashboard($campaignId: ID!) {
    campaignDashboard(campaignId: $campaignId) {
      campaign {
        ...MarketingCampaignFields
      }
      metrics {
        impressions
        clicks
        conversions
        cost
        revenue
        ctr
        cpc
        cpm
        conversionRate
        roi
        roas
      }
      objectives {
        id
        title
        description
        targetValue
        currentValue
        isCompleted
        progress
      }
      overallProgress
      activeAutomationRules
      performance {
        roi
        conversionRate
        costPerLead
        engagement
      }
    }
  }
`;

export const GET_CAMPAIGNS_BY_STATUS = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetCampaignsByStatus($status: MarketingCampaignStatus!, $limit: Int) {
    campaignsByStatus(status: $status, limit: $limit) {
      ...MarketingCampaignFields
    }
  }
`;

export const GET_ACTIVE_CAMPAIGNS = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetActiveCampaigns {
    activeCampaigns {
      ...MarketingCampaignFields
    }
  }
`;

export const GET_CAMPAIGN_PERFORMANCE = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetCampaignPerformance($campaignId: ID!, $dateRange: DateRangeInput) {
    campaignPerformance(campaignId: $campaignId, dateRange: $dateRange) {
      ...MarketingCampaignFields
    }
  }
`;

// === MARKETING CAMPAIGN MUTATIONS === //

export const CREATE_MARKETING_CAMPAIGN = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation CreateMarketingCampaign($input: CreateMarketingCampaignInput!) {
    createMarketingCampaign(input: $input) {
      ...MarketingCampaignFields
    }
  }
`;

export const UPDATE_MARKETING_CAMPAIGN = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation UpdateMarketingCampaign($id: ID!, $input: UpdateMarketingCampaignInput!) {
    updateMarketingCampaign(id: $id, input: $input) {
      ...MarketingCampaignFields
    }
  }
`;

export const DELETE_MARKETING_CAMPAIGN = gql`
  mutation DeleteMarketingCampaign($id: ID!) {
    deleteMarketingCampaign(id: $id) {
      success
      message
    }
  }
`;

export const TOGGLE_CAMPAIGN_STATUS = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation ToggleCampaignStatus($id: ID!, $isActive: Boolean!) {
    toggleCampaignStatus(id: $id, isActive: $isActive) {
      ...MarketingCampaignFields
    }
  }
`;

export const DUPLICATE_MARKETING_CAMPAIGN = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation DuplicateMarketingCampaign(
    $id: ID!
    $newName: String!
    $newDates: CampaignDatesInput
  ) {
    duplicateMarketingCampaign(id: $id, newName: $newName, newDates: $newDates) {
      ...MarketingCampaignFields
    }
  }
`;

export const UPDATE_CAMPAIGN_BUDGET = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation UpdateCampaignBudget($id: ID!, $budget: BudgetInput!) {
    updateCampaignBudget(id: $id, budget: $budget) {
      ...MarketingCampaignFields
    }
  }
`;

export const ARCHIVE_MARKETING_CAMPAIGN = gql`
  mutation ArchiveMarketingCampaign($id: ID!) {
    archiveMarketingCampaign(id: $id) {
      success
      message
    }
  }
`;

export const ARCHIVE_MULTIPLE_CAMPAIGNS = gql`
  mutation ArchiveMultipleCampaigns($ids: [ID!]!) {
    archiveMultipleCampaigns(ids: $ids) {
      success
      message
      modifiedCount
    }
  }
`;

// === SUBSCRIPTION === //

export const CAMPAIGN_CREATED_SUBSCRIPTION = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  subscription CampaignCreated {
    campaignCreated {
      ...MarketingCampaignFields
    }
  }
`;

export const CAMPAIGN_UPDATED_SUBSCRIPTION = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  subscription CampaignUpdated {
    campaignUpdated {
      ...MarketingCampaignFields
    }
  }
`;

export const CAMPAIGN_STATUS_CHANGED_SUBSCRIPTION = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  subscription CampaignStatusChanged {
    campaignStatusChanged {
      ...MarketingCampaignFields
    }
  }
`;
