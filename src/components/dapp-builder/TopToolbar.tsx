'use client';

import React, { useRef } from 'react';
import type { DAppPage, DAppTheme, ResponsiveMode } from '@/types/dapp-builder';
import {
  Save,
  Upload,
  Download,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  Palette,
} from 'lucide-react';
import styles from './TopToolbar.module.css';

interface TopToolbarProps {
  pages: DAppPage[];
  currentPageId: string;
  theme: DAppTheme;
  responsiveMode: ResponsiveMode;
  isPreviewMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onPageChange: (pageId: string) => void;
  onAddPage: (page: DAppPage) => void;
  onDeletePage: (pageId: string) => void;
  onThemeChange: (theme: DAppTheme) => void;
  onResponsiveModeChange: (mode: ResponsiveMode) => void;
  onPreviewModeChange: (preview: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  pages,
  currentPageId,
  theme,
  responsiveMode,
  isPreviewMode,
  canUndo,
  canRedo,
  onPageChange,
  onAddPage,
  onDeletePage,
  onThemeChange,
  onResponsiveModeChange,
  onPreviewModeChange,
  onUndo,
  onRedo,
  onSave,
  onPublish,
  onExport,
  onImport,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage: DAppPage = {
      id: `page-${Date.now()}`,
      name: `Page ${newPageNumber}`,
      path: `/page-${newPageNumber}`,
      components: [],
      meta: {
        title: `Page ${newPageNumber}`,
        description: '',
      },
    };
    onAddPage(newPage);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const responsiveModes: ResponsiveMode[] = ['desktop', 'tablet', 'mobile'];

  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🚀</span>
          <span className={styles.logoText}>dApp Builder</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.pageSelector}>
          <select
            value={currentPageId}
            onChange={(e) => onPageChange(e.target.value)}
            className={styles.select}
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name} ({page.path})
              </option>
            ))}
          </select>
          <button
            className={styles.iconButton}
            onClick={handleAddPage}
            title="Add new page"
          >
            <Plus size={18} />
          </button>
          {pages.length > 1 && (
            <button
              className={styles.iconButton}
              onClick={() => onDeletePage(currentPageId)}
              title="Delete current page"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.iconButton} ${!canUndo ? styles.disabled : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            className={`${styles.iconButton} ${!canRedo ? styles.disabled : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.responsiveButtons}>
          {responsiveModes.map((mode) => (
            <button
              key={mode}
              className={`${styles.iconButton} ${responsiveMode === mode ? styles.active : ''}`}
              onClick={() => onResponsiveModeChange(mode)}
              title={`${mode} view`}
            >
              {mode === 'desktop' && <Monitor size={18} />}
              {mode === 'tablet' && <Tablet size={18} />}
              {mode === 'mobile' && <Smartphone size={18} />}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <button
          className={`${styles.iconButton} ${isPreviewMode ? styles.active : ''}`}
          onClick={() => onPreviewModeChange(!isPreviewMode)}
          title={isPreviewMode ? 'Exit preview' : 'Preview'}
        >
          {isPreviewMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className={`${styles.section} ${styles.actions}`}>
        <button
          className={styles.iconButton}
          onClick={handleImportClick}
          title="Import"
        >
          <Upload size={18} />
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImportChange}
          style={{ display: 'none' }}
        />
        <button
          className={styles.iconButton}
          onClick={onExport}
          title="Export"
        >
          <Download size={18} />
        </button>
        <button
          className={styles.button}
          onClick={onSave}
          title="Save (Ctrl+S)"
        >
          <Save size={18} />
          Save
        </button>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={onPublish}
        >
          <Upload size={18} />
          Publish
        </button>
      </div>
    </div>
  );
};