'use client';

import React, { useState } from 'react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000',
    '#008000', '#000080', '#808000', '#800080', '#008080',
    '#C0C0C0', '#FF6347', '#4B0082', '#FFD700', '#32CD32',
  ];

  return (
    <div className={styles.colorPicker}>
      <div className={styles.colorInput}>
        <input
          type="color"
          value={color || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
        <button
          className={styles.colorButton}
          style={{ backgroundColor: color || '#000000' }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <input
          type="text"
          value={color || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={styles.textInput}
        />
      </div>
      {isOpen && (
        <div className={styles.presetColors}>
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              className={styles.presetColor}
              style={{ backgroundColor: presetColor }}
              onClick={() => {
                onChange(presetColor);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};