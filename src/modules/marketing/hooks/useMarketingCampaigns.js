// hooks/useMarketingCampaigns.js
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../auth/contexts/AuthContext';
import {
  GET_MARKETING_CAMPAIGNS,
  GET_MARKETING_CAMPAIGN,
  CREATE_MARKETING_CAMPAIGN,
  UPDATE_MARKETING_CAMPAIGN,
  DELETE_MARKETING_CAMPAIGN
} from '../apollo/marketingCampaign';

export const useMarketingCampaigns = (filter = {}, pagination = {}) => {
  const { account } = useAuth();
  
  const { data, loading, error, refetch } = useQuery(GET_MARKETING_CAMPAIGNS, {
    variables: { filter, pagination },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all' // Permitir que continue incluso con errores
  });

  // Datos mockeados en caso de error o datos vacíos
  const mockData = {
    campaigns: [
      {
        id: 'mock-1',
        name: 'Campaña de Ejemplo',
        description: 'Esta es una campaña de ejemplo para mostrar la interfaz',
        status: 'ACTIVE',
        type: 'AWARENESS',
        budget: { allocated: 5000, currency: 'USD' },
        createdAt: new Date().toISOString()
      }
    ],
    pagination: { total: 1, page: 1, pages: 1 }
  };

  // Función para validar y limpiar datos de campañas
  const validateCampaigns = (campaigns) => {
    if (!Array.isArray(campaigns)) return [];
    
    return campaigns.map(campaign => {
      if (!campaign || typeof campaign !== 'object') return null;
      
      return {
        id: campaign.id || `temp-${Math.random()}`,
        name: campaign.name || 'Sin nombre',
        description: campaign.description || '',
        status: campaign.status || 'DRAFT',
        type: campaign.type || 'AWARENESS',
        budget: campaign.budget || { allocated: 0, currency: 'USD' },
        createdAt: campaign.createdAt || new Date().toISOString(),
        ...campaign // Mantener otras propiedades
      };
    }).filter(Boolean); // Filtrar valores null
  };

  const safeCampaigns = validateCampaigns(
    data?.marketingCampaigns?.campaigns || (error ? mockData.campaigns : [])
  );

  return {
    campaigns: safeCampaigns,
    totalCount: data?.marketingCampaigns?.pagination?.total || (error ? mockData.pagination.total : 0),
    hasNextPage: data?.marketingCampaigns?.pagination?.page < data?.marketingCampaigns?.pagination?.pages,
    hasPreviousPage: data?.marketingCampaigns?.pagination?.page > 1,
    loading,
    error: error && !data ? error : null, // Solo mostrar error si no hay datos
    refetch
  };
};

