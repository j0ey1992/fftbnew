'use client';

import { useState, useEffect } from 'react';
import { DApp } from '@/types/dapp';
import DAppModuleRenderer from './DAppModuleRenderer';
import { TwitterIcon, MessageCircleIcon, GlobeIcon, SendIcon, DiscordIcon } from '@/components/icons';

interface DAppViewerProps {
  path?: string;
  dapp?: DApp;
  preview?: boolean;
}

export default function DAppViewer({ path, dapp: previewDapp, preview = false }: DAppViewerProps) {
  const [dapp, setDapp] = useState<DApp | null>(previewDapp || null);
  const [loading, setLoading] = useState(!previewDapp);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewDapp && path) {
      fetchDApp();
    }
  }, [path, previewDapp]);

  const fetchDApp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dapps/public/${path}`);
      
      if (response.ok) {
        const data = await response.json();
        setDapp(data);
      } else if (response.status === 404) {
        setError('dApp not found');
      } else {
        setError('Failed to load dApp');
      }
    } catch (error) {
      console.error('Error fetching dApp:', error);
      setError('Failed to load dApp');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !dapp) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">{error || 'dApp not found'}</p>
        </div>
      </div>
    );
  }

  const { theme, settings, modules } = dapp;
  const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Name */}
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center font-bold"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {settings.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-xl font-bold">{settings.name}</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {enabledModules.map((module) => (
                <a
                  key={module.id}
                  href={`#${module.type}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {module.title}
                </a>
              ))}
            </nav>

            {/* Social Links */}
            {settings.socialLinks && (
              <div className="flex items-center gap-3">
                {settings.socialLinks.twitter && (
                  <a
                    href={settings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    <TwitterIcon className="text-xl" />
                  </a>
                )}
                {settings.socialLinks.discord && (
                  <a
                    href={settings.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    <DiscordIcon className="text-xl" />
                  </a>
                )}
                {settings.socialLinks.telegram && (
                  <a
                    href={settings.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    <SendIcon className="text-xl" />
                  </a>
                )}
                {settings.socialLinks.website && (
                  <a
                    href={settings.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    <GlobeIcon className="text-xl" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Banner */}
        <div className="h-64 md:h-80 relative overflow-hidden">
          {settings.banner ? (
            <img 
              src={settings.banner} 
              alt={settings.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {settings.name}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {settings.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <main className="container mx-auto px-4 py-12">
        {enabledModules.map((module, index) => (
          <section 
            key={module.id} 
            id={module.type}
            className={index < enabledModules.length - 1 ? 'mb-16' : ''}
          >
            <DAppModuleRenderer
              module={module}
              theme={theme}
              preview={preview}
            />
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings.logo && (
                <img 
                  src={settings.logo} 
                  alt={settings.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              )}
              <span className="text-sm opacity-60">
                © {new Date().getFullYear()} {settings.name}. All rights reserved.
              </span>
            </div>
            
            {preview && (
              <div className="text-sm opacity-60">
                Preview Mode - Changes are not saved
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}