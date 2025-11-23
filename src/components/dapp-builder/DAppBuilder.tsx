'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import type {
  DAppComponent,
  DAppPage,
  DAppTheme,
  ComponentCategory,
  ComponentType,
  ResponsiveMode,
} from '@/types/dapp-builder';
import { ComponentLibrary } from './ComponentLibrary';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { TopToolbar } from './TopToolbar';
import { DragOverlayContent } from './DragOverlayContent';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useComponentActions } from './hooks/useComponentActions';
import { defaultTheme } from './utils/defaultTheme';
import { generateId } from './utils/helpers';
import styles from './DAppBuilder.module.css';

interface DAppBuilderProps {
  initialPages?: DAppPage[];
  initialTheme?: DAppTheme;
  onSave?: (pages: DAppPage[], theme: DAppTheme) => void;
  onPublish?: (pages: DAppPage[], theme: DAppTheme) => void;
}

export const DAppBuilder: React.FC<DAppBuilderProps> = ({
  initialPages = [{
    id: 'home',
    name: 'Home',
    path: '/',
    components: [],
    meta: {
      title: 'Home',
      description: '',
    },
  }],
  initialTheme = defaultTheme,
  onSave,
  onPublish,
}) => {
  // State management
  const [pages, setPages] = useState<DAppPage[]>(initialPages);
  const [currentPageId, setCurrentPageId] = useState(initialPages[0]?.id || 'home');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [theme, setTheme] = useState<DAppTheme>(initialTheme);
  const [responsiveMode, setResponsiveMode] = useState<ResponsiveMode>('desktop');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<DAppComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<{ pages: DAppPage[]; theme: DAppTheme }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get current page
  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Component actions hook
  const {
    addComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    moveComponent,
  } = useComponentActions(pages, setPages, currentPageId, setHistory, historyIndex, setHistoryIndex);

  // Auto-save hook
  useAutoSave(pages, theme, onSave);

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSave,
    onDelete: () => selectedComponentId && deleteComponent(selectedComponentId),
    onDuplicate: () => selectedComponentId && duplicateComponent(selectedComponentId),
  });

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const { active } = event;
    const component = active.data.current as DAppComponent;
    setDraggedComponent(component);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // Handle drag move for visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setDraggedComponent(null);

    const { active, over } = event;
    if (!over) return;

    const activeComponent = active.data.current as DAppComponent;
    const overId = over.id as string;

    // If dragging from library
    if (active.id.toString().startsWith('library-')) {
      const newComponent: DAppComponent = {
        ...activeComponent,
        id: generateId(),
      };

      // Add to canvas or nested container
      if (overId === 'canvas') {
        addComponent(newComponent);
      } else {
        // Handle nested drop
        addComponent(newComponent, overId);
      }
    } else {
      // Reordering existing components
      const oldIndex = currentPage.components.findIndex(c => c.id === active.id);
      const newIndex = currentPage.components.findIndex(c => c.id === overId);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        moveComponent(active.id as string, newIndex);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { pages: prevPages, theme: prevTheme } = history[newIndex];
      setPages(prevPages);
      setTheme(prevTheme);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { pages: nextPages, theme: nextTheme } = history[newIndex];
      setPages(nextPages);
      setTheme(nextTheme);
      setHistoryIndex(newIndex);
    }
  };

  const handleSave = () => {
    onSave?.(pages, theme);
  };

  const handlePublish = () => {
    onPublish?.(pages, theme);
  };

  const handlePageChange = (pageId: string) => {
    setCurrentPageId(pageId);
    setSelectedComponentId(null);
  };

  const handleAddPage = (page: DAppPage) => {
    setPages([...pages, page]);
    setCurrentPageId(page.id);
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length === 1) return;
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    if (currentPageId === pageId) {
      setCurrentPageId(newPages[0].id);
    }
  };

  const handleExport = () => {
    const data = {
      pages,
      theme,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dapp-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.pages && data.theme) {
          setPages(data.pages);
          setTheme(data.theme);
          setCurrentPageId(data.pages[0]?.id || 'home');
        }
      } catch (error) {
        console.error('Failed to import:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className={styles.builder}>
        <TopToolbar
          pages={pages}
          currentPageId={currentPageId}
          theme={theme}
          responsiveMode={responsiveMode}
          isPreviewMode={isPreviewMode}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onPageChange={handlePageChange}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onThemeChange={setTheme}
          onResponsiveModeChange={setResponsiveMode}
          onPreviewModeChange={setIsPreviewMode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onPublish={handlePublish}
          onExport={handleExport}
          onImport={handleImport}
        />

        <div className={styles.main}>
          {!isPreviewMode && (
            <ComponentLibrary
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          <Canvas
            ref={canvasRef}
            page={currentPage}
            theme={theme}
            responsiveMode={responsiveMode}
            isPreviewMode={isPreviewMode}
            selectedComponentId={selectedComponentId}
            isDragging={isDragging}
            onSelectComponent={setSelectedComponentId}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
            onDuplicateComponent={duplicateComponent}
          />

          {!isPreviewMode && selectedComponentId && (
            <PropertiesPanel
              component={currentPage.components.find(c => c.id === selectedComponentId)}
              theme={theme}
              onUpdateComponent={updateComponent}
              onClose={() => setSelectedComponentId(null)}
            />
          )}
        </div>

        <DragOverlay>
          {draggedComponent && (
            <DragOverlayContent component={draggedComponent} />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};