export const useMarketingCampaign = (id) => {
  const { data, loading, error, refetch } = useQuery(GET_MARKETING_CAMPAIGN, {
    variables: { id },
    skip: !id, // No ejecutar si no hay ID
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  // Datos mockeados para una campaña individual
  const mockCampaign = {
    id: id || 'mock-1',
    name: 'Campaña de Ejemplo',
    description: 'Esta es una campaña de ejemplo para mostrar la interfaz',
    status: 'ACTIVE',
    type: 'AWARENESS',
    budget: { allocated: 5000, currency: 'USD' },
    createdAt: new Date().toISOString()
  };

  return {
    campaign: data?.marketingCampaign || (error && id ? mockCampaign : null),
    loading,
    error: error && !data ? error : null,
    refetch
  };
};

export const useCreateMarketingCampaign = () => {
  const [createCampaign, { data, loading, error }] = useMutation(CREATE_MARKETING_CAMPAIGN, {
    refetchQueries: [{ query: GET_MARKETING_CAMPAIGNS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });

  const handleCreate = async (campaignData) => {
    try {
      const result = await createCampaign({
        variables: { input: campaignData }
      });
      return result.data?.createMarketingCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  };

  return {
    createCampaign: handleCreate,
    data: data?.createMarketingCampaign,
    loading,
    error
  };
};

export const useUpdateMarketingCampaign = () => {
  const [updateCampaign, { data, loading, error }] = useMutation(UPDATE_MARKETING_CAMPAIGN, {
    refetchQueries: [{ query: GET_MARKETING_CAMPAIGNS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });

  const handleUpdate = async (id, campaignData) => {
    try {
      const result = await updateCampaign({
        variables: { id, input: campaignData }
      });
      return result.data?.updateMarketingCampaign;
    } catch (err) {
      console.error('Error updating campaign:', err);
      throw err;
    }
  };

  return {
    updateCampaign: handleUpdate,
    data: data?.updateMarketingCampaign,
    loading,
    error
  };
};

export const useDeleteMarketingCampaign = () => {
  const [deleteCampaign, { data, loading, error }] = useMutation(DELETE_MARKETING_CAMPAIGN, {
    refetchQueries: [{ query: GET_MARKETING_CAMPAIGNS }],
    awaitRefetchQueries: true,
    errorPolicy: 'all'
  });

  const handleDelete = async (id) => {
    try {
      const result = await deleteCampaign({
        variables: { id }
      });
      return result.data?.deleteMarketingCampaign;
    } catch (err) {
      console.error('Error deleting campaign:', err);
      throw err;
    }
  };

  return {
    deleteCampaign: handleDelete,
    data: data?.deleteMarketingCampaign,
    loading,
    error
  };
};

// Hook para gestión completa de campañas
export const useMarketingCampaignManager = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const { campaigns, totalCount, loading, error, refetch } = useMarketingCampaigns(filter, pagination);
  const { createCampaign, loading: creating } = useCreateMarketingCampaign();
  const { updateCampaign, loading: updating } = useUpdateMarketingCampaign();
  const { deleteCampaign, loading: deleting } = useDeleteMarketingCampaign();

  const isLoading = loading || creating || updating || deleting;

  // Función específica para crear campañas de IA
  const createAICampaign = async (formData) => {
    try {
      // Verificar que tenemos la información de la cuenta
      if (!account || !account.id) {
        throw new Error('No se encontró información de la cuenta. Por favor, inicia sesión nuevamente.');
      }

      // Mapear los datos del formulario al formato esperado por CreateMarketingCampaignInput
      const campaignInput = {
        // Usar el ID de la cuenta del contexto de autenticación
        account: account.id,
        
        // Datos del formulario
        name: formData.title,
        description: formData.context,
        type: 'LEAD_GENERATION', // Mapear basado en el goal
        status: 'DRAFT',
        priority: 'MEDIUM',
        
        // Configuración de fechas
        dates: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        
        // Presupuesto por defecto
        budget: {
          total: 1000,
          type: 'FLEXIBLE',
          currency: 'USD'
        },
        
        // Audiencia objetivo básica
        targetAudience: {
          demographics: { industry: formData.industry },
          interests: [],
          behaviors: [],
          customSegments: [],
          lookalikeSources: [],
          excludedAudiences: []
        },
        
        // Objetivos de la campaña
        goals: {
          primary: formData.goal,
          secondary: [],
          kpis: [formData.goal],
          targetMetrics: {}
        },
        
        // Canales por defecto
        channels: ['DIGITAL', 'SOCIAL_MEDIA'],
        tags: ['AI_GENERATED', formData.industry, formData.goal],
        isActive: false,
        
        // Configuración de IA
        aiSettings: {
          enabled: true,
          autoOptimization: true,
          smartBidding: false,
          audienceInsights: true,
          contentGeneration: true,
          performancePrediction: true,
          optimizationGoals: [formData.goal],
          automationLevel: 'SEMI_AUTOMATIC',
          learningMode: true,
          model: 'campaign_optimizer_v1',
          parameters: {
            industry: formData.industry,
            goal: formData.goal,
            context: formData.context
          }
        }
      };

      console.log('🚀 Creando campaña con input:', campaignInput);
      
      const result = await createCampaign(campaignInput);
      return result;
    } catch (error) {
      console.error('❌ Error creando campaña de IA:', error);
      throw error;
    }
  };

  return {
    // Data
    campaigns,
    totalCount,
    selectedCampaign,
    
    // State
    filter,
    pagination,
    isLoading,
    error,
    
    // Actions
    setSelectedCampaign,
    setFilter,
    setPagination,
    createCampaign,
    createAICampaign,
    updateCampaign,
    deleteCampaign,
    refetch
  };
};
