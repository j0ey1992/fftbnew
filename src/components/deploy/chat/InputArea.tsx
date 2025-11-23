'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isProcessing: boolean
  disabled?: boolean
  placeholder?: string
}

export function InputArea({
  value,
  onChange,
  onSubmit,
  isProcessing,
  disabled = false,
  placeholder = 'Type a message...'
}: InputAreaProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      const newHeight = Math.min(inputRef.current.scrollHeight, 150); // Max height of 150px
      inputRef.current.style.height = `${newHeight}px`
    }
  }, [value])
  
  // Handle key press
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isProcessing && !disabled && value.trim()) {
        onSubmit()
      }
    }
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`relative rounded-lg border ${isFocused ? 'border-blue-500/50 shadow-sm shadow-blue-500/20' : 'border-gray-700'} bg-[rgba(20,25,40,0.8)] backdrop-blur-sm transition-all duration-200`}>
        {/* Textarea */}
        <textarea
          ref={inputRef}
          className="w-full bg-transparent border-0 outline-none text-white py-3 px-4 pr-12 resize-none min-h-[44px] max-h-[150px] placeholder-gray-500 text-sm md:text-base"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isProcessing || disabled}
          rows={1}
        />
        
        {/* Send button */}
        <div className="absolute bottom-2 right-2">
          <Button
            variant={value.trim() ? "primary" : "glass"}
            size="sm"
            onClick={onSubmit}
            disabled={isProcessing || disabled || !value.trim()}
            className={`rounded-md w-8 h-8 p-0 flex items-center justify-center transition-colors ${!value.trim() ? 'opacity-50' : 'opacity-100'}`}
            icon={
              isProcessing ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )
            }
          >
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
      
      {/* Hint text */}
      <div className="text-center text-xs text-gray-500 mt-2">
        <span className="opacity-70">Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-800 rounded text-xs">Shift+Enter</kbd> for new line</span>
      </div>
    </div>
  )
}
