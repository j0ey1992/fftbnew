'use client';

import MainLayout from '@/components/layout/MainLayout';
import { AdminRoute } from '@/components/providers/auth';
import { ContractDeploymentPanel } from '@/components/admin/ContractDeploymentPanel';
import { ToastPortal } from '@/components/ui/Toast';

export default function ContractDeploymentPage() {
  return (
    <AdminRoute>
      <MainLayout>
        <ToastPortal />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ContractDeploymentPanel />
        </div>
      </MainLayout>
    </AdminRoute>
  );
}