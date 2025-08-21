'use client'

import { useGameStore } from '@/stores/gameStore'

export function ResourcePanel() {
  const { 
    fuel, 
    materials, 
    hull, 
    health, 
    status,
    fragments,
    echoStage,
    echoMorality 
  } = useGameStore()
  
  const totalFragments = fragments.ship.size + fragments.gate.size + fragments.truth.size
  
  return (
    <div className="bg-space-gray border border-gray-700 p-4">
      <h2 className="text-echo-blue font-mono text-lg mb-4">SHIP STATUS</h2>
      
      <div className="space-y-3">
        {/* Resources */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">FUEL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black h-4 border border-gray-600">
                <div 
                  className="h-full bg-echo-blue transition-all"
                  style={{ width: `${Math.min(100, fuel * 10)}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">{fuel}</span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">MATERIALS</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black h-4 border border-gray-600">
                <div 
                  className="h-full bg-terminal-amber transition-all"
                  style={{ width: `${Math.min(100, materials * 2)}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">{materials}</span>
            </div>
          </div>
        </div>
        
        {/* Hull & Health */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">HULL INTEGRITY</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black h-4 border border-gray-600">
                <div 
                  className={`h-full transition-all ${
                    hull > 50 ? 'bg-terminal-green' : 
                    hull > 25 ? 'bg-terminal-amber' : 'bg-terminal-red'
                  }`}
                  style={{ width: `${hull}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">{hull}%</span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">HEALTH</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black h-4 border border-gray-600">
                <div 
                  className={`h-full transition-all ${
                    health > 70 ? 'bg-terminal-green' : 
                    health > 40 ? 'bg-terminal-amber' : 'bg-terminal-red'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">{health}%</span>
            </div>
          </div>
        </div>
        
        {/* Status Effects */}
        {status.size > 0 && (
          <div>
            <label className="text-xs text-gray-500">STATUS</label>
            <div className="flex gap-2 mt-1">
              {Array.from(status).map(s => (
                <span 
                  key={s}
                  className="px-2 py-1 text-xs bg-terminal-red/20 text-terminal-red border border-terminal-red"
                >
                  {s.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Fragments */}
        <div className="pt-3 border-t border-gray-700">
          <label className="text-xs text-gray-500">FRAGMENTS COLLECTED</label>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ship Coordinates:</span>
              <span className="text-echo-blue font-mono">{fragments.ship.size}/7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Gate Technology:</span>
              <span className="text-echo-purple font-mono">{fragments.gate.size}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Truth Fragments:</span>
              <span className="text-terminal-amber font-mono">{fragments.truth.size}/3</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="bg-black h-2 border border-gray-600">
              <div 
                className="h-full bg-gradient-to-r from-echo-blue via-echo-purple to-terminal-amber"
                style={{ width: `${(totalFragments / 50) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {totalFragments}/50 Total Fragments
            </p>
          </div>
        </div>
        
        {/* ECHO Status */}
        <div className="pt-3 border-t border-gray-700">
          <label className="text-xs text-gray-500">ECHO COMPANION</label>
          <div className="mt-2">
            <p className="text-sm text-echo-purple">Stage: {echoStage}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Morality:</span>
              <div className="flex-1 bg-black h-2 border border-gray-600">
                <div 
                  className={`h-full transition-all ${
                    echoMorality > 0 ? 'bg-echo-blue' : 'bg-terminal-red'
                  }`}
                  style={{ 
                    width: `${Math.abs(echoMorality)}%`,
                    marginLeft: echoMorality < 0 ? `${50 - Math.abs(echoMorality / 2)}%` : '50%'
                  }}
                />
              </div>
              <span className="text-xs font-mono">{echoMorality}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}