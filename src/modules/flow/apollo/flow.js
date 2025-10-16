import { gql } from '@apollo/client';

export const GET_FLOWS = gql`
  query GetFlows($filter: FlowFilter) {
    flows(filter: $filter) {
      edges {
        node {
          _id
          name
          description
          status
          context {
            _id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

// Nuevas queries para el editor
export const GET_FLOW_ACTIONS = gql`
  query GetFlowActions {
    flowActions {
      _id
      code
      name
      description
      config
    }
  }
`;

export const GET_FLOW_CONTEXTS = gql`
  query GetFlowContexts {
    flowContexts {
      _id
      code
      name
      description
      config
    }
  }
`;

export const GET_FLOW = gql`
  query GetFlow($id: ID!) {
    flow(id: $id) {
      _id
      name
      description
      context {
        _id
        name
      }
      steps {
        _id
        name
        action {
          id
          name
        }
        metadata
        condition
        conditionFunction
        nextStep {
          _id
        }
        onFail {
          _id
        }
      }
      status
      metadata
    }
  }
`;

// Mutations
export const CREATE_FLOW = gql`
  mutation CreateFlow($input: CreateFlowInput!) {
    createFlow(input: $input) {
      _id
      name
      status
    }
  }
`;

export const UPDATE_FLOW = gql`
  mutation UpdateFlow($id: ID!, $input: UpdateFlowInput!) {
    updateFlow(id: $id, input: $input) {
      _id
      name
      status
    }
  }
`;

export const DELETE_FLOW = gql`
  mutation DeleteFlow($id: ID!) {
    deleteFlow(id: $id)
  }
`;

export const ARCHIVE_FLOW = gql`
  mutation ArchiveFlow($id: ID!) {
    archiveFlow(id: $id) {
      _id
      status
    }
  }
`;

export const CREATE_FLOW_ACTION = gql`
  mutation CreateFlowAction($input: CreateFlowActionInput!) {
    createFlowAction(input: $input) {
      id
      code
      name
      description
      config
    }
  }
`;

export const CREATE_FLOW_CONTEXT = gql`
  mutation CreateFlowContext($input: CreateFlowContextInput!) {
    createFlowContext(input: $input) {
      id
      code
      name
      description
      config
    }
  }
`;
