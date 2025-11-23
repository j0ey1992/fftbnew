'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'

interface SwipeableCardContainerProps {
  children: ReactNode
  className?: string
  snapPoints?: number
}

export function SwipeableCardContainer({
  children,
  className = '',
  snapPoints = 3,
}: SwipeableCardContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }
  
  const onMouseUp = () => {
    setIsDragging(false)
    
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const itemWidth = containerWidth / snapPoints
      const newIndex = Math.round(containerRef.current.scrollLeft / itemWidth)
      
      containerRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      })
      
      setCurrentIndex(newIndex)
    }
  }
  
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk
  }
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    setStartX(e.touches[0].clientX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }
  
  const onTouchEnd = () => {
    setIsDragging(false)
    
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const itemWidth = containerWidth / snapPoints
      const newIndex = Math.round(containerRef.current.scrollLeft / itemWidth)
      
      containerRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      })
      
      setCurrentIndex(newIndex)
    }
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const x = e.touches[0].clientX - containerRef.current.offsetLeft
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeft - walk
  }
  
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return
    
    const containerWidth = containerRef.current.clientWidth
    const itemWidth = containerWidth / snapPoints
    
    containerRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    })
    
    setCurrentIndex(index)
  }
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      const containerWidth = container.clientWidth
      const itemWidth = containerWidth / snapPoints
      const newIndex = Math.round(container.scrollLeft / itemWidth)
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
      }
    }
    
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentIndex, snapPoints])
  
  return (
    <div className="swipe-container-wrapper">
      <div
        ref={containerRef}
        className={`swipe-container ${className} ${isDragging ? 'swipe-container--grabbing' : ''}`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        {children}
      </div>
      
      {/* Pagination Indicators */}
      <div className="swipe-pagination">
        {Array.from({ length: snapPoints }).map((_, index) => (
          <button
            key={index}
            className={`swipe-pagination__dot ${index === currentIndex ? 'swipe-pagination__dot--active' : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function SwipeItem({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`swipe-item ${className}`}>
      {children}
    </div>
  )
}
