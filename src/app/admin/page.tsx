'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/providers/auth';
import MainLayout from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';

/**
 * Admin dashboard page
 * Serves as the entry point for the admin section
 */
export default function AdminDashboardPage() {
  const router = useRouter();

  // No automatic redirect anymore since we have multiple admin pages

  return (
    <AdminRoute>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <GlassCard elevation="raised">
            <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
              <h3 className="text-xl font-bold">Admin Dashboard</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Admin Control Panel</h4>
                <p className="text-gray-300 mb-6">
                  Welcome to the admin dashboard. Select an option below to manage your application.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/tokens')}
                >
                  Manage VVS Token Pairs
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/staking-contracts')}
                >
                  Manage Staking Contracts
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/nft-staking')}
                >
                  Manage NFT Staking Contracts
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/vault-contracts')}
                >
                  Manage Vault & Secure Vault Contracts
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/lp-staking')}
                >
                  Manage LP Staking Contracts
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/contract-templates')}
                >
                  Manage Contract Templates
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/users')}
                >
                  Manage Admin Users
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/payouts')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Manage Reward Payouts
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/quests')}
                >
                  Manage Quests
                </Button>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/admin/contract-deployment')}
                >
                  Deploy Smart Contracts
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Return to App
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </MainLayout>
    </AdminRoute>
  );
}
