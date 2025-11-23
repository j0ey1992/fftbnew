'use client';

import React, { useState } from 'react';
import type { DAppComponent, DAppTheme } from '@/types/dapp-builder';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { ColorPicker } from './components/ColorPicker';
import { SpacingControls } from './components/SpacingControls';
import { TypographyControls } from './components/TypographyControls';
import { LayoutControls } from './components/LayoutControls';
import styles from './PropertiesPanel.module.css';

interface PropertiesPanelProps {
  component: DAppComponent | undefined;
  theme: DAppTheme;
  onUpdateComponent: (id: string, updates: Partial<DAppComponent>) => void;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  component: React.ReactNode;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  component,
  theme,
  onUpdateComponent,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'content', 'style'])
  );

  if (!component) return null;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleUpdate = (updates: Partial<DAppComponent>) => {
    onUpdateComponent(component.id, updates);
  };

  const sections: Section[] = [
    {
      id: 'general',
      title: 'General',
      component: (
        <div className={styles.sectionContent}>
          <div className={styles.field}>
            <label>Component ID</label>
            <input
              type="text"
              value={component.id}
              disabled
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Type</label>
            <input
              type="text"
              value={component.type}
              disabled
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Custom Class</label>
            <input
              type="text"
              value={component.props.className || ''}
              onChange={(e) => handleUpdate({
                props: { ...component.props, className: e.target.value }
              })}
              placeholder="Enter custom CSS class"
              className={styles.input}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'content',
      title: 'Content',
      component: (
        <div className={styles.sectionContent}>
          {renderContentFields(component, handleUpdate)}
        </div>
      ),
    },
    {
      id: 'style',
      title: 'Style',
      component: (
        <div className={styles.sectionContent}>
          <div className={styles.field}>
            <label>Background Color</label>
            <ColorPicker
              color={component.style?.backgroundColor || ''}
              onChange={(color) => handleUpdate({
                style: { ...component.style, backgroundColor: color }
              })}
            />
          </div>
          <div className={styles.field}>
            <label>Text Color</label>
            <ColorPicker
              color={component.style?.color || ''}
              onChange={(color) => handleUpdate({
                style: { ...component.style, color: color }
              })}
            />
          </div>
          <div className={styles.field}>
            <label>Border Radius</label>
            <input
              type="range"
              min="0"
              max="50"
              value={parseInt(component.style?.borderRadius || '0')}
              onChange={(e) => handleUpdate({
                style: { ...component.style, borderRadius: `${e.target.value}px` }
              })}
              className={styles.slider}
            />
            <span>{component.style?.borderRadius || '0px'}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'spacing',
      title: 'Spacing',
      component: (
        <SpacingControls
          padding={component.style?.padding || ''}
          margin={component.style?.margin || ''}
          onChange={(spacing) => handleUpdate({
            style: { ...component.style, ...spacing }
          })}
        />
      ),
    },
    {
      id: 'typography',
      title: 'Typography',
      component: (
        <TypographyControls
          fontSize={component.style?.fontSize || ''}
          fontWeight={component.style?.fontWeight || ''}
          lineHeight={component.style?.lineHeight || ''}
          textAlign={component.style?.textAlign as any || ''}
          onChange={(typography) => handleUpdate({
            style: { ...component.style, ...typography }
          })}
        />
      ),
    },
    {
      id: 'layout',
      title: 'Layout',
      component: (
        <LayoutControls
          display={component.style?.display || ''}
          flexDirection={component.style?.flexDirection as any || ''}
          justifyContent={component.style?.justifyContent as any || ''}
          alignItems={component.style?.alignItems as any || ''}
          gap={component.style?.gap || ''}
          onChange={(layout) => handleUpdate({
            style: { ...component.style, ...layout }
          })}
        />
      ),
    },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Properties</h3>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className={styles.sections}>
        {sections.map((section) => (
          <div key={section.id} className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.id)}
            >
              <span className={styles.sectionIcon}>
                {expandedSections.has(section.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
              <span className={styles.sectionTitle}>{section.title}</span>
            </button>
            {expandedSections.has(section.id) && section.component}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to render content fields based on component type
function renderContentFields(
  component: DAppComponent,
  handleUpdate: (updates: Partial<DAppComponent>) => void
): React.ReactNode {
  const { type, props, content } = component;

  switch (type) {
    case 'text':
    case 'heading':
    case 'paragraph':
      return (
        <div className={styles.field}>
          <label>Text Content</label>
          <textarea
            value={content || ''}
            onChange={(e) => handleUpdate({ content: e.target.value })}
            rows={4}
            className={styles.textarea}
          />
        </div>
      );
    case 'button':
      return (
        <>
          <div className={styles.field}>
            <label>Button Text</label>
            <input
              type="text"
              value={content || ''}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Button Action</label>
            <input
              type="text"
              value={props.onClick || ''}
              onChange={(e) => handleUpdate({
                props: { ...props, onClick: e.target.value }
              })}
              placeholder="e.g., /contact or javascript:alert('clicked')"
              className={styles.input}
            />
          </div>
        </>
      );
    case 'image':
      return (
        <>
          <div className={styles.field}>
            <label>Image URL</label>
            <input
              type="text"
              value={props.src || ''}
              onChange={(e) => handleUpdate({
                props: { ...props, src: e.target.value }
              })}
              placeholder="https://example.com/image.jpg"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Alt Text</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => handleUpdate({
                props: { ...props, alt: e.target.value }
              })}
              placeholder="Image description"
              className={styles.input}
            />
          </div>
        </>
      );
    case 'link':
      return (
        <>
          <div className={styles.field}>
            <label>Link Text</label>
            <input
              type="text"
              value={content || ''}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>URL</label>
            <input
              type="text"
              value={props.href || ''}
              onChange={(e) => handleUpdate({
                props: { ...props, href: e.target.value }
              })}
              placeholder="https://example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Open in new tab</label>
            <input
              type="checkbox"
              checked={props.target === '_blank'}
              onChange={(e) => handleUpdate({
                props: { ...props, target: e.target.checked ? '_blank' : '_self' }
              })}
              className={styles.checkbox}
            />
          </div>
        </>
      );
    default:
      return (
        <div className={styles.field}>
          <p className={styles.helpText}>
            Content configuration for {type} components
          </p>
        </div>
      );
  }
}