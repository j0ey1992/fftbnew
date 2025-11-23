'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { VisualDApp, DAppPage } from '@/types/visual-dapp-builder';
import { Section } from '@/types/enhanced-dapp-builder';
// import { FlexibleLayoutSystem } from './FlexibleLayoutSystem';
import { ComponentRenderer } from '../ComponentRenderer';
import styles from './ModernPreview.module.css';

interface ModernPreviewProps {
  dapp: VisualDApp;
  currentPage: DAppPage;
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isDragging?: boolean;
  onComponentSelect?: (componentId: string) => void;
  onComponentUpdate?: (componentId: string, updates: any) => void;
  onSectionUpdate?: (sectionId: string, components: any[]) => void;
}

export function ModernPreview({
  dapp,
  currentPage,
  device,
  onDeviceChange,
  isFullscreen,
  onToggleFullscreen,
  isDragging,
  onComponentSelect,
  onComponentUpdate,
  onSectionUpdate
}: ModernPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [showGrid, setShowGrid] = useState(false);
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');

  // Convert page components to sections
  const sections: Section[] = currentPage.sections || [
    {
      id: 'main',
      name: 'Main Content',
      type: 'content',
      layout: {
        type: 'stack',
        gap: '2rem'
      },
      style: {
        minHeight: '400px',
        padding: '2rem'
      },
      components: currentPage.components || []
    }
  ];

  const getDeviceStyles = () => {
    const baseStyles: React.CSSProperties = {
      width: '100%',
      height: '100%',
      margin: '0 auto',
      transition: 'all 0.3s ease'
    };

    switch (device) {
      case 'mobile':
        return { ...baseStyles, maxWidth: '375px' };
      case 'tablet':
        return { ...baseStyles, maxWidth: '768px' };
      default:
        return baseStyles;
    }
  };

  return (
    <div className={`${styles.preview} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Enhanced Controls */}
      <div className={styles.controls}>
        <div className={styles.deviceSelector}>
          <button
            className={`${styles.deviceButton} ${device === 'desktop' ? styles.active : ''}`}
            onClick={() => onDeviceChange('desktop')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="2" y="3" width="16" height="11" rx="1" />
              <line x1="6" y1="17" x2="14" y2="17" />
            </svg>
            Desktop
          </button>
          <button
            className={`${styles.deviceButton} ${device === 'tablet' ? styles.active : ''}`}
            onClick={() => onDeviceChange('tablet')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="4" y="2" width="12" height="16" rx="1" />
            </svg>
            Tablet
          </button>
          <button
            className={`${styles.deviceButton} ${device === 'mobile' ? styles.active : ''}`}
            onClick={() => onDeviceChange('mobile')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="6" y="2" width="8" height="16" rx="1" />
            </svg>
            Mobile
          </button>
        </div>

        <div className={styles.pageInfo}>
          <span>{currentPage.name}</span>
          <code>{currentPage.path}</code>
        </div>

        <div className={styles.viewControls}>
          {/* Edit/Preview Mode Toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeButton} ${previewMode === 'edit' ? styles.active : ''}`}
              onClick={() => setPreviewMode('edit')}
            >
              Edit
            </button>
            <button
              className={`${styles.modeButton} ${previewMode === 'preview' ? styles.active : ''}`}
              onClick={() => setPreviewMode('preview')}
            >
              Preview
            </button>
          </div>

          {/* View Options */}
          <button
            className={`${styles.viewOption} ${showGrid ? styles.active : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M0 0h4v4H0zM6 0h4v4H6zM12 0h4v4h-4zM0 6h4v4H0zM6 6h4v4H6zM12 6h4v4h-4zM0 12h4v4H0zM6 12h4v4H6zM12 12h4v4h-4z" />
            </svg>
          </button>

          <button
            className={`${styles.viewOption} ${contrast === 'high' ? styles.active : ''}`}
            onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
            title="Toggle high contrast"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 1v14" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 1a7 7 0 0 1 0 14" fill="currentColor"/>
            </svg>
          </button>

          {onToggleFullscreen && (
            <button
              className={styles.viewOption}
              onClick={onToggleFullscreen}
              title="Toggle fullscreen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Device Frame */}
      <div className={`${styles.deviceContainer} ${styles[device]}`}>
        <div 
          className={`${styles.device} ${contrast === 'high' ? styles.highContrast : ''}`}
          style={getDeviceStyles()}
        >
          {/* Minimal Header for Preview */}
          {previewMode === 'preview' && (
            <header className={styles.minimalHeader}>
              <div className={styles.headerContent}>
                <div className={styles.logo}>
                  {dapp.globalHeader?.config?.title || 'My DApp'}
                </div>
                <button className={styles.connectButton}>
                  Connect Wallet
                </button>
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className={`${styles.mainContent} ${showGrid ? styles.showGrid : ''}`}>
            {/* Simple component rendering for now */}
            <div className={styles.componentContainer}>
              {currentPage.components.map((component) => (
                <div
                  key={component.id}
                  className={styles.componentWrapper}
                  data-component={component.componentId}
                  data-component-type={component.componentId}
                  onClick={() => previewMode === 'edit' && onComponentSelect?.(component.id)}
                >
                  <ComponentRenderer
                    component={component}
                    isEditing={previewMode === 'edit'}
                  />
                </div>
              ))}
              
              {currentPage.components.length === 0 && (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <p>Drop components here to get started</p>
                </div>
              )}
            </div>
          </main>

          {/* Minimal Footer for Preview */}
          {previewMode === 'preview' && (
            <footer className={styles.minimalFooter}>
              <p>{dapp.globalFooter?.config?.copyright || `© ${new Date().getFullYear()} My DApp`}</p>
            </footer>
          )}
        </div>

        {/* Device Frame Decoration */}
        {device !== 'desktop' && (
          <div className={styles.deviceFrame}>
            {device === 'mobile' && <div className={styles.notch} />}
          </div>
        )}
      </div>

      {/* Size Indicator */}
      <div className={styles.sizeIndicator}>
        {device === 'mobile' && '375px'}
        {device === 'tablet' && '768px'}
        {device === 'desktop' && 'Responsive'}
      </div>
    </div>
  );
}