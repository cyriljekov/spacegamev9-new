'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'

export function MainMenu() {
  const [selectedOption, setSelectedOption] = useState(0)
  const { setGameStarted, resetGame } = useGameStore()
  
  const menuOptions = [
    { label: 'New Game', action: () => handleNewGame() },
    { label: 'Continue', action: () => handleContinue(), disabled: true },
    { label: 'Settings', action: () => {}, disabled: true },
    { label: 'Credits', action: () => {}, disabled: true }
  ]
  
  const handleNewGame = () => {
    resetGame()
    setGameStarted(true)
  }
  
  const handleContinue = () => {
    // Load save game
    setGameStarted(true)
  }
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelectedOption(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowDown') {
        setSelectedOption(prev => Math.min(menuOptions.length - 1, prev + 1))
      } else if (e.key === 'Enter') {
        const option = menuOptions[selectedOption]
        if (!option.disabled) {
          option.action()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedOption])
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center px-4">
      <div className="max-w-xl w-full py-8 sm:py-10">
        {/* Title - Responsive */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-[28px] sm:text-[36px] lg:text-[48px] font-mono font-light tracking-[1px] sm:tracking-[2px] text-white mb-2 sm:mb-4">
            ECHOES OF EARTH
          </h1>
          <p className="text-[9px] sm:text-[10px] lg:text-[11px] text-gray-500 uppercase tracking-[0.5px] sm:tracking-[1px]">
            A survival horror in the Medusa Galaxy
          </p>
        </div>
        
        {/* Menu Options - Responsive */}
        <div className="space-y-2 sm:space-y-3 max-w-sm mx-auto">
          {menuOptions.map((option, index) => (
            <button
              key={option.label}
              onClick={() => !option.disabled && option.action()}
              onMouseEnter={() => setSelectedOption(index)}
              onTouchStart={() => setSelectedOption(index)}
              disabled={option.disabled}
              className={`
                w-full px-4 sm:px-6 py-3 sm:py-4 text-left font-mono text-[12px] sm:text-[14px]
                border border-[#222] transition-all duration-200
                uppercase tracking-[0.5px]
                min-h-[48px]
                ${selectedOption === index 
                  ? 'bg-[#111] border-[#333] text-white' 
                  : 'bg-[#0a0a0a] text-gray-500'
                }
                ${option.disabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-[#111] hover:border-[#333] hover:text-white cursor-pointer'
                }
              `}
            >
              <span className="mr-2 sm:mr-3 text-[8px] sm:text-[10px]">{selectedOption === index ? '▶' : ' '}</span>
              {option.label}
              {option.disabled && <span className="ml-2 text-[8px] sm:text-[10px] opacity-50">[LOCKED]</span>}
            </button>
          ))}
        </div>
        
        {/* Footer - Responsive */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center">
          <p className="text-[9px] sm:text-[10px] text-gray-600 uppercase tracking-[0.5px] sm:tracking-[1px]">
            ↑↓ Navigate • Enter Select
          </p>
          <p className="text-[9px] sm:text-[10px] text-gray-600 mt-2">
            v0.1.0 Development
          </p>
        </div>
      </div>
    </div>
  )
}