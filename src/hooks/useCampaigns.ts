'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCampaign, 
  CreateCampaignData, 
  CampaignFilters,
  FeeCalculationRequest,
  CampaignPaymentRequest
} from '@/types/campaign';
import { CampaignsApi } from '@/lib/api/endpoints/campaigns';
import { useAppKitAccount } from '@reown/appkit/react';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing campaigns
 */
export function useCampaigns(filters?: CampaignFilters) {
  const { address } = useAppKitAccount();
  const userAddress = address?.toLowerCase();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaigns', filters, userAddress],
    queryFn: async () => {
      return await CampaignsApi.getCampaigns(filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return {
    campaigns: data || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Custom hook for fetching a single campaign by ID
 */
export function useCampaign(campaignId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      return await CampaignsApi.getCampaignById(campaignId);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!campaignId
  });
  
  return {
    campaign: data,
    isLoading,
    error,
    refetch
  };
}

/**
 * Custom hook for fetching user's campaigns
 */
export function useUserCampaigns(userAddress?: string) {
  const { address } = useAppKitAccount();
  const { isAuthenticated } = useAuth();
  const targetAddress = userAddress || address;
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userCampaigns', targetAddress?.toLowerCase()],
    queryFn: async () => {
      // If no specific address is provided, use the authenticated user's campaigns
      if (!userAddress && isAuthenticated) {
        return await CampaignsApi.getMyCampaigns();
      }
      // Otherwise, fetch campaigns for a specific address (for admin viewing)
      if (targetAddress && isAuthenticated) {
        return await CampaignsApi.getUserCampaigns(targetAddress.toLowerCase());
      }
      return null;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!targetAddress && isAuthenticated
  });
  
  return {
    dashboard: data,
    campaigns: data?.campaigns || [],
    analytics: data?.analytics,
    isLoading,
    error,
    refetch
  };
}

/**
 * Custom hook for calculating platform fees
 */
export function useFeeCalculation() {
  const [feeData, setFeeData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const calculateFee = async (request: FeeCalculationRequest) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const result = await CampaignsApi.calculateFee(request);
      setFeeData(result);
      
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  };
  
  const clearFeeData = () => {
    setFeeData(null);
    setError(null);
  };
  
  return {
    feeData,
    isCalculating,
    error,
    calculateFee,
    clearFeeData
  };
}

/**
 * Custom hook for campaign creation
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  const mutation = useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      return await CampaignsApi.createCampaign(campaignData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (address) {
        queryClient.invalidateQueries({ 
          queryKey: ['userCampaigns', address.toLowerCase()] 
        });
      }
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
    }
  });
  
  return {
    createCampaign: mutation.mutate,
    createCampaignAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}

/**
 * Custom hook for campaign payment processing
 */
export function useCampaignPayment() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  const mutation = useMutation({
        mutationFn: async ({
          campaignId,
          paymentRequest
        }: {
          campaignId: string;
          paymentRequest: Omit<CampaignPaymentRequest, 'campaignId'>
        }) => {
          return await CampaignsApi.processCampaignPayment(campaignId, paymentRequest);
        },
        onSuccess: (_data, variables) => {
          // Invalidate and refetch campaigns
          queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          queryClient.invalidateQueries({
            queryKey: ['campaign', variables.campaignId]
          });
          if (address) {
            queryClient.invalidateQueries({
              queryKey: ['userCampaigns', address.toLowerCase()]
            });
          }
        },    onError: (error) => {
      console.error('Error processing campaign payment:', error);
    }
  });
  
  return {
    processPayment: mutation.mutate,
    processPaymentAsync: mutation.mutateAsync,
    isProcessing: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}

/**
 * Custom hook for campaign updates
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  const mutation = useMutation({
    mutationFn: async ({ 
      campaignId, 
      updateData 
    }: { 
      campaignId: string; 
      updateData: Partial<UserCampaign> 
    }) => {
      return await CampaignsApi.updateCampaign(campaignId, updateData);
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign', variables.campaignId] 
      });
      if (address) {
        queryClient.invalidateQueries({ 
          queryKey: ['userCampaigns', address.toLowerCase()] 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
    }
  });
  
  return {
    updateCampaign: mutation.mutate,
    updateCampaignAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}

/**
 * Custom hook for campaign deletion
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  const mutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return await CampaignsApi.deleteCampaign(campaignId);
    },
    onSuccess: (_data, campaignId) => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.removeQueries({ 
        queryKey: ['campaign', campaignId] 
      });
      if (address) {
        queryClient.invalidateQueries({ 
          queryKey: ['userCampaigns', address.toLowerCase()] 
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
    }
  });
  
  return {
    deleteCampaign: mutation.mutate,
    deleteCampaignAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}

/**
 * Custom hook for campaign analytics and management
 */
export function useCampaignManagement() {
  const { address } = useAppKitAccount();
  const { isAuthenticated } = useAuth();
  const userAddress = address?.toLowerCase();
  
  // Get user's campaigns (without passing address to use authenticated context)
  const { 
    dashboard, 
    campaigns, 
    analytics, 
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useUserCampaigns();
  
  // Campaign creation
  const {
    createCampaign,
    createCampaignAsync,
    isCreating,
    error: createError,
    data: createData,
    isSuccess: isCreateSuccess,
    reset: resetCreate
  } = useCreateCampaign();
  
  // Campaign payment
  const {
    processPayment,
    processPaymentAsync,
    isProcessing,
    error: paymentError,
    data: paymentData,
    isSuccess: isPaymentSuccess,
    reset: resetPayment
  } = useCampaignPayment();
  
  // Campaign updates
  const {
    updateCampaign,
    updateCampaignAsync,
    isUpdating,
    error: updateError,
    data: updateData,
    isSuccess: isUpdateSuccess,
    reset: resetUpdate
  } = useUpdateCampaign();
  
  // Campaign deletion
  const {
    deleteCampaign,
    deleteCampaignAsync,
    isDeleting,
    error: deleteError,
    data: deleteData,
    isSuccess: isDeleteSuccess,
    reset: resetDelete
  } = useDeleteCampaign();
  
  // Fee calculation
  const {
    feeData,
    isCalculating,
    error: feeError,
    calculateFee,
    clearFeeData
  } = useFeeCalculation();
  
  return {
    // Dashboard data
    dashboard,
    campaigns,
    analytics,
    isDashboardLoading,
    dashboardError,
    refetchDashboard,
    
    // Campaign creation
    createCampaign,
    createCampaignAsync,
    isCreating,
    createError,
    createData,
    isCreateSuccess,
    resetCreate,
    
    // Payment processing
    processPayment,
    processPaymentAsync,
    isProcessing,
    paymentError,
    paymentData,
    isPaymentSuccess,
    resetPayment,
    
    // Campaign updates
    updateCampaign,
    updateCampaignAsync,
    isUpdating,
    updateError,
    updateData,
    isUpdateSuccess,
    resetUpdate,
    
    // Campaign deletion
    deleteCampaign,
    deleteCampaignAsync,
    isDeleting,
    deleteError,
    deleteData,
    isDeleteSuccess,
    resetDelete,
    
    // Fee calculation
    feeData,
    isCalculating,
    feeError,
    calculateFee,
    clearFeeData,
    
    // Utility
    userAddress,
    isConnected: !!address,
    isAuthenticated
  };
}