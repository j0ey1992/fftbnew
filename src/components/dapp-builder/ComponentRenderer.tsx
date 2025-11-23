'use client';

import React from 'react';
import type { DAppComponent, DAppTheme } from '@/types/dapp-builder';
import styles from './ComponentRenderer.module.css';

interface ComponentRendererProps {
  component: DAppComponent;
  theme: DAppTheme;
  isEditing: boolean;
  onUpdate?: (updates: Partial<DAppComponent>) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  theme,
  isEditing,
  onUpdate,
}) => {
  const { type, props, content, style, children } = component;

  // Merge component style with theme defaults
  const mergedStyle = {
    ...style,
    ...(isEditing && { minHeight: '50px', position: 'relative' as const }),
  };

  const renderComponent = () => {
    switch (type) {
      case 'header':
        return (
          <header className={props.className} style={mergedStyle}>
            <div className={styles.headerContent}>
              <h1>{content || 'Header'}</h1>
              {children && renderChildren()}
            </div>
          </header>
        );

      case 'footer':
        return (
          <footer className={props.className} style={mergedStyle}>
            <div className={styles.footerContent}>
              <p>{content || 'Footer Content'}</p>
              {children && renderChildren()}
            </div>
          </footer>
        );

      case 'navigation':
        return (
          <nav className={props.className} style={mergedStyle}>
            <ul className={styles.navList}>
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        );

      case 'hero':
        return (
          <section className={`${styles.hero} ${props.className}`} style={mergedStyle}>
            <h1>{content || 'Welcome to Your dApp'}</h1>
            <p>Build amazing decentralized applications</p>
            <button className={styles.heroButton}>Get Started</button>
          </section>
        );

      case 'card':
        return (
          <div className={`${styles.card} ${props.className}`} style={mergedStyle}>
            <h3>{props.title || 'Card Title'}</h3>
            <p>{content || 'Card content goes here'}</p>
            {children && renderChildren()}
          </div>
        );

      case 'button':
        return (
          <button
            className={`${styles.button} ${props.className}`}
            style={mergedStyle}
            onClick={() => !isEditing && props.onClick?.()}
          >
            {content || 'Button'}
          </button>
        );

      case 'text':
      case 'paragraph':
        return (
          <p className={props.className} style={mergedStyle}>
            {content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
          </p>
        );

      case 'heading':
        const HeadingTag = (props.level || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag className={props.className} style={mergedStyle}>
            {content || 'Heading'}
          </HeadingTag>
        );

      case 'image':
        return (
          <img
            src={props.src || 'https://via.placeholder.com/300x200'}
            alt={props.alt || 'Image'}
            className={props.className}
            style={mergedStyle}
          />
        );

      case 'link':
        return (
          <a
            href={props.href || '#'}
            target={props.target}
            className={props.className}
            style={mergedStyle}
            onClick={(e) => isEditing && e.preventDefault()}
          >
            {content || 'Link'}
          </a>
        );

      case 'container':
      case 'section':
        return (
          <div className={`${styles.container} ${props.className}`} style={mergedStyle}>
            {children ? renderChildren() : (
              <div className={styles.emptyContainer}>
                {isEditing && 'Drop components here'}
              </div>
            )}
          </div>
        );

      case 'row':
        return (
          <div className={`${styles.row} ${props.className}`} style={mergedStyle}>
            {children ? renderChildren() : (
              <div className={styles.emptyContainer}>
                {isEditing && 'Drop columns here'}
              </div>
            )}
          </div>
        );

      case 'column':
        return (
          <div className={`${styles.column} ${props.className}`} style={mergedStyle}>
            {children ? renderChildren() : (
              <div className={styles.emptyContainer}>
                {isEditing && 'Drop components here'}
              </div>
            )}
          </div>
        );

      case 'form':
        return (
          <form className={props.className} style={mergedStyle} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <button type="submit" className={styles.button}>Submit</button>
          </form>
        );

      case 'input':
        return (
          <div className={styles.formGroup}>
            <label>{props.label || 'Input'}</label>
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || 'Enter value'}
              className={props.className}
              style={mergedStyle}
            />
          </div>
        );

      case 'divider':
        return <hr className={props.className} style={mergedStyle} />;

      case 'spacer':
        return (
          <div
            className={props.className}
            style={{
              ...mergedStyle,
              height: props.height || '20px',
            }}
          />
        );

      default:
        return (
          <div className={props.className} style={mergedStyle}>
            <p className={styles.unknownComponent}>
              Unknown component type: {type}
            </p>
          </div>
        );
    }
  };

  const renderChildren = () => {
    if (!children || children.length === 0) return null;
    return children.map((child) => (
      <ComponentRenderer
        key={child.id}
        component={child}
        theme={theme}
        isEditing={isEditing}
        onUpdate={onUpdate}
      />
    ));
  };

  return <>{renderComponent()}</>;
};