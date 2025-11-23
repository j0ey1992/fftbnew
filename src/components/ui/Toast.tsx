'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  message: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastComponentProps extends ToastProps {
  onRemove: (id: string) => void
}

// Individual Toast Component
function ToastComponent({
  id,
  message,
  type = 'info',
  duration = 5000,
  action,
  onClose,
  onRemove
}: ToastComponentProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
        if (onClose) onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose, onRemove])
  
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-success bg-success/10'
      case 'error':
        return 'border-l-4 border-error bg-error/10'
      case 'warning':
        return 'border-l-4 border-warning bg-warning/10'
      default:
        return 'border-l-4 border-primary bg-primary/10'
    }
  }
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
    }
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`w-full max-w-sm bg-card-bg backdrop-blur-sm shadow-lg rounded-lg overflow-hidden ${getTypeStyles()}`}
    >
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm text-white">{message}</p>
          {action && (
            <button 
              onClick={action.onClick}
              className="mt-2 text-xs font-medium text-primary hover:text-primary-light transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        <button 
          onClick={() => {
            onRemove(id)
            if (onClose) onClose()
          }}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <motion.div 
          className="h-1 bg-primary/30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

// Toast Container
function ToastContainer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {children}
    </div>
  )
}

// Toast Context and Provider
let toasts: ToastProps[] = []
let listeners: ((toasts: ToastProps[]) => void)[] = []

function emitChange() {
  listeners.forEach(listener => listener([...toasts]))
}

export function addToast(toast: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { ...toast, id }]
  emitChange()
  return id
}

export function removeToast(id: string) {
  toasts = toasts.filter(toast => toast.id !== id)
  emitChange()
}

export function useToasts() {
  const [currentToasts, setCurrentToasts] = useState<ToastProps[]>(toasts)
  
  useEffect(() => {
    function handleChange(newToasts: ToastProps[]) {
      setCurrentToasts(newToasts)
    }
    
    listeners.push(handleChange)
    return () => {
      listeners = listeners.filter(listener => listener !== handleChange)
    }
  }, [])
  
  return currentToasts
}

// Toast Portal Component
export function ToastPortal() {
  const toasts = useToasts()
  
  // Use createPortal to render toasts at the top level of the DOM
  if (typeof window === 'undefined') return null
  
  return createPortal(
    <ToastContainer>
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent {...toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </ToastContainer>,
    document.body
  )
}

// Helper functions for common toast types
export const toast = {
  show: (message: string, options?: Omit<ToastProps, 'id' | 'message'>) => 
    addToast({ message, ...options }),
  success: (message: string, options?: Omit<ToastProps, 'id' | 'message' | 'type'>) => 
    addToast({ message, type: 'success', ...options }),
  error: (message: string, options?: Omit<ToastProps, 'id' | 'message' | 'type'>) => 
    addToast({ message, type: 'error', ...options }),
  info: (message: string, options?: Omit<ToastProps, 'id' | 'message' | 'type'>) => 
    addToast({ message, type: 'info', ...options }),
  warning: (message: string, options?: Omit<ToastProps, 'id' | 'message' | 'type'>) => 
    addToast({ message, type: 'warning', ...options }),
  dismiss: (id: string) => removeToast(id)
}
