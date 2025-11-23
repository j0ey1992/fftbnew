'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabBarProps {
  tabs: TabItem[]
  activeTab?: string
  onChange?: (tabId: string) => void
  variant?: 'default' | 'pill'
  className?: string
}

export function TabBar({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}: TabBarProps) {
  const [current, setCurrent] = useState(activeTab || tabs[0]?.id)

  useEffect(() => {
    if (activeTab) setCurrent(activeTab)
  }, [activeTab])

  const handleChange = (id: string) => {
    setCurrent(id)
    onChange?.(id)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <GlassCard className="p-1 bg-deep-blue/80 border border-glass-border">
        <div className="flex space-x-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2
                text-sm font-medium
                transition
                ${current === tab.id
                  ? 'bg-crypto-blue-dark text-white shadow-glow scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-crypto-blue-900'}
                rounded-full
              `}
              aria-selected={current === tab.id}
              id={`tab-${tab.id}`}
              role="tab"
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute bottom-0 left-0 h-1 bg-accent rounded-full"
        style={{
          width: `${100 / tabs.length}%`,
          x: `${tabs.findIndex(t => t.id === current) * 100}%`,
        }}
      />
    </div>
  )
}


type TabPanelProps = {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({
  id,
  activeTab,
  children,
  className = '',
}: TabPanelProps) {
  if (id !== activeTab) return null
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={`mt-4 ${className}`}
    >
      {children}
    </motion.div>
  )
}
