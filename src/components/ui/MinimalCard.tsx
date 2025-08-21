'use client'

import { ReactNode } from 'react'

interface MinimalCardProps {
  children: ReactNode
  accent?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'none'
  hover?: boolean
  selected?: boolean
  className?: string
  onClick?: () => void
}

export function MinimalCard({ 
  children, 
  accent = 'none',
  hover = false,
  selected = false,
  className = '',
  onClick
}: MinimalCardProps) {
  const accentColors = {
    blue: 'border-l-[#00b4d8]',
    purple: 'border-l-[#b794f6]',
    green: 'border-l-[#00ff41]',
    amber: 'border-l-[#ffb700]',
    red: 'border-l-[#ff0040]',
    none: ''
  }
  
  const baseStyles = 'bg-[#0a0a0a] border border-[#222] p-5 relative'
  const accentStyles = accent !== 'none' ? `border-l-2 ${accentColors[accent]}` : ''
  const hoverStyles = hover ? 'hover:border-[#333] transition-all duration-200 cursor-pointer' : ''
  const selectedStyles = selected ? 'bg-[#111] border-[#333]' : ''
  
  return (
    <div 
      className={`${baseStyles} ${accentStyles} ${hoverStyles} ${selectedStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}