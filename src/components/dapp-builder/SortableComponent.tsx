'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DAppComponent, DAppTheme } from '@/types/dapp-builder';
import { ComponentRenderer } from './ComponentRenderer';
import { Copy, Trash2, MoreVertical, Edit } from 'lucide-react';
import styles from './SortableComponent.module.css';

interface SortableComponentProps {
  component: DAppComponent;
  theme: DAppTheme;
  isSelected: boolean;
  isPreviewMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DAppComponent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  theme,
  isSelected,
  isPreviewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    disabled: isPreviewMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPreviewMode) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleClickOutside = () => {
    setShowContextMenu(false);
  };

  React.useEffect(() => {
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sortableComponent} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={!isPreviewMode ? onSelect : undefined}
      onContextMenu={handleContextMenu}
      {...attributes}
    >
      {!isPreviewMode && (
        <div className={styles.componentOverlay}>
          <div className={styles.componentLabel}>
            <span className={styles.componentType}>{component.type}</span>
            {component.id && (
              <span className={styles.componentId}>#{component.id}</span>
            )}
          </div>
          <div className={styles.dragHandle} {...listeners}>
            <MoreVertical size={16} />
          </div>
        </div>
      )}

      <ComponentRenderer
        component={component}
        theme={theme}
        isEditing={!isPreviewMode}
        onUpdate={onUpdate}
      />

      {showContextMenu && (
        <div
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.contextMenuItem}
            onClick={() => {
              onSelect();
              setShowContextMenu(false);
            }}
          >
            <Edit size={16} />
            Edit Properties
          </button>
          <button
            className={styles.contextMenuItem}
            onClick={() => {
              onDuplicate();
              setShowContextMenu(false);
            }}
          >
            <Copy size={16} />
            Duplicate
          </button>
          <div className={styles.contextMenuDivider} />
          <button
            className={`${styles.contextMenuItem} ${styles.danger}`}
            onClick={() => {
              onDelete();
              setShowContextMenu(false);
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};