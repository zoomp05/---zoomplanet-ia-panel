import { gql } from '@apollo/client';

export const GET_PIPELINE_STATUSES = gql`
  query PipelineStatuses($filter: PipelineStatusFilter, $limit: Int, $offset: Int){
    pipelineStatuses(filter:$filter, limit:$limit, offset:$offset){
      edges { id name order color isFinal }
      totalCount
      pageInfo { totalPages currentPage hasNextPage hasPreviousPage totalItems }
    }
  }
`;

export const GET_LEADS = gql`
  query Leads($filter: ContactFilter, $sort: ContactSort, $limit: Int, $offset: Int){
    contacts(filter:$filter, sort:$sort, limit:$limit, offset:$offset){
  edges { id name email type status pipelineStatus { id name order color } statusHistory { status { id name color order isFinal } changedAt note } score assignedTo lastActivityAt createdAt generatedAt timeInCurrentStageMs }
      totalCount
      pageInfo { totalPages currentPage hasNextPage hasPreviousPage totalItems }
    }
  }
`;

export const CHANGE_LEAD_PIPELINE = gql`
  mutation ChangeLeadPipeline($id: ID!, $pipelineStatusId: ID!, $note: String){
    changeContactPipelineStatus(id:$id, pipelineStatusId:$pipelineStatusId, note:$note){
  ... on Contact { id pipelineStatus { id name order color } statusHistory { status { id name color order isFinal } changedAt note } }
      ... on ValidationError { message code }
      ... on NotFoundError { message code }
    }
  }
`;

export const CONTACT_STATUS_OPTIONS = [
  'ACTIVE','UNSUBSCRIBED','BOUNCED','COMPLAINED','ARCHIVED'
];
