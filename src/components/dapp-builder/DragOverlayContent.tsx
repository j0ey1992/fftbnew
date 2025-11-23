'use client';

import React from 'react';
import type { DAppComponent } from '@/types/dapp-builder';
import styles from './DragOverlayContent.module.css';

interface DragOverlayContentProps {
  component: DAppComponent;
}

export const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ component }) => {
  return (
    <div className={styles.dragOverlay}>
      <div className={styles.componentPreview}>
        <div className={styles.componentIcon}>
          {getComponentIcon(component.type)}
        </div>
        <div className={styles.componentInfo}>
          <span className={styles.componentType}>{component.type}</span>
          {component.id && (
            <span className={styles.componentId}>#{component.id}</span>
          )}
        </div>
      </div>
    </div>
  );
};

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    header: '🎯',
    footer: '🦶',
    navigation: '🧭',
    hero: '🦸',
    card: '🃏',
    grid: '⚏',
    list: '📋',
    table: '📊',
    form: '📝',
    input: '⌨️',
    button: '🔘',
    modal: '🪟',
    sidebar: '📁',
    tabs: '🗂️',
    accordion: '🪗',
    carousel: '🎠',
    gallery: '🖼️',
    video: '🎬',
    image: '🌄',
    text: '📄',
    heading: '📰',
    paragraph: '📃',
    link: '🔗',
    divider: '➖',
    spacer: '📏',
    container: '📦',
    row: '↔️',
    column: '↕️',
    section: '📑',
  };
  return icons[type] || '📦';
}