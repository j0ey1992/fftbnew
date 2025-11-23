'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { UserCampaign, CampaignFilters } from '@/types/campaign';
import { useAppKitAccount } from '@reown/appkit/react';

interface CampaignListProps {
  filters?: CampaignFilters;
  showCreateButton?: boolean;
  limit?: number;
}

interface CampaignCardProps {
  campaign: UserCampaign;
}

function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string, paymentStatus: string) => {
    if (paymentStatus !== 'completed') return 'bg-yellow-100 text-yellow-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'inactive') return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'pending') return 'Payment Pending';
    if (paymentStatus === 'processing') return 'Processing Payment';
    if (paymentStatus === 'failed') return 'Payment Failed';
    if (paymentStatus === 'completed' && status === 'active') return 'Active';
    if (paymentStatus === 'completed' && status === 'inactive') return 'Ended';
    return status;
  };

  const handleViewCampaign = () => {
    router.push(`/campaigns/${campaign.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewCampaign}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Campaign
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{campaign.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status, campaign.payment.status)}`}>
          {getStatusText(campaign.status, campaign.payment.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Reward</p>
          <p className="font-medium">{campaign.reward} {campaign.tokenSymbol}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Difficulty</p>
          <p className="font-medium">{campaign.difficulty}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Participants</p>
          <p className="font-medium">
            {campaign.participantsJoined}
            {campaign.participantLimit !== 'unlimited' && `/${campaign.participantLimit}`}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Views</p>
          <p className="font-medium">{campaign.analytics?.views || 0}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By: {campaign.createdBy.slice(0, 6)}...{campaign.createdBy.slice(-4)}
        </div>
        <div className="text-sm text-gray-500">
          Created: {typeof campaign.createdAt === 'string' 
            ? new Date(campaign.createdAt).toLocaleDateString()
            : campaign.createdAt.toDate().toLocaleDateString()}
        </div>
      </div>

      {campaign.payment.status === 'completed' && campaign.status === 'active' && (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCampaign();
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            View Campaign
          </button>
        </div>
      )}
    </div>
  );
}

export default function CampaignList({ filters, showCreateButton = false, limit }: CampaignListProps) {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const { campaigns, isLoading, error } = useCampaigns({
    ...filters,
    limit,
    // Only show campaigns with completed payments for public view
    paymentStatus: 'completed',
    status: 'active'
  });

  const handleCreateCampaign = () => {
    if (!address) {
      alert('Please connect your wallet to create a campaign');
      return;
    }
    router.push('/campaigns/create');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading campaigns: {error.message}</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Available</h3>
        <p className="text-gray-600 mb-4">
          {showCreateButton 
            ? "Be the first to create a campaign!" 
            : "Check back later for new campaigns."}
        </p>
        {showCreateButton && (
          <button
            onClick={handleCreateCampaign}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Create Campaign
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCreateButton && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">User Campaigns</h2>
          <button
            onClick={handleCreateCampaign}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Create Campaign
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {limit && campaigns.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            View All Campaigns
          </button>
        </div>
      )}
    </div>
  );
}