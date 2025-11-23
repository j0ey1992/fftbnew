import apiClient from '../client';
import { ENDPOINTS } from '../config';
import { 
  UserCampaign, 
  CreateCampaignData, 
  CampaignFilters,
  FeeCalculationRequest,
  FeeCalculationResponse,
  CampaignPaymentRequest,
  CampaignPaymentResponse,
  UserCampaignDashboard
} from '@/types/campaign';

/**
 * Campaign API endpoints
 */
export const CampaignsApi = {
  /**
   * Calculate platform fee for a campaign
   * @param request Fee calculation request
   * @returns Promise with fee calculation response
   */
  calculateFee: async (request: FeeCalculationRequest): Promise<FeeCalculationResponse> => {
    try {
      return await apiClient.post<FeeCalculationResponse>(
        ENDPOINTS.CAMPAIGNS.CALCULATE_FEE,
        request
      );
    } catch (error) {
      console.error('Error calculating campaign fee:', error);
      throw error;
    }
  },

  /**
   * Get all campaigns with optional filters
   * @param filters Optional filters for campaigns
   * @returns Promise with array of campaigns
   */
  getCampaigns: async (filters?: CampaignFilters): Promise<UserCampaign[]> => {
    try {
      // Build query parameters
      const queryParams: string[] = [];
      
      if (filters) {
        if (filters.category) {
          queryParams.push(`category=${encodeURIComponent(filters.category)}`);
        }
        
        if (filters.difficulty) {
          queryParams.push(`difficulty=${encodeURIComponent(filters.difficulty)}`);
        }
        
        if (filters.status) {
          queryParams.push(`status=${encodeURIComponent(filters.status)}`);
        }
        
        if (filters.createdBy) {
          queryParams.push(`createdBy=${encodeURIComponent(filters.createdBy)}`);
        }
        
        if (filters.paymentStatus) {
          queryParams.push(`paymentStatus=${encodeURIComponent(filters.paymentStatus)}`);
        }
        
        if (filters.limit) {
          queryParams.push(`limit=${filters.limit}`);
        }
      }
      
      // Build endpoint URL with query parameters
      const endpoint = queryParams.length > 0
        ? `${ENDPOINTS.CAMPAIGNS.BASE}?${queryParams.join('&')}`
        : ENDPOINTS.CAMPAIGNS.BASE;
      
      return await apiClient.get<UserCampaign[]>(endpoint);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  /**
   * Get campaigns created by a specific user
   * @param userAddress User wallet address
   * @returns Promise with user campaign dashboard data
   */
  getUserCampaigns: async (userAddress: string): Promise<UserCampaignDashboard> => {
    try {
      return await apiClient.get<UserCampaignDashboard>(
        ENDPOINTS.CAMPAIGNS.USER_CAMPAIGNS(userAddress),
        { requireAuth: true }
      );
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      throw error;
    }
  },

  /**
   * Get campaigns created by the authenticated user
   * @returns Promise with user campaign dashboard data
   */
  getMyCampaigns: async (): Promise<UserCampaignDashboard> => {
    try {
      return await apiClient.get<UserCampaignDashboard>(
        ENDPOINTS.CAMPAIGNS.MY_CAMPAIGNS,
        { requireAuth: true }
      );
    } catch (error) {
      console.error('Error fetching my campaigns:', error);
      throw error;
    }
  },

  /**
   * Get a campaign by ID
   * @param id Campaign ID
   * @returns Promise with campaign data or null if not found
   */
  getCampaignById: async (id: string): Promise<UserCampaign | null> => {
    try {
      return await apiClient.get<UserCampaign>(ENDPOINTS.CAMPAIGNS.BY_ID(id));
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        return null;
      }
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new campaign
   * @param campaignData Campaign data
   * @returns Promise with created campaign response
   */
  createCampaign: async (campaignData: CreateCampaignData): Promise<{
    id: string;
    success: boolean;
    platformFee: {
      amount: string;
      percentage: number;
      currency: 'KRIS';
    };
    paymentRequired: boolean;
    message: string;
  }> => {
    try {
      // Transform client-side data to match server expectations
      const serverCampaignData = {
        title: campaignData.title,
        description: campaignData.description,
        category: campaignData.category,
        difficulty: campaignData.difficulty,
        reward: campaignData.reward,
        xpReward: campaignData.xpReward || 0,
        tokenAddress: campaignData.tokenAddress,
        tokenSymbol: campaignData.tokenSymbol,
        tokenDecimals: campaignData.tokenDecimals,
        participantLimit: campaignData.participantLimit,
        requirements: campaignData.requirements,
        expiresAt: campaignData.expiresAt 
          ? (campaignData.expiresAt instanceof Date 
              ? campaignData.expiresAt.toISOString() 
              : typeof campaignData.expiresAt === 'object' && 'toDate' in campaignData.expiresAt 
                ? campaignData.expiresAt.toDate().toISOString()
                : new Date(campaignData.expiresAt as any).toISOString())
          : undefined,
        verificationInstructions: campaignData.verificationInstructions || '',
        campaignSettings: campaignData.campaignSettings
      };
      
      return await apiClient.post<{
        id: string;
        success: boolean;
        platformFee: {
          amount: string;
          percentage: number;
          currency: 'KRIS';
        };
        paymentRequired: boolean;
        message: string;
      }>(
        ENDPOINTS.CAMPAIGNS.BASE,
        serverCampaignData,
        { requireAuth: true }
      );
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  /**
   * Process payment for a campaign
   * @param campaignId Campaign ID
   * @param paymentRequest Payment request data
   * @returns Promise with payment response
   */
  processCampaignPayment: async (
    campaignId: string,
    paymentRequest: Omit<CampaignPaymentRequest, 'campaignId'>
  ): Promise<CampaignPaymentResponse> => {
    try {
      return await apiClient.post<CampaignPaymentResponse>(
        ENDPOINTS.CAMPAIGNS.PAYMENT(campaignId),
        paymentRequest,
        { requireAuth: true }
      );
    } catch (error) {
      console.error('Error processing campaign payment:', error);
      throw error;
    }
  },

  /**
   * Update an existing campaign
   * @param id Campaign ID
   * @param campaignData Updated campaign data
   * @returns Promise with update response
   */
  updateCampaign: async (id: string, campaignData: Partial<UserCampaign>): Promise<{
    success: boolean;
    campaign: UserCampaign;
  }> => {
    try {
      // Transform client-side data to match server expectations
      const serverCampaignData: any = { ...campaignData };
      
      // Handle expiresAt conversion if present
      if (campaignData.expiresAt) {
        serverCampaignData.expiresAt = campaignData.expiresAt instanceof Date 
          ? campaignData.expiresAt.toISOString() 
          : typeof campaignData.expiresAt === 'object' && 'toDate' in campaignData.expiresAt 
            ? campaignData.expiresAt.toDate().toISOString()
            : new Date(campaignData.expiresAt as any).toISOString();
      }
      
      return await apiClient.put<{
        success: boolean;
        campaign: UserCampaign;
      }>(
        ENDPOINTS.CAMPAIGNS.BY_ID(id),
        serverCampaignData,
        { requireAuth: true }
      );
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a campaign
   * @param id Campaign ID
   * @returns Promise with deletion response
   */
  deleteCampaign: async (id: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      return await apiClient.delete<{
        success: boolean;
        message: string;
      }>(
        ENDPOINTS.CAMPAIGNS.BY_ID(id),
        { requireAuth: true }
      );
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }
};

export default CampaignsApi;