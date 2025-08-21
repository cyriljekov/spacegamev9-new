'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { MinimalModal } from '../ui/MinimalModal'
import { MinimalButton } from '../ui/MinimalButton'
import { ProgressBar } from '../ui/ProgressBar'

export function FragmentAssembly({ onClose }: { onClose: () => void }) {
  const { fragments, triggerVictory } = useGameStore()
  const [selectedType, setSelectedType] = useState<'ship' | 'gate' | 'truth'>('ship')
  const [combineMessage, setCombineMessage] = useState<string | null>(null)
  
  const totals = {
    ship: fragments.ship.size,
    gate: fragments.gate.size,
    truth: fragments.truth.size
  }
  
  const requirements = {
    ship: 7,
    gate: 10,
    truth: 3
  }
  
  const canAssemble = {
    ship: totals.ship >= requirements.ship,
    gate: totals.gate >= requirements.gate,
    truth: totals.truth >= requirements.truth
  }
  
  const handleAssemble = (type: 'ship' | 'gate' | 'truth') => {
    if (!canAssemble[type]) return
    
    const messages = {
      ship: 'Ship coordinates assembled. Location revealed.',
      gate: 'Portal technology decoded. Gateway activated.',
      truth: 'The truth is revealed. Earth\'s fate uncovered.'
    }
    
    setCombineMessage(messages[type])
    setTimeout(() => {
      triggerVictory(type)
      onClose()
    }, 2000)
  }
  
  const tabColors = {
    ship: 'text-[#00b4d8]',
    gate: 'text-[#b794f6]',
    truth: 'text-[#ffb700]'
  }
  
  const progressColors = {
    ship: 'blue' as const,
    gate: 'purple' as const,
    truth: 'amber' as const
  }
  
  return (
    <MinimalModal title="Fragment Assembly" onClose={onClose} width="lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#222]">
        {(['ship', 'gate', 'truth'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              flex-1 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.5px]
              transition-colors duration-200
              ${selectedType === type 
                ? `bg-[#111] ${tabColors[type]} border-b-2 border-current` 
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {type} ({totals[type]}/{requirements[type]})
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-8">
        {combineMessage && (
          <div className="mb-6 px-4 py-3 border border-[#00ff41] bg-[#00ff4108] text-[#00ff41] text-[12px] uppercase tracking-[0.5px]">
            {combineMessage}
          </div>
        )}
        
        {/* Fragment Grid */}
        <div className="mb-8">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-[1px] mb-4">
            Collected Fragments
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: requirements[selectedType] }).map((_, index) => {
              const fragmentId = `${selectedType}_${String(index + 1).padStart(3, '0')}`
              const hasFragment = fragments[selectedType].has(fragmentId)
              
              return (
                <div
                  key={fragmentId}
                  className={`
                    aspect-square border flex items-center justify-center
                    text-[10px] font-mono
                    ${hasFragment 
                      ? `border-${tabColors[selectedType]} bg-current/5 ${tabColors[selectedType]}` 
                      : 'border-[#222] bg-[#0a0a0a] text-gray-600'
                    }
                  `}
                >
                  {hasFragment ? '\u2713' : (index + 1)}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-[1px] mb-4">
            Assembly Progress
          </h3>
          <ProgressBar
            value={totals[selectedType]}
            max={requirements[selectedType]}
            color={progressColors[selectedType]}
            showLabel
            label={selectedType.toUpperCase()}
            height="normal"
          />
          <p className="text-[11px] text-gray-500 mt-3">
            {selectedType === 'ship' && 'Collect all 7 fragments to reveal the rescue ship location.'}
            {selectedType === 'gate' && 'Collect all 10 fragments to unlock portal technology.'}
            {selectedType === 'truth' && 'Collect all 3 fragments to learn Earth\'s fate.'}
          </p>
        </div>
        
        {/* Action Button */}
        <MinimalButton
          onClick={() => handleAssemble(selectedType)}
          disabled={!canAssemble[selectedType]}
          variant={canAssemble[selectedType] ? 'primary' : 'secondary'}
          size="lg"
          className="w-full"
        >
          {canAssemble[selectedType] 
            ? `Assemble ${selectedType}` 
            : `${requirements[selectedType] - totals[selectedType]} Fragments Remaining`
          }
        </MinimalButton>
      </div>
    </MinimalModal>
  )
}