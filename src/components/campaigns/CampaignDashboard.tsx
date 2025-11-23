'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignManagement } from '@/hooks/useCampaigns';
import { UserCampaign } from '@/types/campaign';
import { useAppKitAccount } from '@reown/appkit/react';

interface CampaignCardProps {
  campaign: UserCampaign;
  onEdit?: (campaignId: string) => void;
  onDelete?: (campaignId: string) => void;
}

function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
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
    if (paymentStatus === 'completed' && status === 'inactive') return 'Inactive';
    return status;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{campaign.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status, campaign.payment.status)}`}>
          {getStatusText(campaign.status, campaign.payment.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Reward</p>
          <p className="font-medium">{campaign.reward} {campaign.tokenSymbol}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Difficulty</p>
          <p className="font-medium">{campaign.difficulty}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="font-medium">{campaign.analytics?.submissions || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completions</p>
          <p className="font-medium">{campaign.analytics?.completions || 0}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Created: {typeof campaign.createdAt === 'string'
            ? new Date(campaign.createdAt).toLocaleDateString()
            : campaign.createdAt.toDate().toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}`)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(campaign.id)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Edit
            </button>
          )}
          {campaign.payment.status !== 'completed' && onDelete && (
            <button
              onClick={() => onDelete(campaign.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignDashboard() {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const {
    dashboard,
    campaigns,
    analytics,
    isDashboardLoading,
    dashboardError,
    deleteCampaignAsync,
    isDeleting
  } = useCampaignManagement();

  const handleCreateCampaign = () => {
    router.push('/campaigns/create');
  };

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}/edit`);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        await deleteCampaignAsync(campaignId);
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  if (!address) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your campaigns.</p>
        </div>
      </div>
    );
  }

  if (isDashboardLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Campaigns</h2>
          <p className="text-gray-600">{dashboardError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage your user-created campaigns</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Campaign
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Created</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalCreated}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
            <p className="text-2xl font-bold text-green-600">{analytics.totalActive}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
            <p className="text-2xl font-bold text-gray-900">{parseFloat(analytics.totalSpent).toFixed(2)} KRIS</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Platform Fees</h3>
            <p className="text-2xl font-bold text-gray-900">{parseFloat(analytics.totalPlatformFees).toFixed(2)} KRIS</p>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h3>
          <p className="text-gray-600 mb-6">Create your first campaign to get started.</p>
          <button
            onClick={handleCreateCampaign}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Your First Campaign
          </button>
        </div>
      )}

      {/* Loading overlay for delete operations */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span>Deleting campaign...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}