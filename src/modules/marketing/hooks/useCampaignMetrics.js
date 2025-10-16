// hooks/useCampaignMetrics.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { message } from 'antd';
import {
  GET_CAMPAIGN_METRICS,
  GET_CAMPAIGN_METRICS_HISTORY,
  GET_CAMPAIGNS_PERFORMANCE_COMPARISON,
  UPDATE_CAMPAIGN_METRICS,
  SYNC_CAMPAIGN_METRICS,
  GENERATE_METRICS_REPORT
} from '../apollo/campaignMetrics.js';

/**
 * Hook para obtener métricas de campaña
 */
export const useCampaignMetrics = (campaignId, dateRange = {}, granularity = 'daily') => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_METRICS, {
    variables: { campaignId, dateRange, granularity },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    metrics: data?.campaignMetrics,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener historial de métricas
 */
export const useCampaignMetricsHistory = (campaignId, dateRange = {}, pagination = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_METRICS_HISTORY, {
    variables: { campaignId, dateRange, pagination },
    skip: !campaignId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    metricsHistory: data?.campaignMetricsHistory?.metrics || [],
    pagination: data?.campaignMetricsHistory?.pagination,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para comparar performance de múltiples campañas
 */
export const useCampaignsPerformanceComparison = (campaignIds, dateRange = {}, metrics = []) => {
  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGNS_PERFORMANCE_COMPARISON, {
    variables: { campaignIds, dateRange, metrics },
    skip: !campaignIds || campaignIds.length === 0,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  return {
    comparison: data?.campaignsPerformanceComparison || [],
    loading,
    error,
    refetch
  };
};

/**
 * Hook para actualizar métricas de campaña
 */
export const useUpdateCampaignMetrics = () => {
  const [updateMetrics, { data, loading, error }] = useMutation(UPDATE_CAMPAIGN_METRICS, {
    refetchQueries: [{ query: GET_CAMPAIGN_METRICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Métricas actualizadas exitosamente');
    },
    onError: (error) => {
      message.error(`Error al actualizar métricas: ${error.message}`);
    }
  });

  const handleUpdate = useCallback(async (campaignId, metricsData) => {
    try {
      const result = await updateMetrics({
        variables: { campaignId, metrics: metricsData }
      });
      return result.data?.updateCampaignMetrics;
    } catch (err) {
      console.error('Error updating metrics:', err);
      throw err;
    }
  }, [updateMetrics]);

  return {
    updateMetrics: handleUpdate,
    data: data?.updateCampaignMetrics,
    loading,
    error
  };
};

/**
 * Hook para sincronizar métricas desde plataformas externas
 */
export const useSyncCampaignMetrics = () => {
  const [syncMetrics, { data, loading, error }] = useMutation(SYNC_CAMPAIGN_METRICS, {
    refetchQueries: [{ query: GET_CAMPAIGN_METRICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      message.success('Métricas sincronizadas exitosamente');
    },
    onError: (error) => {
      message.error(`Error al sincronizar métricas: ${error.message}`);
    }
  });

  const handleSync = useCallback(async (campaignId, platform) => {
    try {
      const result = await syncMetrics({
        variables: { campaignId, platform }
      });
      return result.data?.syncCampaignMetrics;
    } catch (err) {
      console.error('Error syncing metrics:', err);
      throw err;
    }
  }, [syncMetrics]);

  return {
    syncMetrics: handleSync,
    data: data?.syncCampaignMetrics,
    loading,
    error
  };
};

/**
 * Hook para generar reportes de métricas
 */
export const useGenerateMetricsReport = () => {
  const [generateReport, { data, loading, error }] = useMutation(GENERATE_METRICS_REPORT, {
    onCompleted: () => {
      message.success('Reporte generado exitosamente');
    },
    onError: (error) => {
      message.error(`Error al generar reporte: ${error.message}`);
    }
  });

  const handleGenerate = useCallback(async (campaignId, reportType, dateRange) => {
    try {
      const result = await generateReport({
        variables: { campaignId, reportType, dateRange }
      });
      return result.data?.generateMetricsReport;
    } catch (err) {
      console.error('Error generating report:', err);
      throw err;
    }
  }, [generateReport]);

  return {
    generateReport: handleGenerate,
    data: data?.generateMetricsReport,
    loading,
    error
  };
};

/**
 * Hook manager completo para métricas de campaña
 */
export const useCampaignMetricsManager = (campaignId) => {
  const [dateRange, setDateRange] = useState({});
  const [granularity, setGranularity] = useState('daily');
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const { metrics, loading: metricsLoading, error: metricsError, refetch } = useCampaignMetrics(campaignId, dateRange, granularity);
  const { updateMetrics, loading: updating } = useUpdateCampaignMetrics();
  const { syncMetrics, loading: syncing } = useSyncCampaignMetrics();
  const { generateReport, loading: generating } = useGenerateMetricsReport();

  const isLoading = metricsLoading || updating || syncing || generating;

  // Función para obtener métricas específicas
  const getSpecificMetrics = useCallback((metricNames) => {
    if (!metrics) return {};
    
    const result = {};
    metricNames.forEach(metricName => {
      if (metrics[metricName] !== undefined) {
        result[metricName] = metrics[metricName];
      }
    });
    return result;
  }, [metrics]);

  // Función para calcular tendencias
  const calculateTrends = useCallback(() => {
    if (!metrics || !metrics.trends) return {};
    return metrics.trends;
  }, [metrics]);

  return {
    // Data
    metrics,
    selectedMetrics,
    
    // State
    dateRange,
    granularity,
    isLoading,
    error: metricsError,
    
    // Actions
    setDateRange,
    setGranularity,
    setSelectedMetrics,
    updateMetrics,
    syncMetrics,
    generateReport,
    refetch,
    
    // Utilities
    getSpecificMetrics,
    calculateTrends
  };
};

export default useCampaignMetricsManager;
