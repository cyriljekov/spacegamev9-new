'use client'

import { useEffect, useState } from 'react'

interface ModeTransitionProps {
  from: 'ship' | 'exploration'
  to: 'ship' | 'exploration'
  onComplete: () => void
}

export function ModeTransition({ from, to, onComplete }: ModeTransitionProps) {
  const [phase, setPhase] = useState<'fadeOut' | 'message' | 'fadeIn'>('fadeOut')
  
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    // Phase 1: Fade out
    timers.push(setTimeout(() => {
      setPhase('message')
    }, 500))
    
    // Phase 2: Show message
    timers.push(setTimeout(() => {
      setPhase('fadeIn')
    }, 1500))
    
    // Phase 3: Complete
    timers.push(setTimeout(() => {
      onComplete()
    }, 2000))
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])
  
  const getMessage = () => {
    if (from === 'ship' && to === 'exploration') {
      return [
        'ENTERING ATMOSPHERE',
        'Landing sequence initiated...'
      ]
    } else if (from === 'exploration' && to === 'ship') {
      return [
        'RETURNING TO SHIP',
        'Decontamination in progress...'
      ]
    }
    return ['TRANSITIONING', '']
  }
  
  const [title, subtitle] = getMessage()
  
  return (
    <div className={`
      fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500
      ${phase === 'fadeOut' ? 'opacity-0' : phase === 'fadeIn' ? 'opacity-0' : 'opacity-100'}
    `}>
      <div className="text-center">
        <h1 className="text-3xl font-mono text-echo-blue mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-500 font-mono">
          {subtitle}
        </p>
        
        {/* Animated bars */}
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 h-8 bg-echo-blue animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: phase === 'message' ? 1 : 0
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}