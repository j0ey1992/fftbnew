'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useWindowSize } from 'react-use'

interface SparklesCoreProps {
  id?: string
  className?: string
  background?: string
  minSize?: number
  maxSize?: number
  particleCount?: number
  particleColor?: string
  speed?: number
  amplitude?: number
}

export const SparklesCore = ({
  id = 'tsparticles',
  className = '',
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1.4,
  particleCount = 40,
  particleColor = '#aaa',
  speed = 0.5,
  amplitude = 1,
}: SparklesCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)
  const { width, height } = useWindowSize()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    
    // Initialize canvas context
    context.current = canvasRef.current.getContext('2d')
    
    // Set canvas dimensions
    if (canvasContainerRef.current && context.current) {
      const currentWidth = canvasContainerRef.current.offsetWidth
      const currentHeight = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = currentWidth
      canvasRef.current.height = currentHeight
      
      // Initialize particles
      particles.current = []
      for (let i = 0; i < particleCount; i++) {
        particles.current.push(new Particle(
          currentWidth,
          currentHeight,
          minSize,
          maxSize,
          particleColor,
          speed,
          amplitude
        ))
      }
      
      setIsInitialized(true)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [minSize, maxSize, particleCount, particleColor, speed, amplitude])
  
  useEffect(() => {
    if (!isInitialized) return
    
    // Resize canvas on window resize
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      const currentWidth = canvasContainerRef.current.offsetWidth
      const currentHeight = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = currentWidth
      canvasRef.current.height = currentHeight
      
      // Adjust particles for new dimensions
      particles.current.forEach(particle => {
        particle.updateDimensions(currentWidth, currentHeight)
      })
    }
  }, [width, height, isInitialized])
  
  useEffect(() => {
    if (!isInitialized) return
    
    const animate = () => {
      if (!context.current || !canvasRef.current) return
      
      // Clear canvas
      context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      
      // Update and draw particles
      particles.current.forEach(particle => {
        particle.update()
        particle.draw(context.current!)
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isInitialized])
  
  return (
    <div
      ref={canvasContainerRef}
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        id={id}
        style={{
          background,
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

class Particle {
  private x: number
  private y: number
  private size: number
  private color: string
  private speed: number
  private amplitude: number
  private canvasWidth: number
  private canvasHeight: number
  private initialY: number
  private time: number
  
  constructor(
    canvasWidth: number,
    canvasHeight: number,
    minSize: number,
    maxSize: number,
    color: string,
    speed: number,
    amplitude: number
  ) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.initialY = this.y
    this.size = Math.random() * (maxSize - minSize) + minSize
    this.color = color
    this.speed = speed * (0.5 + Math.random() * 0.5)
    this.amplitude = amplitude * (0.5 + Math.random() * 0.5)
    this.time = Math.random() * 100
  }
  
  updateDimensions(width: number, height: number) {
    // Keep relative position when canvas is resized
    this.x = (this.x / this.canvasWidth) * width
    this.y = (this.y / this.canvasHeight) * height
    this.initialY = (this.initialY / this.canvasHeight) * height
    this.canvasWidth = width
    this.canvasHeight = height
  }
  
  update() {
    // Gentle floating motion
    this.time += 0.05 * this.speed
    this.y = this.initialY + Math.sin(this.time) * this.amplitude * 15
    
    // Subtle horizontal drift
    this.x += Math.sin(this.time * 0.1) * 0.2
    
    // Wrap around edges
    if (this.x > this.canvasWidth) this.x = 0
    if (this.x < 0) this.x = this.canvasWidth
    if (this.y > this.canvasHeight) this.y = 0
    if (this.y < 0) this.y = this.canvasHeight
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    // Draw star with subtle glow
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    
    // Add glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2
    )
    gradient.addColorStop(0, `${this.color}`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
}
