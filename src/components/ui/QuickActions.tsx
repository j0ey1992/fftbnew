'use client'

import React from 'react'
import Link from 'next/link'
import styles from '@/styles/components/Navigation.module.css'

export interface ActionItem {
  label: string
  href?: string
  icon: React.ReactNode
  accentColor?: string
  onClick?: () => void
}

interface QuickActionsProps {
  actions: ActionItem[]
  className?: string
}

export function QuickActions({ actions, className = '' }: QuickActionsProps) {
  return (
    <div className={`${styles.quickActions} ${className}`}>
      {actions.map((action, index) => 
        action.onClick ? (
          <button 
            key={index} 
            className={styles.actionButton}
            onClick={action.onClick}
          >
            <div 
              className={styles.actionCircle}
              style={{ background: action.accentColor || '#1f71fe' }}
            >
              {action.icon}
            </div>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ) : (
          <Link 
            key={index} 
            href={action.href || '#'}
            className={styles.actionButton}
          >
            <div 
              className={styles.actionCircle}
              style={{ background: action.accentColor || '#1f71fe' }}
            >
              {action.icon}
            </div>
            <span className={styles.actionLabel}>{action.label}</span>
          </Link>
        )
      )}
    </div>
  )
}
