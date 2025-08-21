'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface MinimalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function MinimalButton({ 
  variant = 'secondary', 
  size = 'md',
  children, 
  className = '',
  disabled,
  ...props 
}: MinimalButtonProps) {
  const baseStyles = 'font-mono uppercase tracking-[0.5px] transition-all duration-200 border'
  
  const variants = {
    primary: 'bg-[#00b4d8] text-black border-[#00b4d8] hover:bg-[#0090b0] hover:border-[#0090b0]',
    secondary: 'bg-[#0a0a0a] text-gray-500 border-[#222] hover:bg-[#111] hover:text-white hover:border-[#333]',
    danger: 'bg-[#ff004008] text-[#ff0040] border-[#ff004033] hover:bg-[#ff004015] hover:border-[#ff0040]',
    ghost: 'bg-transparent text-gray-500 border-transparent hover:text-white'
  }
  
  const sizes = {
    sm: 'px-3 py-[6px] text-[10px]',
    md: 'px-4 py-2 text-[11px]',
    lg: 'px-6 py-3 text-[12px]'
  }
  
  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed hover:bg-current hover:border-current hover:text-current' 
    : 'cursor-pointer'
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}