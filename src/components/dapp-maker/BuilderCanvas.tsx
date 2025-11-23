'use client';

import { useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DAppModule, DAppTheme, DAppSettings } from '@/types/dapp';
import ModuleCard from './ModuleCard';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface BuilderCanvasProps {
  modules: DAppModule[];
  theme: DAppTheme;
  settings: DAppSettings;
  onModuleUpdate: (moduleId: string, updates: Partial<DAppModule>) => void;
  onModuleRemove: (moduleId: string) => void;
  onModuleReorder: (modules: DAppModule[]) => void;
}

export default function BuilderCanvas({
  modules,
  theme,
  settings,
  onModuleUpdate,
  onModuleRemove,
  onModuleReorder
}: BuilderCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newModules = arrayMove(modules, oldIndex, newIndex);
        onModuleReorder(newModules);
      }
    }
  }, [modules, onModuleReorder]);

  const enabledModules = modules.filter(m => m.enabled);

  return (
    <div className="min-h-full p-8">
      {/* dApp Preview Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div 
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
            {settings.banner && (
              <img 
                src={settings.banner} 
                alt={settings.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* dApp Info */}
          <div className="p-8 relative">
            <div className="flex items-start gap-6">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.name}
                  className="w-24 h-24 rounded-xl object-cover -mt-16 relative z-10 border-4"
                  style={{ borderColor: theme.backgroundColor }}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-xl -mt-16 relative z-10 border-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: theme.primaryColor,
                    borderColor: theme.backgroundColor 
                  }}
                >
                  <span className="text-white text-2xl font-bold">
                    {settings.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: theme.textColor }}
                >
                  {settings.name}
                </h1>
                <p 
                  className="text-lg opacity-80"
                  style={{ color: theme.textColor }}
                >
                  {settings.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-6xl mx-auto">
        {modules.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              No modules added yet. Add modules from the sidebar to get started.
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={modules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    theme={theme}
                    onUpdate={(updates) => onModuleUpdate(module.id, updates)}
                    onRemove={() => onModuleRemove(module.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}