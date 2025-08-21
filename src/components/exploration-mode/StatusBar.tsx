'use client'

import { useGameStore } from '@/stores/gameStore'

export function StatusBar() {
  const { health, status, inventory, currentPlanet, setMode } = useGameStore()
  
  return (
    <div className="bg-space-gray border-b border-gray-700 px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-6 text-xs font-mono">
          {/* Health */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">HEALTH:</span>
            <span className={`
              ${health > 70 ? 'text-terminal-green' : 
                health > 40 ? 'text-terminal-amber' : 'text-terminal-red'}
            `}>
              {health}%
            </span>
          </div>
          
          {/* Status Effects */}
          {status.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">STATUS:</span>
              <div className="flex gap-1">
                {Array.from(status).map(s => (
                  <span key={s} className="text-terminal-red uppercase">
                    [{s}]
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Weapon */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">WEAPON:</span>
            <span className="text-echo-blue">
              {inventory.currentWeapon.name} ({inventory.currentWeapon.damage} DMG)
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">LOCATION:</span>
            <span className="text-white">
              {currentPlanet || 'Unknown'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setMode('ship')}
          className="px-3 py-1 bg-echo-blue text-black font-mono text-xs hover:bg-blue-400 transition-colors"
        >
          RETURN TO SHIP
        </button>
      </div>
    </div>
  )
}