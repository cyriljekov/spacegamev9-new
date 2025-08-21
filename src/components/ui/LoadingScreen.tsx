'use client'

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
  submessage?: string
}

export function LoadingScreen({ message = 'LOADING', submessage }: LoadingScreenProps) {
  const [dots, setDots] = useState('')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(100, prev + Math.random() * 15))
    }, 200)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Loading Text */}
        <h1 className="text-4xl font-mono text-echo-blue mb-8">
          {message}{dots}
        </h1>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-800 mx-auto mb-4">
          <div 
            className="h-full bg-echo-blue transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Submessage */}
        {submessage && (
          <p className="text-sm text-gray-500 font-mono">
            {submessage}
          </p>
        )}
        
        {/* System Messages */}
        <div className="mt-8 text-xs text-gray-600 font-mono space-y-1">
          <p>[SYSTEM] Initializing quantum processors...</p>
          <p>[SYSTEM] Calibrating navigation matrix...</p>
          <p>[SYSTEM] Synchronizing with ECHO...</p>
          <p>[SYSTEM] Loading fragment database...</p>
        </div>
      </div>
    </div>
  )
}