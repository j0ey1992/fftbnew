'use client';

import React from 'react';
import styles from './LayoutControls.module.css';

interface LayoutControlsProps {
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
  onChange: (layout: {
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
  }) => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  display,
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  onChange,
}) => {
  return (
    <div className={styles.layoutControls}>
      <div className={styles.field}>
        <label>Display</label>
        <select
          value={display}
          onChange={(e) => onChange({ display: e.target.value })}
        >
          <option value="">Default</option>
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline">Inline</option>
          <option value="inline-block">Inline Block</option>
          <option value="none">None</option>
        </select>
      </div>

      {display === 'flex' && (
        <>
          <div className={styles.field}>
            <label>Flex Direction</label>
            <select
              value={flexDirection}
              onChange={(e) => onChange({ flexDirection: e.target.value })}
            >
              <option value="">Default</option>
              <option value="row">Row</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column">Column</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Justify Content</label>
            <select
              value={justifyContent}
              onChange={(e) => onChange({ justifyContent: e.target.value })}
            >
              <option value="">Default</option>
              <option value="flex-start">Start</option>
              <option value="flex-end">End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Align Items</label>
            <select
              value={alignItems}
              onChange={(e) => onChange({ alignItems: e.target.value })}
            >
              <option value="">Default</option>
              <option value="flex-start">Start</option>
              <option value="flex-end">End</option>
              <option value="center">Center</option>
              <option value="stretch">Stretch</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Gap</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => onChange({ gap: e.target.value })}
              placeholder="10px"
            />
          </div>
        </>
      )}
    </div>
  );
};