'use client'

import { useState, useEffect, RefObject } from 'react'

interface CanvasSize {
  width: number
  height: number
  scale: number
}

export function useCanvasSize(
  containerRef: RefObject<HTMLDivElement>,
  aspectRatio: number = 16/10  // Wider aspect ratio for modern screens
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({
    width: 1200,
    height: 750,
    scale: 1
  })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth, height: containerHeight } = entry.contentRect
        
        // Use full container dimensions - no padding
        let canvasWidth = containerWidth
        let canvasHeight = containerHeight
        
        // Don't constrain by aspect ratio - use full screen
        // Just ensure minimum sizes for very small screens
        canvasWidth = Math.max(320, canvasWidth)
        canvasHeight = Math.max(480, canvasHeight)
        
        // Calculate scale for high DPI displays
        const scale = window.devicePixelRatio || 1
        
        setSize({
          width: Math.floor(canvasWidth),
          height: Math.floor(canvasHeight),
          scale
        })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, aspectRatio])

  return size
}