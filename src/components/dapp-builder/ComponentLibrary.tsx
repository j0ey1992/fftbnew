'use client';

import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ComponentCategory, ComponentType, DAppComponent } from '@/types/dapp-builder';
import { componentLibrary } from './utils/componentLibrary';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './ComponentLibrary.module.css';

interface ComponentLibraryProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface DraggableComponentProps {
  component: DAppComponent;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${component.type}-${Date.now()}`,
    data: component,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      className={styles.component}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className={styles.componentIcon}>
        {getComponentIcon(component.type)}
      </div>
      <span className={styles.componentName}>{component.type}</span>
    </div>
  );
};

interface CategorySectionProps {
  category: ComponentCategory;
  components: DAppComponent[];
  isExpanded: boolean;
  onToggle: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  components,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className={styles.category}>
      <button className={styles.categoryHeader} onClick={onToggle}>
        <span className={styles.categoryIcon}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className={styles.categoryName}>{category}</span>
        <span className={styles.categoryCount}>{components.length}</span>
      </button>
      {isExpanded && (
        <div className={styles.componentList}>
          {components.map((component, index) => (
            <DraggableComponent
              key={`${component.type}-${index}`}
              component={component}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(['Layout', 'Content', 'Forms'])
  );

  // Filter components based on search
  const filteredLibrary = useMemo(() => {
    if (!searchQuery) return componentLibrary;

    const query = searchQuery.toLowerCase();
    const filtered: Record<ComponentCategory, DAppComponent[]> = {} as any;

    Object.entries(componentLibrary).forEach(([category, components]) => {
      const matchingComponents = components.filter(
        (component) =>
          component.type.toLowerCase().includes(query) ||
          component.category.toLowerCase().includes(query)
      );
      if (matchingComponents.length > 0) {
        filtered[category as ComponentCategory] = matchingComponents;
      }
    });

    return filtered;
  }, [searchQuery]);

  const toggleCategory = (category: ComponentCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <h3 className={styles.title}>Components</h3>
        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.categories}>
        {Object.entries(filteredLibrary).map(([category, components]) => (
          <CategorySection
            key={category}
            category={category as ComponentCategory}
            components={components}
            isExpanded={expandedCategories.has(category as ComponentCategory)}
            onToggle={() => toggleCategory(category as ComponentCategory)}
          />
        ))}
      </div>

      {Object.keys(filteredLibrary).length === 0 && (
        <div className={styles.noResults}>
          <p>No components found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get component icons
function getComponentIcon(type: ComponentType): string {
  const icons: Record<ComponentType, string> = {
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