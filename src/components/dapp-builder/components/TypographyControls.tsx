'use client';

import React from 'react';
import styles from './TypographyControls.module.css';

interface TypographyControlsProps {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  textAlign: string;
  onChange: (typography: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
  }) => void;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  onChange,
}) => {
  return (
    <div className={styles.typographyControls}>
      <div className={styles.field}>
        <label>Font Size</label>
        <input
          type="text"
          value={fontSize}
          onChange={(e) => onChange({ fontSize: e.target.value })}
          placeholder="16px"
        />
      </div>

      <div className={styles.field}>
        <label>Font Weight</label>
        <select
          value={fontWeight}
          onChange={(e) => onChange({ fontWeight: e.target.value })}
        >
          <option value="">Default</option>
          <option value="300">Light</option>
          <option value="400">Normal</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
          <option value="800">Extra Bold</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Line Height</label>
        <input
          type="text"
          value={lineHeight}
          onChange={(e) => onChange({ lineHeight: e.target.value })}
          placeholder="1.5"
        />
      </div>

      <div className={styles.field}>
        <label>Text Align</label>
        <div className={styles.buttonGroup}>
          <button
            className={textAlign === 'left' ? styles.active : ''}
            onClick={() => onChange({ textAlign: 'left' })}
          >
            Left
          </button>
          <button
            className={textAlign === 'center' ? styles.active : ''}
            onClick={() => onChange({ textAlign: 'center' })}
          >
            Center
          </button>
          <button
            className={textAlign === 'right' ? styles.active : ''}
            onClick={() => onChange({ textAlign: 'right' })}
          >
            Right
          </button>
          <button
            className={textAlign === 'justify' ? styles.active : ''}
            onClick={() => onChange({ textAlign: 'justify' })}
          >
            Justify
          </button>
        </div>
      </div>
    </div>
  );
};