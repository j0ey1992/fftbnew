'use client';

import { DAppTheme } from '@/types/dapp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from '@/components/icons';

interface ThemeCustomizerProps {
  theme: DAppTheme;
  onThemeUpdate: (theme: Partial<DAppTheme>) => void;
}

const presetThemes = [
  {
    name: 'Dark Purple',
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#3B82F6',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#10B981',
      darkMode: true
    }
  },
  {
    name: 'Cyber Blue',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#06B6D4',
      backgroundColor: '#0F172A',
      textColor: '#F8FAFC',
      accentColor: '#14B8A6',
      darkMode: true
    }
  },
  {
    name: 'Neon Green',
    theme: {
      primaryColor: '#10B981',
      secondaryColor: '#84CC16',
      backgroundColor: '#020617',
      textColor: '#F0FDF4',
      accentColor: '#22D3EE',
      darkMode: true
    }
  },
  {
    name: 'Light Mode',
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      accentColor: '#059669',
      darkMode: false
    }
  }
];

export default function ThemeCustomizer({ theme, onThemeUpdate }: ThemeCustomizerProps) {
  const handleColorChange = (key: keyof DAppTheme, value: string) => {
    onThemeUpdate({ [key]: value });
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    onThemeUpdate(preset.theme);
  };

  return (
    <div className="space-y-6">
      {/* Preset Themes */}
      <div>
        <h3 className="text-white font-semibold mb-3">Preset Themes</h3>
        <div className="grid grid-cols-2 gap-2">
          {presetThemes.map((preset) => (
            <Button
              key={preset.name}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="justify-start"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: preset.theme.primaryColor }}
                />
                {preset.name}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Color Pickers */}
      <div>
        <h3 className="text-white font-semibold mb-3">Custom Colors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                placeholder="#8B5CF6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.textColor}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.textColor}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                placeholder="#10B981"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-white font-semibold mb-3">Typography</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Font Family
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              value={theme.fontFamily}
              onChange={(e) => onThemeUpdate({ fontFamily: e.target.value })}
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Space Grotesk, sans-serif">Space Grotesk</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Border Radius
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              value={theme.borderRadius}
              onChange={(e) => onThemeUpdate({ borderRadius: e.target.value })}
            >
              <option value="0px">None</option>
              <option value="4px">Small</option>
              <option value="8px">Medium</option>
              <option value="12px">Large</option>
              <option value="16px">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.darkMode}
            onChange={(e) => onThemeUpdate({ darkMode: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-white">Dark Mode</span>
        </label>
      </div>
    </div>
  );
}