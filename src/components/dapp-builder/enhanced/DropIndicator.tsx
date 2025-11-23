'use client';

import React from 'react';
import styles from './DropIndicator.module.css';

interface DropIndicatorProps {
  position: 'before' | 'after' | 'inside';
  orientation?: 'horizontal' | 'vertical';
  active?: boolean;
}

export function DropIndicator({ 
  position, 
  orientation = 'horizontal',
  active = false 
}: DropIndicatorProps) {
  return (
    <div 
      className={`
        ${styles.dropIndicator} 
        ${styles[position]} 
        ${styles[orientation]}
        ${active ? styles.active : ''}
      `}
    >
      <div className={styles.line} />
      <div className={styles.handle}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="3" />
        </svg>
      </div>
    </div>
  );
}