'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DAppComponent } from '@/types/visual-dapp-builder';
import { ComponentRenderer } from '../ComponentRenderer';
import styles from './FlexibleLayoutSystem.module.css';

interface Section {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'content' | 'cta' | 'footer' | 'custom';
  layout: {
    type: 'flex' | 'grid' | 'stack' | 'masonry';
    direction?: 'row' | 'column';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'center' | 'end' | 'stretch';
    gap?: string;
    columns?: number | string;
    rows?: number | string;
  };
  style: {
    minHeight?: string;
    maxHeight?: string;
    background?: string;
    backgroundImage?: string;
    backgroundGradient?: string;
    padding?: string;
    margin?: string;
    borderTop?: string;
    borderBottom?: string;
  };
  components: DAppComponent[];
  locked?: boolean;
}

interface FlexibleLayoutSystemProps {
  sections: Section[];
  onSectionUpdate: (sectionId: string, components: DAppComponent[]) => void;
  onComponentSelect: (componentId: string) => void;
  onComponentUpdate: (componentId: string, updates: Partial<DAppComponent>) => void;
  selectedComponentId?: string;
  isPreview?: boolean;
}

export function FlexibleLayoutSystem({
  sections,
  onSectionUpdate,
  onComponentSelect,
  onComponentUpdate,
  selectedComponentId,
  isPreview
}: FlexibleLayoutSystemProps) {
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Find insertion point based on mouse position
    const components = sections.find(s => s.id === sectionId)?.components || [];
    let index = components.length;
    
    // Calculate component positions to find insertion point
    const componentElements = e.currentTarget.querySelectorAll('[data-component-id]');
    for (let i = 0; i < componentElements.length; i++) {
      const elem = componentElements[i] as HTMLElement;
      const elemRect = elem.getBoundingClientRect();
      const elemCenter = elemRect.top + elemRect.height / 2 - rect.top;
      
      if (y < elemCenter) {
        index = i;
        break;
      }
    }
    
    setDragOverSection(sectionId);
    setInsertIndex(index);
  }, [sections]);

  const handleDragLeave = useCallback(() => {
    setDragOverSection(null);
    setInsertIndex(null);
  }, []);

  const renderSection = (section: Section) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `section-${section.id}`,
      data: { sectionId: section.id }
    });

    const layoutClasses = {
      flex: styles.flexLayout,
      grid: styles.gridLayout,
      stack: styles.stackLayout,
      masonry: styles.masonryLayout
    };

    return (
      <div
        key={section.id}
        ref={setNodeRef}
        className={`${styles.section} ${layoutClasses[section.layout.type]} ${
          isOver || dragOverSection === section.id ? styles.dragOver : ''
        }`}
        style={{
          ...section.style,
          flexDirection: section.layout.direction as any,
          justifyContent: section.layout.justify,
          alignItems: section.layout.align,
          gap: section.layout.gap,
          gridTemplateColumns: section.layout.columns as string,
          gridTemplateRows: section.layout.rows as string,
        }}
        onDragOver={(e) => handleDragOver(e, section.id)}
        onDragLeave={handleDragLeave}
        data-section-type={section.type}
      >
        {/* Section Header */}
        {!isPreview && (
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>{section.name || section.type}</span>
            <div className={styles.sectionActions}>
              <button className={styles.layoutToggle} title="Change layout">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" />
                  <rect x="9" y="1" width="6" height="6" />
                  <rect x="1" y="9" width="6" height="6" />
                  <rect x="9" y="9" width="6" height="6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Components */}
        <div className={styles.componentContainer}>
          {section.components.length === 0 && !isPreview && (
            <div className={styles.emptySection}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p>Drop components here</p>
            </div>
          )}

          {section.components.map((component, index) => (
            <React.Fragment key={component.id}>
              {/* Drop indicator */}
              {dragOverSection === section.id && insertIndex === index && (
                <div className={styles.dropIndicator} />
              )}
              
              <div
                className={`${styles.component} ${
                  selectedComponentId === component.id ? styles.selected : ''
                }`}
                onClick={() => onComponentSelect(component.id)}
                data-component-id={component.id}
                style={{
                  gridColumn: (component as any).layout?.gridColumn,
                  gridRow: (component as any).layout?.gridRow,
                  order: (component as any).position?.order
                }}
              >
                {/* Resize handles */}
                {!isPreview && selectedComponentId === component.id && (
                  <>
                    <div className={`${styles.resizeHandle} ${styles.resizeE}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeW}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeN}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeS}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeNE}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeNW}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeSE}`} />
                    <div className={`${styles.resizeHandle} ${styles.resizeSW}`} />
                  </>
                )}
                
                <ComponentRenderer component={component} isEditing={!isPreview} />
              </div>
            </React.Fragment>
          ))}
          
          {/* Final drop indicator */}
          {dragOverSection === section.id && insertIndex === section.components.length && (
            <div className={styles.dropIndicator} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layoutSystem}>
      {sections.map(renderSection)}
      
      {/* Add Section Button */}
      {!isPreview && (
        <button className={styles.addSection}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" />
            <line x1="10" y1="6" x2="10" y2="14" />
            <line x1="6" y1="10" x2="14" y2="10" />
          </svg>
          Add Section
        </button>
      )}
    </div>
  );
}