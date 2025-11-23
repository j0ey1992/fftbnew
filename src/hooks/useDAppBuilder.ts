import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DAppProject } from '@/types/dapp-builder';
import apiClient from '@/lib/api/client';

export function useDAppBuilder() {
  const { user } = useAuth();
  const [dapps, setDApps] = useState<DAppProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDApps = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/dapps/user/${user.uid}`);
      setDApps(response.data);
    } catch (err) {
      console.error('Error fetching dApps:', err);
      setError('Failed to load dApps');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createDApp = async (dappData: Partial<DAppProject>) => {
    try {
      const response = await apiClient.post('/dapps', dappData);
      const newDApp = response.data;
      setDApps(prev => [newDApp, ...prev]);
      return newDApp;
    } catch (err) {
      console.error('Error creating dApp:', err);
      throw new Error('Failed to create dApp');
    }
  };

  const updateDApp = async (dappId: string, updates: Partial<DAppProject>) => {
    try {
      const response = await apiClient.put(`/dapps/${dappId}`, updates);
      const updatedDApp = response.data;
      setDApps(prev => prev.map(d => d.id === dappId ? updatedDApp : d));
      return updatedDApp;
    } catch (err) {
      console.error('Error updating dApp:', err);
      throw new Error('Failed to update dApp');
    }
  };

  const deleteDApp = async (dappId: string) => {
    try {
      await apiClient.delete(`/dapps/${dappId}`);
      setDApps(prev => prev.filter(d => d.id !== dappId));
    } catch (err) {
      console.error('Error deleting dApp:', err);
      throw new Error('Failed to delete dApp');
    }
  };

  const publishDApp = async (dappId: string) => {
    return updateDApp(dappId, { status: 'published' });
  };

  const unpublishDApp = async (dappId: string) => {
    return updateDApp(dappId, { status: 'draft' });
  };

  useEffect(() => {
    fetchDApps();
  }, [fetchDApps]);

  return {
    dapps,
    loading,
    error,
    createDApp,
    updateDApp,
    deleteDApp,
    publishDApp,
    unpublishDApp,
    refetch: fetchDApps
  };
}

export function useDApp(dappId: string | null) {
  const [dapp, setDApp] = useState<DAppProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDApp = useCallback(async () => {
    if (!dappId) {
      setDApp(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/dapps/${dappId}`);
      setDApp(response.data);
    } catch (err) {
      console.error('Error fetching dApp:', err);
      setError('Failed to load dApp');
    } finally {
      setLoading(false);
    }
  }, [dappId]);

  useEffect(() => {
    fetchDApp();
  }, [fetchDApp]);

  return {
    dapp,
    loading,
    error,
    refetch: fetchDApp
  };
}

export function usePublicDApp(identifier: string, type: 'subdomain' | 'domain' | 'path' = 'path') {
  const [dapp, setDApp] = useState<DAppProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicDApp = useCallback(async () => {
    if (!identifier) {
      setDApp(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      switch (type) {
        case 'subdomain':
          endpoint = `/dapps/subdomain/${identifier}`;
          break;
        case 'domain':
          endpoint = `/dapps/domain/${identifier}`;
          break;
        case 'path':
        default:
          endpoint = `/dapps/public/${identifier}`;
          break;
      }

      const response = await apiClient.get(endpoint);
      setDApp(response.data);
    } catch (err) {
      console.error('Error fetching public dApp:', err);
      setError('Failed to load dApp');
    } finally {
      setLoading(false);
    }
  }, [identifier, type]);

  useEffect(() => {
    fetchPublicDApp();
  }, [fetchPublicDApp]);

  return {
    dapp,
    loading,
    error
  };
}