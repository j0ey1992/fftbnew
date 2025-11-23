'use client';

import { DAppSettings } from '@/types/dapp';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UploadIcon, XIcon } from '@/components/icons';

interface SettingsPanelProps {
  settings: DAppSettings;
  onSettingsUpdate: (settings: Partial<DAppSettings>) => void;
}

export default function SettingsPanel({ settings, onSettingsUpdate }: SettingsPanelProps) {
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    setUploading(type);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        onSettingsUpdate({ [type]: url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-white font-semibold mb-3">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              dApp Name
            </label>
            <Input
              placeholder="My Awesome dApp"
              value={settings.name}
              onChange={(e) => onSettingsUpdate({ name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Describe your dApp..."
              value={settings.description}
              onChange={(e) => onSettingsUpdate({ description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-white font-semibold mb-3">Branding</h3>
        <div className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Logo
            </label>
            {settings.logo ? (
              <div className="relative">
                <img 
                  src={settings.logo} 
                  alt="Logo"
                  className="w-full h-32 object-contain bg-gray-800 rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSettingsUpdate({ logo: '' })}
                  className="absolute top-2 right-2"
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'logo')}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors">
                  <UploadIcon className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm">
                    {uploading === 'logo' ? 'Uploading...' : 'Click to upload logo'}
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Banner
            </label>
            {settings.banner ? (
              <div className="relative">
                <img 
                  src={settings.banner} 
                  alt="Banner"
                  className="w-full h-32 object-cover bg-gray-800 rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSettingsUpdate({ banner: '' })}
                  className="absolute top-2 right-2"
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'banner')}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors">
                  <UploadIcon className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm">
                    {uploading === 'banner' ? 'Uploading...' : 'Click to upload banner'}
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-white font-semibold mb-3">Social Links</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Twitter
            </label>
            <Input
              placeholder="https://twitter.com/yourproject"
              value={settings.socialLinks?.twitter || ''}
              onChange={(e) => onSettingsUpdate({ 
                socialLinks: { ...settings.socialLinks, twitter: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Discord
            </label>
            <Input
              placeholder="https://discord.gg/invite"
              value={settings.socialLinks?.discord || ''}
              onChange={(e) => onSettingsUpdate({ 
                socialLinks: { ...settings.socialLinks, discord: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Telegram
            </label>
            <Input
              placeholder="https://t.me/yourgroup"
              value={settings.socialLinks?.telegram || ''}
              onChange={(e) => onSettingsUpdate({ 
                socialLinks: { ...settings.socialLinks, telegram: e.target.value }
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Website
            </label>
            <Input
              placeholder="https://yourproject.com"
              value={settings.socialLinks?.website || ''}
              onChange={(e) => onSettingsUpdate({ 
                socialLinks: { ...settings.socialLinks, website: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* URL Settings */}
      <div>
        <h3 className="text-white font-semibold mb-3">Custom Domain Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              URL Path
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/dapp/</span>
              <Input
                placeholder="my-project"
                value={settings.path || ''}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase()
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/--+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  onSettingsUpdate({ path: value });
                }}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your dApp will be accessible at: {window.location.origin}/dapp/{settings.path || 'your-path'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Custom Domain (Enterprise)
            </label>
            <Input
              placeholder="app.yourdomain.com"
              value={settings.customDomain || ''}
              onChange={(e) => onSettingsUpdate({ customDomain: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Configure your domain's CNAME to point to: dapps.yourplatform.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Subdomain (Coming Soon)
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="myproject"
                value={settings.subdomain || ''}
                onChange={(e) => onSettingsUpdate({ subdomain: e.target.value.toLowerCase() })}
                disabled
              />
              <span className="text-gray-500">.yourplatform.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h3 className="text-white font-semibold mb-3">SEO & Metadata</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Favicon URL
            </label>
            <Input
              placeholder="https://example.com/favicon.ico"
              value={settings.favicon || ''}
              onChange={(e) => onSettingsUpdate({ favicon: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}