'use client'

import { motion } from 'framer-motion'
import { Message } from '../AIChatInterface'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatMessageContent } from '@/utils/sanitizeHtml'

interface MessageBubbleProps {
  message: Message
  onOptionClick?: (option: string) => void
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const isAi = message.type === 'ai'
  const isUser = message.type === 'user'
  const isSystem = message.type === 'system'
  
  return (
    <div className={`group w-full text-gray-100 ${isUser ? 'border-b border-gray-800/30' : 'border-b border-gray-800/30'}`}>
      <div className={`flex px-1 md:px-4 py-3 w-full ${isUser ? 'justify-end' : ''}`}>
        {/* Avatar for AI - Only show on AI messages */}
        {isAi && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg mr-3 flex-shrink-0">
            AI
          </div>
        )}
        
        {/* Message content */}
        <div className={`${isUser ? 'max-w-[80%]' : 'flex-1'}`}>
          {/* Loading indicator */}
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="text-white font-medium">{message.content}</div>
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                />
              </div>
            </div>
          ) : (
            <div>
              {/* Message content with markdown-like formatting */}
              <div 
                className={`whitespace-pre-wrap ${isUser ? 'text-left' : ''} ${
                  isAi ? 'p-3 bg-[rgba(32,37,55,0.7)] rounded-lg border border-gray-700/50' : 
                  isUser ? 'p-3 bg-[rgba(18,108,254,0.15)] rounded-lg border border-blue-500/20' : 
                  'p-3 bg-[rgba(255,100,100,0.1)] rounded-lg border border-red-500/20'
                } font-medium`}
              >
                {message.content.split('\n').map((line, i) => {
                  const formattedText = formatMessageContent(line)
                  
                  return (
                    <div 
                      key={i} 
                      className="mb-1 last:mb-0"
                      dangerouslySetInnerHTML={{ __html: formattedText }}
                    />
                  )
                })}
              </div>
              
              {/* Interactive options */}
              {message.options && message.options.length > 0 && onOptionClick && (
                <div className={`mt-3 flex flex-wrap gap-2 ${isUser ? 'justify-start' : ''}`}>
                  {message.options.map((option) => (
                    <button
                      key={option}
                      className="text-sm bg-[rgba(32,37,55,0.9)] hover:bg-[rgba(42,47,65,1)] text-blue-300 hover:text-blue-200 px-3 py-1.5 rounded-md transition-colors border border-blue-500/20 shadow-sm"
                      onClick={() => onOptionClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Timestamp - Only visible on hover */}
          <div className={`text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {/* User avatar placeholder - Only show on user messages */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg ml-3 flex-shrink-0">
            U
          </div>
        )}
        
        {/* System message avatar - Only show on system messages */}
        {isSystem && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-lg mr-3 flex-shrink-0">
            S
          </div>
        )}
      </div>
    </div>
  )
}
