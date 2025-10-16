// apollo/marketingCampaign.js
import { gql } from '@apollo/client';

// Fragments
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
    }
    budget {
      allocated
      spent
      remaining
      currency
    }
    targetAudience {
      demographics
      interests
      behaviors
      customSegments
    }
    kpis
    tags
    notes
    aiSettings {
      enabled
      optimizationGoals
      automationLevel
      learningMode
    }
    integration {
      platforms
      syncSettings
      webhooks
    }
    performance {
      roi
      conversionRate
      costPerLead
      engagement
      reach
    }
    createdBy {
      id
      name
    }
    isActive
    progressPercentage
    isDeleted
    account {
      id
      name
      slug
    }
    project {
      id
      title
    }
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_MARKETING_CAMPAIGNS = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  query GetMarketingCampaigns($filter: CampaignFilterInput, $pagination: PaginationInput) {
    marketingCampaigns(filter: $filter, pagination: $pagination) {
      campaigns {
        ...MarketingCampaignFields
      }
      pagination {
        page
        limit
        total
        pages
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

export const GET_ACCOUNTS_FOR_CAMPAIGN = gql`
  query GetAccountsForCampaign {
    accounts {
      id
      name
      slug
    }
  }
`;

export const GET_PROJECTS_FOR_CAMPAIGN = gql`
  query GetProjectsForCampaign($accountId: ID) {
    projects(accountId: $accountId) {
      id
      title
      description
    }
  }
`;

// Mutations
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
  mutation ToggleCampaignStatus($id: ID!, $status: CampaignStatus!) {
    toggleCampaignStatus(id: $id, status: $status) {
      ...MarketingCampaignFields
    }
  }
`;

export const DUPLICATE_MARKETING_CAMPAIGN = gql`
  ${MARKETING_CAMPAIGN_FIELDS}
  mutation DuplicateMarketingCampaign($id: ID!, $name: String) {
    duplicateMarketingCampaign(id: $id, name: $name) {
      ...MarketingCampaignFields
    }
  }
`;


// src/modules/marketing/apollo/aiCampaignQueries.js
// DUPLICATED BLOCK BELOW (aiCampaignQueries) -- comentado para evitar definiciones duplicadas. Mantener solo primeras definiciones.
/* ORIGINAL DUPLICATED START
import { gql } from '@apollo/client';

// === CAMPAIGN BRIEF OPERATIONS === //

// export const CAMPAIGN_BRIEF_FIELDS = gql`
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
      name
      email
    }
  }
`;

// export const GET_CAMPAIGN_BRIEFS = gql`
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

// export const GET_CAMPAIGN_BRIEF = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  query GetCampaignBrief($id: ID!) {
    campaignBrief(id: $id) {
      ...CampaignBriefFields
    }
  }
`;

// export const GET_CAMPAIGN_BRIEF_VERSIONS = gql`
  ${CAMPAIGN_BRIEF_FIELDS}
  query GetCampaignBriefVersions($id: ID!) {
    campaignBriefVersions(id: $id) {
      ...CampaignBriefFields
    }
  }
`;

// === CAMPAIGN WORKFLOW OPERATIONS === //

// export const CAMPAIGN_WORKFLOW_FIELDS = gql`
  fragment CampaignWorkflowFields on CampaignWorkflow {
    brief {
      id
      name
      description
      version { full }
      qualityScore
      aiGenerated
    }
    objectives {
      id
      primary {
        type
        description
        metrics
        targetValue
        priority
      }
      secondary {
        type
        description
        metrics
        targetValue
        priority
      }
      kpis {
        name
        description
        targetValue
        unit
        category
      }
      successCriteria
    }
    strategy {
      id
      approach
      channels {
        channel
        description
        budget
        timeline
        kpis
        tactics
      }
      timeline {
        name
        startDate
        endDate
        description
        deliverables
        budget
      }
      budget {
        total
        channels {
          channel
          amount
          percentage
        }
        contingency
      }
      tactics {
        name
        description
        channel
        budget
        timeline
        kpis
      }
      riskMitigation {
        risk
        probability
        impact
        mitigation
        contingency
      }
    }
    documentation {
      id
      executionPlan
      brandGuidelines
      contentCalendar {
        date
        channel
        contentType
        title
        description
        responsible
        status
      }
      approvalProcess
      qualityStandards
    }
    mediaIdeas {
      id
      contentType
      title
      description
      script
      visualDescription
      duration
      targetAudience
      channels
      callToAction
      productionNotes
      budget
      timeline
      resources
      qualityScore
    }
    completionStatus {
      briefComplete
      objectivesComplete
      strategyComplete
      documentationComplete
      mediaIdeasComplete
      overallProgress
    }
  }
