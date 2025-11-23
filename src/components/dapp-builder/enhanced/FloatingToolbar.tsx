'use client';

import React from 'react';
import styles from './FloatingToolbar.module.css';

interface FloatingToolbarProps {
  selectedCount: number;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onAlign?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute?: (direction: 'horizontal' | 'vertical') => void;
  onLayer?: (action: 'front' | 'forward' | 'backward' | 'back') => void;
}

export function FloatingToolbar({
  selectedCount,
  onDelete,
  onDuplicate,
  onGroup,
  onAlign,
  onDistribute,
  onLayer
}: FloatingToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={styles.toolbar}>
      {/* Selection info */}
      <div className={styles.selectionInfo}>
        {selectedCount} selected
      </div>

      <div className={styles.divider} />

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.action}
          onClick={onDuplicate}
          title="Duplicate (Ctrl+D)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="2" y="2" width="10" height="10" rx="1" />
            <path d="M6 6h8v8H6z" />
          </svg>
        </button>

        <button
          className={styles.action}
          onClick={onDelete}
          title="Delete (Del)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M6 2h4M2 4h12M4 4v10h8V4M7 7v4M9 7v4" />
          </svg>
        </button>
      </div>

      {selectedCount > 1 && (
        <>
          <div className={styles.divider} />

          {/* Alignment */}
          <div className={styles.group}>
            <button
              className={styles.action}
              onClick={() => onAlign?.('left')}
              title="Align left"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <line x1="2" y1="2" x2="2" y2="14" />
                <rect x="4" y="3" width="6" height="3" />
                <rect x="4" y="10" width="10" height="3" />
              </svg>
            </button>
            <button
              className={styles.action}
              onClick={() => onAlign?.('center')}
              title="Align center"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <line x1="8" y1="2" x2="8" y2="14" />
                <rect x="5" y="3" width="6" height="3" />
                <rect x="3" y="10" width="10" height="3" />
              </svg>
            </button>
            <button
              className={styles.action}
              onClick={() => onAlign?.('right')}
              title="Align right"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <line x1="14" y1="2" x2="14" y2="14" />
                <rect x="6" y="3" width="6" height="3" />
                <rect x="2" y="10" width="10" height="3" />
              </svg>
            </button>
          </div>

          <div className={styles.divider} />

          {/* Distribution */}
          <div className={styles.group}>
            <button
              className={styles.action}
              onClick={() => onDistribute?.('horizontal')}
              title="Distribute horizontally"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="6" width="3" height="4" />
                <rect x="6.5" y="6" width="3" height="4" />
                <rect x="11" y="6" width="3" height="4" />
              </svg>
            </button>
            <button
              className={styles.action}
              onClick={() => onDistribute?.('vertical')}
              title="Distribute vertically"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="6" y="2" width="4" height="3" />
                <rect x="6" y="6.5" width="4" height="3" />
                <rect x="6" y="11" width="4" height="3" />
              </svg>
            </button>
          </div>

          <div className={styles.divider} />

          {/* Group */}
          <button
            className={styles.action}
            onClick={onGroup}
            title="Group (Ctrl+G)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <rect x="2" y="2" width="12" height="12" rx="1" strokeDasharray="2 2" />
              <rect x="4" y="4" width="4" height="4" />
              <rect x="8" y="8" width="4" height="4" />
            </svg>
          </button>
        </>
      )}

      <div className={styles.divider} />

      {/* Layer controls */}
      <div className={styles.group}>
        <button
          className={styles.action}
          onClick={() => onLayer?.('forward')}
          title="Bring forward"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="4" y="8" width="8" height="6" opacity="0.3" />
            <rect x="2" y="2" width="8" height="6" />
          </svg>
        </button>
        <button
          className={styles.action}
          onClick={() => onLayer?.('backward')}
          title="Send backward"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="2" y="2" width="8" height="6" opacity="0.3" />
            <rect x="4" y="8" width="8" height="6" />
          </svg>
        </button>
      </div>
    </div>
  );
}