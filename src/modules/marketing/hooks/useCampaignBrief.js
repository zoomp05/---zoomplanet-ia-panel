// hooks/useCampaignBrief.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { message } from 'antd';
import {
  GET_CAMPAIGN_BRIEFS,
  GET_CAMPAIGN_BRIEF,
  GET_CAMPAIGN_BRIEF_VERSIONS,
  CREATE_CAMPAIGN_BRIEF,
  UPDATE_CAMPAIGN_BRIEF,
  DELETE_CAMPAIGN_BRIEF,
  GENERATE_CAMPAIGN_BRIEF,
  CREATE_BRIEF_VERSION,
  ROLLBACK_BRIEF_VERSION,
  IMPROVE_BRIEF_CONTENT
} from '../apollo/campaignBrief.js';

/**
 * Hook para manejar múltiples campaign briefs
 */
export const useCampaignBriefs = (filter = {}, pagination = {}, sort = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_BRIEFS, {
    variables: { filter, pagination, sort },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    briefs: data?.campaignBriefs?.nodes || [],
    totalCount: data?.campaignBriefs?.totalCount || 0,
    pageInfo: data?.campaignBriefs?.pageInfo,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para manejar un campaign brief individual
 */
export const useCampaignBrief = (id) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_BRIEF, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    brief: data?.campaignBrief,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para versiones de campaign brief
 */
export const useCampaignBriefVersions = (id) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_BRIEF_VERSIONS, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    versions: data?.campaignBriefVersions || [],
    loading,
    error,
    refetch
  };
};

/**
 * Hook para crear campaign brief
 */
export const useCreateCampaignBrief = () => {
  const [createBrief, { data, loading, error }] = useMutation(CREATE_CAMPAIGN_BRIEF, {
    refetchQueries: [{ query: GET_CAMPAIGN_BRIEFS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Campaign Brief creado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al crear Campaign Brief: ${error.message}`);
    }
  });

  const handleCreate = useCallback(async (briefData) => {
    try {
      const result = await createBrief({
        variables: { input: briefData }
      });
      return result.data?.createCampaignBrief;
    } catch (err) {
      console.error('Error creating campaign brief:', err);
      throw err;
    }
  }, [createBrief]);

  return {
    createBrief: handleCreate,
    data: data?.createCampaignBrief,
    loading,
    error
  };
};

/**
 * Hook para actualizar campaign brief
 */
export const useUpdateCampaignBrief = () => {
  const [updateBrief, { data, loading, error }] = useMutation(UPDATE_CAMPAIGN_BRIEF, {
    refetchQueries: [{ query: GET_CAMPAIGN_BRIEFS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Campaign Brief actualizado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al actualizar Campaign Brief: ${error.message}`);
    }
  });

  const handleUpdate = useCallback(async (id, briefData) => {
    try {
      const result = await updateBrief({
        variables: { id, input: briefData }
      });
      return result.data?.updateCampaignBrief;
    } catch (err) {
      console.error('Error updating campaign brief:', err);
      throw err;
    }
  }, [updateBrief]);

  return {
    updateBrief: handleUpdate,
    data: data?.updateCampaignBrief,
    loading,
    error
  };
};

/**
 * Hook para eliminar campaign brief
 */
export const useDeleteCampaignBrief = () => {
  const [deleteBrief, { data, loading, error }] = useMutation(DELETE_CAMPAIGN_BRIEF, {
    refetchQueries: [{ query: GET_CAMPAIGN_BRIEFS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Campaign Brief eliminado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al eliminar Campaign Brief: ${error.message}`);
    }
  });

  const handleDelete = useCallback(async (id) => {
    try {
      const result = await deleteBrief({
        variables: { id }
      });
      return result.data?.deleteCampaignBrief;
    } catch (err) {
      console.error('Error deleting campaign brief:', err);
      throw err;
    }
  }, [deleteBrief]);

  return {
    deleteBrief: handleDelete,
    data: data?.deleteCampaignBrief,
    loading,
    error
  };
};

/**
 * Hook para generar campaign brief con IA
 */
export const useGenerateCampaignBrief = () => {
  const [generateBrief, { data, loading, error }] = useMutation(GENERATE_CAMPAIGN_BRIEF, {
    onCompleted: () => {
      message.success('Campaign Brief generado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al generar Campaign Brief: ${error.message}`);
    }
  });

  const handleGenerate = useCallback(async (input, options = {}) => {
    try {
      const result = await generateBrief({
        variables: { input, options }
      });
      return result.data?.generateCampaignBrief;
    } catch (err) {
      console.error('Error generating campaign brief:', err);
      throw err;
    }
  }, [generateBrief]);

  return {
    generateBrief: handleGenerate,
    data: data?.generateCampaignBrief,
    loading,
    error
  };
};

/**
 * Hook manager completo para campaign brief
 */
export const useCampaignBriefManager = () => {
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [sort, setSort] = useState({});

  const { briefs, totalCount, pageInfo, loading, error, refetch } = useCampaignBriefs(filter, pagination, sort);
  const { createBrief, loading: creating } = useCreateCampaignBrief();
  const { updateBrief, loading: updating } = useUpdateCampaignBrief();
  const { deleteBrief, loading: deleting } = useDeleteCampaignBrief();
  const { generateBrief, loading: generating } = useGenerateCampaignBrief();

  const isLoading = loading || creating || updating || deleting || generating;

  return {
    // Data
    briefs,
    totalCount,
    pageInfo,
    selectedBrief,
    
    // State
    filter,
    pagination,
    sort,
    isLoading,
    error,
    
    // Actions
    setSelectedBrief,
    setFilter,
    setPagination,
    setSort,
    createBrief,
    updateBrief,
    deleteBrief,
    generateBrief,
    refetch
  };
};

export default useCampaignBriefManager;