`;

export const GET_CAMPAIGN_WORKFLOW = gql`
  ${CAMPAIGN_WORKFLOW_FIELDS}
  query GetCampaignWorkflow($briefId: ID!) {
    campaignWorkflow(briefId: $briefId) {
      ...CampaignWorkflowFields
    }
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
        generatedAt
        processingTime
        inputTokens
        outputTokens
        cost
      }
      improvements {
        type
        description
        priority
        implementation
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_OBJECTIVES = gql`
  mutation GenerateCampaignObjectives($briefId: ID!, $objectiveType: ObjectiveType, $options: AIGenerationInput) {
    generateCampaignObjectives(briefId: $briefId, objectiveType: $objectiveType, options: $options) {
      success
      message
      data
      metadata {
        model
        processingTime
        cost
      }
      improvements {
        type
        description
        priority
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_STRATEGY = gql`
  mutation GenerateCampaignStrategy($briefId: ID!, $options: AIGenerationInput) {
    generateCampaignStrategy(briefId: $briefId, options: $options) {
      success
      message
      data
      metadata {
        model
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_DOCUMENTATION = gql`
  mutation GenerateCampaignDocumentation($briefId: ID!, $options: AIGenerationInput) {
    generateCampaignDocumentation(briefId: $briefId, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_MEDIA_IDEAS = gql`
  mutation GenerateMediaIdeas($briefId: ID!, $contentType: ContentType!, $count: Int, $options: AIGenerationInput) {
    generateMediaIdeas(briefId: $briefId, contentType: $contentType, count: $count, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_FULL_CAMPAIGN = gql`
  mutation GenerateFullCampaign($input: CampaignBriefInput!, $options: AIGenerationInput) {
    generateFullCampaign(input: $input, options: $options) {
      success
      message
      results {
        success
        message
        data
      }
      failed
      summary {
        total
        successful
        failed
        totalCost
        totalTime
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_STEP = gql`
  mutation GenerateCampaignStep($briefId: ID!, $step: GenerationType!, $options: AIGenerationInput) {
    generateCampaignStep(briefId: $briefId, step: $step, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

// === MANUAL CRUD OPERATIONS === //

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

// === CONTENT IMPROVEMENT === //

export const IMPROVE_CONTENT = gql`
  mutation ImproveContent($documentId: ID!, $documentType: GenerationType!, $improvements: [ImprovementInput!]!, $options: AIGenerationInput) {
    improveContent(documentId: $documentId, documentType: $documentType, improvements: $improvements, options: $options) {
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

// === VERSION CONTROL === //

export const CREATE_VERSION = gql`
  mutation CreateVersion($documentId: ID!, $documentType: GenerationType!, $description: String!) {
    createVersion(documentId: $documentId, documentType: $documentType, description: $description)
  }
`;

export const ROLLBACK_VERSION = gql`
  mutation RollbackVersion($documentId: ID!, $documentType: GenerationType!, $targetVersion: String!) {
    rollbackVersion(documentId: $documentId, documentType: $documentType, targetVersion: $targetVersion)
  }
`;

// === MEDIA IDEAS === //

export const GET_MEDIA_IDEAS = gql`
  query GetMediaIdeas($briefId: ID!, $contentType: ContentType, $filter: VersionedDocumentFilter, $pagination: PaginationInput) {
    mediaIdeas(briefId: $briefId, contentType: $contentType, filter: $filter, pagination: $pagination) {
      nodes {
        id
        contentType
        title
        description
        script
        visualDescription
        duration
        targetAudience
        channels
        callToAction
        productionNotes
        budget
        timeline
        resources
        tags
        qualityScore
        aiGenerated
        version { full }
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const CREATE_MEDIA_IDEA = gql`
  mutation CreateMediaIdea($input: MediaIdeaInput!) {
    createMediaIdea(input: $input) {
      id
      contentType
      title
      description
      qualityScore
    }
  }
`;

export const UPDATE_MEDIA_IDEA = gql`
  mutation UpdateMediaIdea($id: ID!, $input: MediaIdeaInput!) {
    updateMediaIdea(id: $id, input: $input) {
      id
      contentType
      title
      description
      version { full }
    }
  }
`;

export const DELETE_MEDIA_IDEA = gql`
  mutation DeleteMediaIdea($id: ID!) {
    deleteMediaIdea(id: $id)
  }
`;

*/

// === CAMPAIGN BRIEF OPERATIONS === //

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
      name
      email
    }
  }
`;

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

// === CAMPAIGN WORKFLOW OPERATIONS === //

export const CAMPAIGN_WORKFLOW_FIELDS = gql`
  fragment CampaignWorkflowFields on CampaignWorkflow {
    brief {
      id
      name
      description
      version { full }
      qualityScore
      aiGenerated
    }
    objectives {
      id
      primary {
        type
        description
        metrics
        targetValue
        priority
      }
      secondary {
        type
        description
        metrics
        targetValue
        priority
      }
      kpis {
        name
        description
        targetValue
        unit
        category
      }
      successCriteria
    }
    strategy {
      id
      approach
      channels {
        channel
        description
        budget
        timeline
        kpis
        tactics
      }
      timeline {
        name
        startDate
        endDate
        description
        deliverables
        budget
      }
      budget {
        total
        channels {
          channel
          amount
          percentage
        }
        contingency
      }
      tactics {
        name
        description
        channel
        budget
        timeline
        kpis
      }
      riskMitigation {
        risk
        probability
        impact
        mitigation
        contingency
      }
    }
    documentation {
      id
      executionPlan
      brandGuidelines
      contentCalendar {
        date
        channel
        contentType
        title
        description
        responsible
        status
      }
      approvalProcess
      qualityStandards
    }
    mediaIdeas {
      id
      contentType
      title
      description
      script
      visualDescription
      duration
      targetAudience
      channels
      callToAction
      productionNotes
      budget
      timeline
      resources
      qualityScore
    }
    completionStatus {
      briefComplete
      objectivesComplete
      strategyComplete
      documentationComplete
      mediaIdeasComplete
      overallProgress
    }
  }
`;

export const GET_CAMPAIGN_WORKFLOW = gql`
  ${CAMPAIGN_WORKFLOW_FIELDS}
  query GetCampaignWorkflow($briefId: ID!) {
    campaignWorkflow(briefId: $briefId) {
      ...CampaignWorkflowFields
    }
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
        generatedAt
        processingTime
        inputTokens
        outputTokens
        cost
      }
      improvements {
        type
        description
        priority
        implementation
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_OBJECTIVES = gql`
  mutation GenerateCampaignObjectives($briefId: ID!, $objectiveType: ObjectiveType, $options: AIGenerationInput) {
    generateCampaignObjectives(briefId: $briefId, objectiveType: $objectiveType, options: $options) {
      success
      message
      data
      metadata {
        model
        processingTime
        cost
      }
      improvements {
        type
        description
        priority
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_STRATEGY = gql`
  mutation GenerateCampaignStrategy($briefId: ID!, $options: AIGenerationInput) {
    generateCampaignStrategy(briefId: $briefId, options: $options) {
      success
      message
      data
      metadata {
        model
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_DOCUMENTATION = gql`
  mutation GenerateCampaignDocumentation($briefId: ID!, $options: AIGenerationInput) {
    generateCampaignDocumentation(briefId: $briefId, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_MEDIA_IDEAS = gql`
  mutation GenerateMediaIdeas($briefId: ID!, $contentType: ContentType!, $count: Int, $options: AIGenerationInput) {
    generateMediaIdeas(briefId: $briefId, contentType: $contentType, count: $count, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

export const GENERATE_FULL_CAMPAIGN = gql`
  mutation GenerateFullCampaign($input: CampaignBriefInput!, $options: AIGenerationInput) {
    generateFullCampaign(input: $input, options: $options) {
      success
      message
      results {
        success
        message
        data
      }
      failed
      summary {
        total
        successful
        failed
        totalCost
        totalTime
      }
    }
  }
`;

export const GENERATE_CAMPAIGN_STEP = gql`
  mutation GenerateCampaignStep($briefId: ID!, $step: GenerationType!, $options: AIGenerationInput) {
    generateCampaignStep(briefId: $briefId, step: $step, options: $options) {
      success
      message
      data
      metadata {
        processingTime
        cost
      }
    }
  }
`;

// === MANUAL CRUD OPERATIONS === //

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

// === CONTENT IMPROVEMENT === //

export const IMPROVE_CONTENT = gql`
  mutation ImproveContent($documentId: ID!, $documentType: GenerationType!, $improvements: [ImprovementInput!]!, $options: AIGenerationInput) {
    improveContent(documentId: $documentId, documentType: $documentType, improvements: $improvements, options: $options) {
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

// === VERSION CONTROL === //

export const CREATE_VERSION = gql`
  mutation CreateVersion($documentId: ID!, $documentType: GenerationType!, $description: String!) {
    createVersion(documentId: $documentId, documentType: $documentType, description: $description)
  }
`;

export const ROLLBACK_VERSION = gql`
  mutation RollbackVersion($documentId: ID!, $documentType: GenerationType!, $targetVersion: String!) {
    rollbackVersion(documentId: $documentId, documentType: $documentType, targetVersion: $targetVersion)
  }
`;

// === MEDIA IDEAS === //

export const GET_MEDIA_IDEAS = gql`
  query GetMediaIdeas($briefId: ID!, $contentType: ContentType, $filter: VersionedDocumentFilter, $pagination: PaginationInput) {
    mediaIdeas(briefId: $briefId, contentType: $contentType, filter: $filter, pagination: $pagination) {
      nodes {
        id
        contentType
        title
        description
        script
        visualDescription
        duration
        targetAudience
        channels
        callToAction
        productionNotes
        budget
        timeline
        resources
        tags
        qualityScore
        aiGenerated
        version { full }
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const CREATE_MEDIA_IDEA = gql`
  mutation CreateMediaIdea($input: MediaIdeaInput!) {
    createMediaIdea(input: $input) {
      id
      contentType
      title
      description
      qualityScore
    }
  }
`;

export const UPDATE_MEDIA_IDEA = gql`
  mutation UpdateMediaIdea($id: ID!, $input: MediaIdeaInput!) {
    updateMediaIdea(id: $id, input: $input) {
      id
      contentType
      title
      description
      version { full }
    }
  }
`;

export const DELETE_MEDIA_IDEA = gql`
  mutation DeleteMediaIdea($id: ID!) {
    deleteMediaIdea(id: $id)
  }
`;
