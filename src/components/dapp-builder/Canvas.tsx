'use client';

import React, { forwardRef, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { DAppPage, DAppTheme, ResponsiveMode, DAppComponent } from '@/types/dapp-builder';
import { SortableComponent } from './SortableComponent';
import { Grid3X3, Smartphone, Tablet, Monitor } from 'lucide-react';
import styles from './Canvas.module.css';

interface CanvasProps {
  page: DAppPage;
  theme: DAppTheme;
  responsiveMode: ResponsiveMode;
  isPreviewMode: boolean;
  selectedComponentId: string | null;
  isDragging: boolean;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<DAppComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>((
  {
    page,
    theme,
    responsiveMode,
    isPreviewMode,
    selectedComponentId,
    isDragging,
    onSelectComponent,
    onUpdateComponent,
    onDeleteComponent,
    onDuplicateComponent,
  },
  ref
) => {
  const [showGrid, setShowGrid] = useState(true);
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const canvasWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }[responsiveMode];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasHeader}>
        <div className={styles.pageInfo}>
          <h2>{page.name}</h2>
          <span className={styles.pagePath}>{page.path}</span>
        </div>
        <div className={styles.canvasControls}>
          <button
            className={`${styles.gridToggle} ${showGrid ? styles.active : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
          >
            <Grid3X3 size={18} />
          </button>
          <div className={styles.responsiveIndicator}>
            {responsiveMode === 'desktop' && <Monitor size={18} />}
            {responsiveMode === 'tablet' && <Tablet size={18} />}
            {responsiveMode === 'mobile' && <Smartphone size={18} />}
            <span>{responsiveMode}</span>
          </div>
        </div>
      </div>

      <div className={styles.canvasWrapper}>
        <div
          ref={(node) => {
            setNodeRef(node);
            if (ref && 'current' in ref) {
              ref.current = node;
            }
          }}
          className={`${styles.canvas} ${isOver ? styles.dragOver : ''} ${showGrid ? styles.showGrid : ''}`}
          style={{
            width: canvasWidth,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily,
          }}
          onClick={handleCanvasClick}
        >
          {page.components.length === 0 && !isDragging ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎨</div>
              <h3>Start building your dApp</h3>
              <p>Drag components from the library to get started</p>
            </div>
          ) : (
            <SortableContext
              items={page.components.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.componentList}>
                {page.components.map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    theme={theme}
                    isSelected={selectedComponentId === component.id}
                    isPreviewMode={isPreviewMode}
                    onSelect={() => onSelectComponent(component.id)}
                    onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                    onDelete={() => onDeleteComponent(component.id)}
                    onDuplicate={() => onDuplicateComponent(component.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {isDragging && (
            <div className={styles.dropIndicator}>
              <div className={styles.dropZone}>
                Drop component here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';