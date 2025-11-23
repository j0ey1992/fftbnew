'use client'

import React, { useState } from 'react'
import styles from '@/styles/components/Faq.module.css'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  title?: string
  items: FaqItem[]
  className?: string
}

export function FaqSection({ title = 'Frequently Asked Questions', items, className = '' }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`${styles.faqContainer} ${className}`}>
      <h3 className={styles.faqHeader}>{title}</h3>
      
      <div>
        {items.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <div 
              className={styles.faqQuestion}
              onClick={() => toggleItem(index)}
              role="button"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              tabIndex={0}
            >
              <div className={styles.questionText}>{item.question}</div>
              <div className={`${styles.icon} ${openIndex === index ? styles.iconOpen : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {openIndex === index && <div className={styles.faqDivider}></div>}
            
            <div 
              id={`faq-answer-${index}`}
              className={`${styles.faqAnswer} ${openIndex === index ? styles.faqAnswerOpen : ''}`}
            >
              <div className={styles.answerText}>{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
