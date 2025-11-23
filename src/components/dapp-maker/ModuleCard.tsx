'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DAppModule, DAppTheme } from '@/types/dapp';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import ModuleConfig from './ModuleConfig';
import { 
  MoveIcon, 
  SettingsIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeOffIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@/components/icons';
import { useState } from 'react';

interface ModuleCardProps {
  module: DAppModule;
  theme: DAppTheme;
  onUpdate: (updates: Partial<DAppModule>) => void;
  onRemove: () => void;
}

export default function ModuleCard({ module, theme, onUpdate, onRemove }: ModuleCardProps) {
  const [showConfig, setShowConfig] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className={`${!module.enabled ? 'opacity-50' : ''}`}>
        {/* Module Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              className="cursor-move text-gray-400 hover:text-white"
              {...attributes}
              {...listeners}
            >
              <MoveIcon />
            </button>
            
            <div>
              <h3 className="text-white font-medium">{module.title}</h3>
              <p className="text-gray-400 text-sm capitalize">{module.type.replace('-', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdate({ enabled: !module.enabled })}
              className="text-gray-400 hover:text-white"
            >
              {module.enabled ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="text-gray-400 hover:text-white"
            >
              <SettingsIcon />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-400 hover:text-red-300"
            >
              <TrashIcon />
            </Button>
          </div>
        </div>

        {/* Module Preview */}
        <div className="p-4">
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              {module.type.charAt(0).toUpperCase() + module.type.slice(1).replace('-', ' ')} Module Preview
            </p>
          </div>
        </div>

        {/* Module Configuration */}
        {showConfig && (
          <div className="border-t border-gray-800">
            <ModuleConfig
              module={module}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </GlassCard>
    </div>
  );
}