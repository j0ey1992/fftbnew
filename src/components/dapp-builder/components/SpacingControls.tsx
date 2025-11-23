'use client';

import React from 'react';
import styles from './SpacingControls.module.css';

interface SpacingControlsProps {
  padding: string;
  margin: string;
  onChange: (spacing: { padding?: string; margin?: string }) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  padding,
  margin,
  onChange,
}) => {
  const parsePadding = (value: string) => {
    const parts = value.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    } else if (parts.length === 2) {
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    } else if (parts.length === 3) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    } else if (parts.length === 4) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    return { top: '0', right: '0', bottom: '0', left: '0' };
  };

  const parseMargin = parsePadding;

  const paddingValues = parsePadding(padding);
  const marginValues = parseMargin(margin);

  const updatePadding = (side: string, value: string) => {
    const current = parsePadding(padding);
    current[side as keyof typeof current] = value;
    onChange({ padding: `${current.top} ${current.right} ${current.bottom} ${current.left}` });
  };

  const updateMargin = (side: string, value: string) => {
    const current = parseMargin(margin);
    current[side as keyof typeof current] = value;
    onChange({ margin: `${current.top} ${current.right} ${current.bottom} ${current.left}` });
  };

  return (
    <div className={styles.spacingControls}>
      <div className={styles.section}>
        <h4>Padding</h4>
        <div className={styles.spacingGrid}>
          <div className={styles.spacingRow}>
            <label>Top</label>
            <input
              type="text"
              value={paddingValues.top}
              onChange={(e) => updatePadding('top', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Right</label>
            <input
              type="text"
              value={paddingValues.right}
              onChange={(e) => updatePadding('right', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Bottom</label>
            <input
              type="text"
              value={paddingValues.bottom}
              onChange={(e) => updatePadding('bottom', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Left</label>
            <input
              type="text"
              value={paddingValues.left}
              onChange={(e) => updatePadding('left', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Margin</h4>
        <div className={styles.spacingGrid}>
          <div className={styles.spacingRow}>
            <label>Top</label>
            <input
              type="text"
              value={marginValues.top}
              onChange={(e) => updateMargin('top', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Right</label>
            <input
              type="text"
              value={marginValues.right}
              onChange={(e) => updateMargin('right', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Bottom</label>
            <input
              type="text"
              value={marginValues.bottom}
              onChange={(e) => updateMargin('bottom', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.spacingRow}>
            <label>Left</label>
            <input
              type="text"
              value={marginValues.left}
              onChange={(e) => updateMargin('left', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};