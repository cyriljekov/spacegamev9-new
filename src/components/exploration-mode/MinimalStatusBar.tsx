'use client'

import { useGameStore } from '@/stores/gameStore'
import { GalaxyGenerator } from '@/utils/galaxyGenerator'
import { coordToString } from '@/utils/hexGrid'
import { useViewport } from '@/hooks/useViewport'

export function MinimalStatusBar() {
  const { fuel, materials, hull, health, currentSystem, currentPlanet, seed } = useGameStore()
  const viewport = useViewport()
  
  // Get location names
  const generator = new GalaxyGenerator(seed)
  const galaxy = generator.generateGalaxy()
  const system = galaxy.get(coordToString(currentSystem))
  const planet = system?.planets.find(p => p.id === currentPlanet)
  
  const locationPath = viewport.isMobile
    ? `${system?.name || 'UNKNOWN'} › ${planet?.name || 'SURFACE'}`
    : ['MEDUSA GALAXY', system?.name || 'UNKNOWN SYSTEM', planet?.name || 'SURFACE'].join(' › ')
  
  const stats = [
    { label: 'Fuel', value: fuel, max: 20, color: 'bg-[#00b4d8]' },
    { label: 'Mat', value: materials, max: 25, color: 'bg-[#ffb700]' },
    { label: 'Hull', value: `${hull}%`, percent: hull, color: 'bg-[#666]' },
    { label: 'HP', value: `${health}%`, percent: health, color: health <= 30 ? 'bg-[#ff0040]' : 'bg-[#00ff41]' }
  ]
  
  return (
    <div className="bg-[#0a0a0a] border-b border-[#111] px-4 sm:px-6 lg:px-10 py-2 sm:py-3">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Stats - Responsive Grid */}
        <div className={`
          grid gap-3 sm:gap-4 lg:gap-8 w-full sm:w-auto
          ${viewport.isMobile ? 'grid-cols-2' : 'grid-cols-4 sm:flex sm:flex-row'}
        `}>
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-[11px] text-gray-500 uppercase tracking-[0.5px]">
                  {stat.label}
                </span>
                <span className="text-[10px] sm:text-[11px] text-white font-medium">
                  {stat.value}
                </span>
              </div>
              <div className="w-full sm:w-[60px] h-[2px] bg-[#333] relative overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 ${stat.color} transition-all duration-300`}
                  style={{ 
                    width: `${stat.percent !== undefined 
                      ? stat.percent 
                      : Math.min(100, (typeof stat.value === 'number' ? (stat.value / stat.max!) * 100 : 0))
                    }%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Location - Responsive text */}
        <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-[0.5px] sm:tracking-[1px] text-center sm:text-right">
          {locationPath}
        </div>
      </div>
    </div>
  )
}