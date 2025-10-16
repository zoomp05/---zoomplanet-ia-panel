// apollo/campaignMetrics.js
import { gql } from '@apollo/client';

// === CAMPAIGN METRICS FRAGMENTS === //

export const CAMPAIGN_METRICS_FIELDS = gql`
  fragment CampaignMetricsFields on CampaignMetrics {
    id
    campaign
    date
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
    engagementMetrics {
      likes
      shares
      comments
      saves
      totalEngagements
      engagementRate
    }
    reachMetrics {
      reach
      frequency
      uniqueUsers
      organicReach
      paidReach
    }
    audienceMetrics {
      demographics {
        age
        gender
        location
        interests
      }
      deviceBreakdown
      trafficSources
    }
    channelPerformance
    timeframePerformance
    qualityScore
    performanceScore
    insights
    recommendations
    kpis
    trends {
      direction
      percentage
      comparison
    }
    isActive
    createdAt
    updatedAt
  }
`;

// === CAMPAIGN METRICS QUERIES === //

export const GET_CAMPAIGN_METRICS = gql`
  ${CAMPAIGN_METRICS_FIELDS}
  query GetCampaignMetrics($campaignId: ID!, $dateRange: DateRangeInput, $granularity: String) {
    campaignMetrics(campaignId: $campaignId, dateRange: $dateRange, granularity: $granularity) {
      ...CampaignMetricsFields
    }
  }
`;

export const GET_CAMPAIGN_METRICS_HISTORY = gql`
  ${CAMPAIGN_METRICS_FIELDS}
  query GetCampaignMetricsHistory($campaignId: ID!, $dateRange: DateRangeInput, $pagination: PaginationInput) {
    campaignMetricsHistory(campaignId: $campaignId, dateRange: $dateRange, pagination: $pagination) {
      metrics {
        ...CampaignMetricsFields
      }
      pagination {
        page
        limit
        totalPages
        totalItems
      }
    }
  }
`;

export const GET_CAMPAIGNS_PERFORMANCE_COMPARISON = gql`
  query GetCampaignsPerformanceComparison($campaignIds: [ID!]!, $dateRange: DateRangeInput, $metrics: [String!]) {
    campaignsPerformanceComparison(campaignIds: $campaignIds, dateRange: $dateRange, metrics: $metrics) {
      campaignId
      campaignName
      metrics {
        metric
        value
        trend
        comparison
      }
      overallScore
    }
  }
`;

// === CAMPAIGN METRICS MUTATIONS === //

export const UPDATE_CAMPAIGN_METRICS = gql`
  ${CAMPAIGN_METRICS_FIELDS}
  mutation UpdateCampaignMetrics($campaignId: ID!, $metrics: CampaignMetricsInput!) {
    updateCampaignMetrics(campaignId: $campaignId, metrics: $metrics) {
      ...CampaignMetricsFields
    }
  }
`;

export const SYNC_CAMPAIGN_METRICS = gql`
  ${CAMPAIGN_METRICS_FIELDS}
  mutation SyncCampaignMetrics($campaignId: ID!, $platform: String!) {
    syncCampaignMetrics(campaignId: $campaignId, platform: $platform) {
      ...CampaignMetricsFields
    }
  }
`;

export const GENERATE_METRICS_REPORT = gql`
  mutation GenerateMetricsReport($campaignId: ID!, $reportType: String!, $dateRange: DateRangeInput) {
    generateMetricsReport(campaignId: $campaignId, reportType: $reportType, dateRange: $dateRange) {
      reportId
      downloadUrl
      status
      generatedAt
    }
  }
`;
