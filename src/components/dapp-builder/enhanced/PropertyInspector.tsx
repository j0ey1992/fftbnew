'use client';

import React, { useState } from 'react';
import { DAppComponent } from '@/types/visual-dapp-builder';
import { getComponent } from '@/lib/dapp-builder/component-registry';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styles from './PropertyInspector.module.css';

interface PropertyInspectorProps {
  component: DAppComponent | null;
  onUpdate: (updates: Partial<DAppComponent>) => void;
  onClose?: () => void;
}

export function PropertyInspector({ component, onUpdate, onClose }: PropertyInspectorProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'style' | 'layout' | 'responsive'>('properties');
  
  if (!component) {
    return (
      <div className={styles.inspector}>
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const componentConfig = getComponent(component.componentId);

  const handleStyleChange = (property: string, value: string) => {
    onUpdate({
      style: {
        ...component.style,
        [property]: value
      }
    });
  };

  const handleLayoutChange = (property: string, value: string | number) => {
    onUpdate({
      layout: {
        ...component.layout,
        [property]: value
      }
    });
  };

  const handlePositionChange = (property: string, value: string | number) => {
    onUpdate({
      position: {
        ...component.position,
        [property]: value
      }
    });
  };

  return (
    <div className={styles.inspector}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.componentInfo}>
          <span className={styles.componentIcon}>{componentConfig?.icon}</span>
          <div>
            <h3>{componentConfig?.name}</h3>
            <p>{componentConfig?.category}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'properties' ? styles.active : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'style' ? styles.active : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'layout' ? styles.active : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'responsive' ? styles.active : ''}`}
          onClick={() => setActiveTab('responsive')}
        >
          Responsive
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'properties' && (
          <div className={styles.section}>
            <p className={styles.sectionNote}>
              Component-specific properties are configured in the sidebar
            </p>
          </div>
        )}

        {activeTab === 'style' && (
          <>
            {/* Spacing */}
            <div className={styles.section}>
              <h4>Spacing</h4>
              <div className={styles.spacingGrid}>
                <div className={styles.spacingBox}>
                  <label>Margin</label>
                  <div className={styles.spacingInputs}>
                    <input
                      type="text"
                      placeholder="T"
                      value={component.style?.margin?.split(' ')[0] || ''}
                      onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="R"
                      value={component.style?.margin?.split(' ')[1] || ''}
                      onChange={(e) => handleStyleChange('marginRight', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="B"
                      value={component.style?.margin?.split(' ')[2] || ''}
                      onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="L"
                      value={component.style?.margin?.split(' ')[3] || ''}
                      onChange={(e) => handleStyleChange('marginLeft', e.target.value)}
                      className={styles.miniInput}
                    />
                  </div>
                </div>
                <div className={styles.spacingBox}>
                  <label>Padding</label>
                  <div className={styles.spacingInputs}>
                    <input
                      type="text"
                      placeholder="T"
                      value={component.style?.padding?.split(' ')[0] || ''}
                      onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="R"
                      value={component.style?.padding?.split(' ')[1] || ''}
                      onChange={(e) => handleStyleChange('paddingRight', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="B"
                      value={component.style?.padding?.split(' ')[2] || ''}
                      onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                      className={styles.miniInput}
                    />
                    <input
                      type="text"
                      placeholder="L"
                      value={component.style?.padding?.split(' ')[3] || ''}
                      onChange={(e) => handleStyleChange('paddingLeft', e.target.value)}
                      className={styles.miniInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className={styles.section}>
              <h4>Appearance</h4>
              <div className={styles.field}>
                <label>Background</label>
                <div className={styles.colorInput}>
                  <input
                    type="color"
                    value={component.style?.background || '#ffffff'}
                    onChange={(e) => handleStyleChange('background', e.target.value)}
                  />
                  <input
                    type="text"
                    value={component.style?.background || ''}
                    onChange={(e) => handleStyleChange('background', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div className={styles.field}>
                <label>Border Radius</label>
                <input
                  type="text"
                  value={component.style?.borderRadius || ''}
                  onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  placeholder="8px"
                />
              </div>

              <div className={styles.field}>
                <label>Box Shadow</label>
                <select
                  value={component.style?.boxShadow || ''}
                  onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                >
                  <option value="">None</option>
                  <option value="0 1px 3px rgba(0,0,0,0.12)">Small</option>
                  <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                  <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
                  <option value="custom">Custom...</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={component.style?.opacity || 1}
                  onChange={(e) => handleStyleChange('opacity', e.target.value)}
                />
                <span>{component.style?.opacity || 1}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <div className={styles.section}>
              <h4>Size</h4>
              <div className={styles.field}>
                <label>Width</label>
                <input
                  type="text"
                  value={component.position?.width || ''}
                  onChange={(e) => handlePositionChange('width', e.target.value)}
                  placeholder="auto"
                />
              </div>
              <div className={styles.field}>
                <label>Height</label>
                <input
                  type="text"
                  value={component.position?.height || ''}
                  onChange={(e) => handlePositionChange('height', e.target.value)}
                  placeholder="auto"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h4>Flexbox</h4>
              <div className={styles.field}>
                <label>Flex Grow</label>
                <input
                  type="number"
                  value={component.layout?.flexGrow || 0}
                  onChange={(e) => handleLayoutChange('flexGrow', parseInt(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label>Align Self</label>
                <select
                  value={component.layout?.alignSelf || ''}
                  onChange={(e) => handleLayoutChange('alignSelf', e.target.value)}
                >
                  <option value="">Auto</option>
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'responsive' && (
          <div className={styles.section}>
            <h4>Breakpoints</h4>
            <div className={styles.breakpoints}>
              <button className={styles.breakpointButton}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <rect x="2" y="4" width="16" height="12" rx="1" />
                </svg>
                Desktop
              </button>
              <button className={styles.breakpointButton}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <rect x="4" y="2" width="12" height="16" rx="1" />
                </svg>
                Tablet
              </button>
              <button className={styles.breakpointButton}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <rect x="6" y="2" width="8" height="16" rx="1" />
                </svg>
                Mobile
              </button>
            </div>
            <p className={styles.sectionNote}>
              Configure different styles for each device size
            </p>
          </div>
        )}
      </div>
    </div>
  );
}