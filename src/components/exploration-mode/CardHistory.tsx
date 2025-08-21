'use client'

import { useEffect, useRef } from 'react'
import { ExplorationCard, CardType } from './ExplorationCard'

export interface HistoryEntry {
  type: CardType
  text: string
  id: string
}

interface CardHistoryProps {
  history: HistoryEntry[]
  currentLocation?: {
    area: string
    subarea: string
  }
}

export function CardHistory({ history, currentLocation }: CardHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [history])
  
  return (
    <div className="flex-1 flex flex-col max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10">
      {/* Location Header - Responsive */}
      {currentLocation && (
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-[0.5px] mb-1 sm:mb-2">
            {currentLocation.area}
          </div>
          <div className="text-[18px] sm:text-[20px] lg:text-[24px] text-white font-light tracking-[-0.5px]">
            {currentLocation.subarea}
          </div>
        </div>
      )}
      
      {/* Cards Container - Responsive */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-0 sm:pr-[10px] scrollbar-thin scrollbar-track-black scrollbar-thumb-[#222]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#222 #000'
        }}
      >
        {history.map((entry, index) => (
          <ExplorationCard
            key={entry.id}
            type={entry.type}
            content={entry.text}
            animationDelay={index === history.length - 1 ? 0 : 0}
          />
        ))}
      </div>
    </div>
  )
}