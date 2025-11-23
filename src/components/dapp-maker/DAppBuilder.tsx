'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { DApp, DAppModule, DAppTheme, DAppSettings, ModuleType } from '@/types/dapp';
import ModuleSelector from './ModuleSelector';
import BuilderCanvas from './BuilderCanvas';
import ThemeCustomizer from './ThemeCustomizer';
import SettingsPanel from './SettingsPanel';
import PreviewModal from './PreviewModal';
import { SaveIcon, EyeIcon, SettingsIcon, LayoutIcon, PaletteIcon, ArrowLeftIcon } from '@/components/icons';
import { generateId } from '@/utils/generateId';

interface DAppBuilderProps {
  dappId?: string;
}

const defaultTheme: DAppTheme = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#3B82F6',
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  accentColor: '#10B981',
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  darkMode: true
};

const defaultSettings: DAppSettings = {
  name: 'My dApp',
  description: 'A custom decentralized application',
  logo: '',
  banner: '',
  socialLinks: {}
};

export default function DAppBuilder({ dappId }: DAppBuilderProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(!!dappId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'theme' | 'settings'>('modules');
  const [showPreview, setShowPreview] = useState(false);
  
  const [dapp, setDapp] = useState<Partial<DApp>>({
    settings: defaultSettings,
    theme: defaultTheme,
    modules: [],
    status: 'draft'
  });

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    
    // Only fetch dApp if authenticated
    if (isAuthenticated && dappId) {
      fetchDApp();
    }
  }, [isAuthenticated, authLoading, dappId]);

  const fetchDApp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dapps/${dappId}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDapp(data);
      } else {
        router.push('/dapp-maker');
      }
    } catch (error) {
      console.error('Error fetching dApp:', error);
      router.push('/dapp-maker');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    
    try {
      const method = dappId ? 'PUT' : 'POST';
      const url = dappId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/dapps/${dappId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/dapps`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          ...dapp,
          status: publish ? 'published' : dapp.status,
          publishedAt: publish ? new Date() : dapp.publishedAt
        })
      });

      if (response.ok) {
        const savedDApp = await response.json();
        if (!dappId) {
          router.push(`/dapp-maker/edit/${savedDApp.id}`);
        } else {
          setDapp(savedDApp);
        }
      }
    } catch (error) {
      console.error('Error saving dApp:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleModuleAdd = (moduleType: ModuleType) => {
    const newModule: DAppModule = {
      id: generateId(),
      type: moduleType,
      title: moduleType.charAt(0).toUpperCase() + moduleType.slice(1).replace('-', ' '),
      enabled: true,
      order: dapp.modules?.length || 0,
      config: {}
    };

    setDapp({
      ...dapp,
      modules: [...(dapp.modules || []), newModule]
    });
  };

  const handleModuleUpdate = (moduleId: string, updates: Partial<DAppModule>) => {
    setDapp({
      ...dapp,
      modules: dapp.modules?.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ) || []
    });
  };

  const handleModuleRemove = (moduleId: string) => {
    setDapp({
      ...dapp,
      modules: dapp.modules?.filter(m => m.id !== moduleId) || []
    });
  };

  const handleModuleReorder = (modules: DAppModule[]) => {
    setDapp({
      ...dapp,
      modules: modules.map((m, index) => ({ ...m, order: index }))
    });
  };

  const handleThemeUpdate = (theme: Partial<DAppTheme>) => {
    setDapp({
      ...dapp,
      theme: { ...dapp.theme!, ...theme }
    });
  };

  const handleSettingsUpdate = (settings: Partial<DAppSettings>) => {
    setDapp({
      ...dapp,
      settings: { ...dapp.settings!, ...settings }
    });
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading authentication...</div>
      </div>
    );
  }

  // Show not authenticated message if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-6">Please connect your wallet to access the dApp Maker.</p>
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading dApp...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dapp-maker')}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeftIcon className="mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold text-white">
                  {dappId ? 'Edit' : 'Create'} dApp: {dapp.settings?.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowPreview(true)}
                >
                  <EyeIcon className="mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  <SaveIcon className="mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'modules'
                    ? 'text-white bg-gray-800 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <LayoutIcon className="inline mr-2" />
                Modules
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'theme'
                    ? 'text-white bg-gray-800 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <PaletteIcon className="inline mr-2" />
                Theme
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-white bg-gray-800 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <SettingsIcon className="inline mr-2" />
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'modules' && (
                <ModuleSelector onModuleAdd={handleModuleAdd} />
              )}
              {activeTab === 'theme' && (
                <ThemeCustomizer
                  theme={dapp.theme!}
                  onThemeUpdate={handleThemeUpdate}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsPanel
                  settings={dapp.settings!}
                  onSettingsUpdate={handleSettingsUpdate}
                />
              )}
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-950">
            <BuilderCanvas
              modules={dapp.modules || []}
              theme={dapp.theme!}
              settings={dapp.settings!}
              onModuleUpdate={handleModuleUpdate}
              onModuleRemove={handleModuleRemove}
              onModuleReorder={handleModuleReorder}
            />
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <PreviewModal
            dapp={dapp as DApp}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}