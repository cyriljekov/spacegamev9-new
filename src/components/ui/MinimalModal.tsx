'use client'

import { ReactNode } from 'react'
import { useViewport } from '@/hooks/useViewport'

interface MinimalModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  width?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MinimalModal({ 
  title, 
  children, 
  onClose,
  width = 'lg'
}: MinimalModalProps) {
  const viewport = useViewport()
  
  const widths = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl'
  }
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-0 sm:p-6">
      <div className={`
        bg-black border-y sm:border border-[#222] 
        ${viewport.isMobile ? 'w-full h-full' : `${widths[width]} w-full max-h-[85vh]`} 
        flex flex-col
      `}>
        {/* Header - Responsive */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-[#222] flex justify-between items-center">
          <h2 className="text-[12px] sm:text-[14px] font-mono uppercase tracking-[0.5px] sm:tracking-[1px] text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-[20px] sm:text-[18px] leading-none p-2 -mr-2"
          >
            ×
          </button>
        </div>
        
        {/* Content - Full height on mobile */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}