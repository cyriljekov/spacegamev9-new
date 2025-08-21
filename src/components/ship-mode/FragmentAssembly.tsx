'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface FragmentData {
  id: string
  type: 'ship' | 'gate' | 'truth'
  description: string
  canCombine: boolean
}

export function FragmentAssembly({ onClose }: { onClose: () => void }) {
  const { fragments, triggerVictory } = useGameStore()
  const [selectedType, setSelectedType] = useState<'ship' | 'gate' | 'truth'>('ship')
  const [combineMessage, setCombineMessage] = useState<string | null>(null)
  
  const totalShip = fragments.ship.size
  const totalGate = fragments.gate.size
  const totalTruth = fragments.truth.size
  
  const canAssembleShip = totalShip >= 7
  const canAssembleGate = totalGate >= 10
  const canRevealTruth = totalTruth >= 3
  
  const handleAssemble = (type: 'ship' | 'gate' | 'truth') => {
    if (type === 'ship' && canAssembleShip) {
      setCombineMessage('Ship coordinates assembled! You now know the location of the rescue ship.')
      setTimeout(() => {
        triggerVictory('ship')
        onClose()
      }, 2000)
    } else if (type === 'gate' && canAssembleGate) {
      setCombineMessage('Gate technology decoded! You can now attempt to open a portal home.')
      setTimeout(() => {
        triggerVictory('gate')
        onClose()
      }, 2000)
    } else if (type === 'truth' && canRevealTruth) {
      setCombineMessage('The truth is revealed... Earth\'s fate becomes clear.')
      setTimeout(() => {
        triggerVictory('truth')
        onClose()
      }, 2000)
    }
  }
  
  const getFragmentDescription = (type: 'ship' | 'gate' | 'truth', index: number): string => {
    const descriptions = {
      ship: [
        'Navigation matrix alpha',
        'Stellar coordinate beta',
        'Quantum position gamma',
        'Temporal sync delta',
        'Spatial reference epsilon',
        'Dimensional anchor zeta',
        'Course correction eta'
      ],
      gate: [
        'Portal stabilizer core',
        'Quantum entanglement module',
        'Dimensional phase inverter',
        'Temporal flux capacitor',
        'Energy convergence matrix',
        'Spatial distortion field',
        'Wormhole generator coil',
        'Exotic matter injector',
        'Graviton manipulation array',
        'Void breach initiator'
      ],
      truth: [
        'Memory fragment: The evacuation...',
        'Data log: Final transmission...',
        'Black box recording: Earth\'s last day...'
      ]
    }
    
    return descriptions[type][index] || `${type} fragment ${index + 1}`
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-space-gray border-2 border-echo-purple max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-mono text-echo-purple">FRAGMENT ASSEMBLY</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setSelectedType('ship')}
            className={`flex-1 px-4 py-3 font-mono transition-colors ${
              selectedType === 'ship' 
                ? 'bg-echo-blue text-black' 
                : 'bg-space-gray text-gray-400 hover:text-white'
            }`}
          >
            SHIP COORDINATES ({totalShip}/7)
          </button>
          <button
            onClick={() => setSelectedType('gate')}
            className={`flex-1 px-4 py-3 font-mono transition-colors ${
              selectedType === 'gate' 
                ? 'bg-echo-purple text-white' 
                : 'bg-space-gray text-gray-400 hover:text-white'
            }`}
          >
            GATE TECHNOLOGY ({totalGate}/10)
          </button>
          <button
            onClick={() => setSelectedType('truth')}
            className={`flex-1 px-4 py-3 font-mono transition-colors ${
              selectedType === 'truth' 
                ? 'bg-terminal-amber text-black' 
                : 'bg-space-gray text-gray-400 hover:text-white'
            }`}
          >
            TRUTH FRAGMENTS ({totalTruth}/3)
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {combineMessage && (
            <div className="mb-4 p-4 bg-terminal-green/20 border border-terminal-green text-terminal-green">
              {combineMessage}
            </div>
          )}
          
          {/* Fragment Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {Array.from({ length: selectedType === 'ship' ? 7 : selectedType === 'gate' ? 10 : 3 }).map((_, index) => {
              const fragmentId = `${selectedType}_${String(index + 1).padStart(3, '0')}`
              const hasFragment = fragments[selectedType].has(fragmentId)
              
              return (
                <div
                  key={fragmentId}
                  className={`
                    p-3 border-2 transition-all
                    ${hasFragment 
                      ? 'border-echo-purple bg-echo-purple/10' 
                      : 'border-gray-700 bg-black/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      {fragmentId.toUpperCase()}
                    </span>
                    {hasFragment && (
                      <span className="text-xs text-terminal-green">✓</span>
                    )}
                  </div>
                  <p className={`text-sm ${hasFragment ? 'text-white' : 'text-gray-600'}`}>
                    {hasFragment ? getFragmentDescription(selectedType, index) : '???'}
                  </p>
                </div>
              )
            })}
          </div>
          
          {/* Assembly Progress */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-mono text-white mb-3">Assembly Status</h3>
            
            {selectedType === 'ship' && (
              <div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-echo-blue">{totalShip}/7</span>
                  </div>
                  <div className="bg-black h-4 border border-gray-600">
                    <div 
                      className="h-full bg-echo-blue transition-all"
                      style={{ width: `${(totalShip / 7) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Collect all 7 fragments to reveal the rescue ship&apos;s coordinates.
                </p>
                <button
                  onClick={() => handleAssemble('ship')}
                  disabled={!canAssembleShip}
                  className={`
                    w-full px-4 py-3 font-mono
                    ${canAssembleShip
                      ? 'bg-echo-blue text-black hover:bg-blue-400'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {canAssembleShip ? 'ASSEMBLE COORDINATES' : `${7 - totalShip} FRAGMENTS REMAINING`}
                </button>
              </div>
            )}
            
            {selectedType === 'gate' && (
              <div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-echo-purple">{totalGate}/10</span>
                  </div>
                  <div className="bg-black h-4 border border-gray-600">
                    <div 
                      className="h-full bg-echo-purple transition-all"
                      style={{ width: `${(totalGate / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Collect all 10 fragments to unlock portal technology.
                </p>
                <button
                  onClick={() => handleAssemble('gate')}
                  disabled={!canAssembleGate}
                  className={`
                    w-full px-4 py-3 font-mono
                    ${canAssembleGate
                      ? 'bg-echo-purple text-white hover:bg-purple-600'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {canAssembleGate ? 'ACTIVATE PORTAL' : `${10 - totalGate} FRAGMENTS REMAINING`}
                </button>
              </div>
            )}
            
            {selectedType === 'truth' && (
              <div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-terminal-amber">{totalTruth}/3</span>
                  </div>
                  <div className="bg-black h-4 border border-gray-600">
                    <div 
                      className="h-full bg-terminal-amber transition-all"
                      style={{ width: `${(totalTruth / 3) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Collect all 3 fragments to learn Earth&apos;s fate.
                </p>
                <button
                  onClick={() => handleAssemble('truth')}
                  disabled={!canRevealTruth}
                  className={`
                    w-full px-4 py-3 font-mono
                    ${canRevealTruth
                      ? 'bg-terminal-amber text-black hover:bg-yellow-500'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {canRevealTruth ? 'REVEAL THE TRUTH' : `${3 - totalTruth} FRAGMENTS REMAINING`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}