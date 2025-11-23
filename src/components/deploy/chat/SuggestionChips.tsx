'use client'

import { motion } from 'framer-motion'

interface SuggestionChipsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

export function SuggestionChips({ suggestions, onSuggestionClick }: SuggestionChipsProps) {
  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }
  
  return (
    <motion.div 
      className="flex flex-wrap gap-2 overflow-x-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {suggestions.map((suggestion) => (
        <motion.button
          key={suggestion}
          className="text-xs md:text-sm bg-[rgba(32,37,55,0.7)] hover:bg-[rgba(42,47,65,0.9)] text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-md transition-colors border border-gray-700/50"
          onClick={() => onSuggestionClick(suggestion)}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  )
}
