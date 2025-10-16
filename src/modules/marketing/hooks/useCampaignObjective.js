// hooks/useCampaignObjective.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { message } from 'antd';
import {
  GET_CAMPAIGN_OBJECTIVES,
  GET_CAMPAIGN_OBJECTIVE,
  CREATE_CAMPAIGN_OBJECTIVE,
  UPDATE_CAMPAIGN_OBJECTIVE,
  DELETE_CAMPAIGN_OBJECTIVE,
  COMPLETE_CAMPAIGN_OBJECTIVE,
  UPDATE_OBJECTIVE_PROGRESS
} from '../apollo/campaignObjective.js';

/**
 * Hook para manejar múltiples objetivos de campaña
 */
export const useCampaignObjectives = (campaignId, filter = {}, pagination = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_OBJECTIVES, {
    variables: { campaignId, filter, pagination },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    objectives: data?.campaignObjectives?.objectives || [],
    pagination: data?.campaignObjectives?.pagination,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para manejar un objetivo individual
 */
export const useCampaignObjective = (id) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_OBJECTIVE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    objective: data?.campaignObjective,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para crear objetivo de campaña
 */
export const useCreateCampaignObjective = () => {
  const [createObjective, { data, loading, error }] = useMutation(CREATE_CAMPAIGN_OBJECTIVE, {
    refetchQueries: [{ query: GET_CAMPAIGN_OBJECTIVES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Objetivo creado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al crear objetivo: ${error.message}`);
    }
  });

  const handleCreate = useCallback(async (objectiveData) => {
    try {
      const result = await createObjective({
        variables: { input: objectiveData }
      });
      return result.data?.createCampaignObjective;
    } catch (err) {
      console.error('Error creating objective:', err);
      throw err;
    }
  }, [createObjective]);

  return {
    createObjective: handleCreate,
    data: data?.createCampaignObjective,
    loading,
    error
  };
};

/**
 * Hook para actualizar objetivo de campaña
 */
export const useUpdateCampaignObjective = () => {
  const [updateObjective, { data, loading, error }] = useMutation(UPDATE_CAMPAIGN_OBJECTIVE, {
    refetchQueries: [{ query: GET_CAMPAIGN_OBJECTIVES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Objetivo actualizado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al actualizar objetivo: ${error.message}`);
    }
  });

  const handleUpdate = useCallback(async (id, objectiveData) => {
    try {
      const result = await updateObjective({
        variables: { id, input: objectiveData }
      });
      return result.data?.updateCampaignObjective;
    } catch (err) {
      console.error('Error updating objective:', err);
      throw err;
    }
  }, [updateObjective]);

  return {
    updateObjective: handleUpdate,
    data: data?.updateCampaignObjective,
    loading,
    error
  };
};

/**
 * Hook para eliminar objetivo de campaña
 */
export const useDeleteCampaignObjective = () => {
  const [deleteObjective, { data, loading, error }] = useMutation(DELETE_CAMPAIGN_OBJECTIVE, {
    refetchQueries: [{ query: GET_CAMPAIGN_OBJECTIVES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Objetivo eliminado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al eliminar objetivo: ${error.message}`);
    }
  });

  const handleDelete = useCallback(async (id) => {
    try {
      const result = await deleteObjective({
        variables: { id }
      });
      return result.data?.deleteCampaignObjective;
    } catch (err) {
      console.error('Error deleting objective:', err);
      throw err;
    }
  }, [deleteObjective]);

  return {
    deleteObjective: handleDelete,
    data: data?.deleteCampaignObjective,
    loading,
    error
  };
};

/**
 * Hook para completar objetivo
 */
export const useCompleteCampaignObjective = () => {
  const [completeObjective, { data, loading, error }] = useMutation(COMPLETE_CAMPAIGN_OBJECTIVE, {
    refetchQueries: [{ query: GET_CAMPAIGN_OBJECTIVES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Objetivo completado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al completar objetivo: ${error.message}`);
    }
  });

  const handleComplete = useCallback(async (id) => {
    try {
      const result = await completeObjective({
        variables: { id }
      });
      return result.data?.completeCampaignObjective;
    } catch (err) {
      console.error('Error completing objective:', err);
      throw err;
    }
  }, [completeObjective]);

  return {
    completeObjective: handleComplete,
    data: data?.completeCampaignObjective,
    loading,
    error
  };
};

/**
 * Hook para actualizar progreso del objetivo
 */
export const useUpdateObjectiveProgress = () => {
  const [updateProgress, { data, loading, error }] = useMutation(UPDATE_OBJECTIVE_PROGRESS, {
    refetchQueries: [{ query: GET_CAMPAIGN_OBJECTIVES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Progreso actualizado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al actualizar progreso: ${error.message}`);
    }
  });

  const handleUpdateProgress = useCallback(async (id, currentValue) => {
    try {
      const result = await updateProgress({
        variables: { id, currentValue }
      });
      return result.data?.updateObjectiveProgress;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [updateProgress]);

  return {
    updateProgress: handleUpdateProgress,
    data: data?.updateObjectiveProgress,
    loading,
    error
  };
};

/**
 * Hook manager completo para objetivos de campaña
 */
export const useCampaignObjectiveManager = (campaignId) => {
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const { objectives, pagination: paginationData, loading, error, refetch } = useCampaignObjectives(campaignId, filter, pagination);
  const { createObjective, loading: creating } = useCreateCampaignObjective();
  const { updateObjective, loading: updating } = useUpdateCampaignObjective();
  const { deleteObjective, loading: deleting } = useDeleteCampaignObjective();
  const { completeObjective, loading: completing } = useCompleteCampaignObjective();
  const { updateProgress, loading: updatingProgress } = useUpdateObjectiveProgress();

  const isLoading = loading || creating || updating || deleting || completing || updatingProgress;

  return {
    // Data
    objectives,
    paginationData,
    selectedObjective,
    
    // State
    filter,
    pagination,
    isLoading,
    error,
    
    // Actions
    setSelectedObjective,
    setFilter,
    setPagination,
    createObjective,
    updateObjective,
    deleteObjective,
    completeObjective,
    updateProgress,
    refetch
  };
};

export default useCampaignObjectiveManager;
