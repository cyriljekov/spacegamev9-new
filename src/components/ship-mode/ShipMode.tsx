'use client'

import { useState } from 'react'
import { GalaxyMap } from './ResponsiveGalaxyMap'
import { ShipStatusBar } from './ShipStatusBar'
import { FragmentAssembly } from './FragmentAssembly2'
import { SaveLoadModal } from './SaveLoadModal2'
import { InventoryModal } from './InventoryModal2'
import { useGameStore } from '@/stores/gameStore'
import { MinimalButton } from '../ui/MinimalButton'

export function ShipMode() {
  const { setMode, fragments } = useGameStore()
  const [showFragmentAssembly, setShowFragmentAssembly] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState<'save' | 'load' | null>(null)
  const [showInventory, setShowInventory] = useState(false)
  
  const totalFragments = fragments.ship.size + fragments.gate.size + fragments.truth.size
  
  return (
    <div className="fixed inset-0 bg-black">
      {/* Galaxy Map - Full Screen */}
      <div className="absolute inset-0">
        <GalaxyMap />
      </div>
      
      {/* Overlay Status Bar - Semi-transparent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <ShipStatusBar />
      </div>
      
      {/* Bottom Action Bar - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-sm border-t border-[#222]/50 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 safe-bottom">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between items-center">
          <div className="grid grid-cols-4 sm:flex gap-2 sm:gap-3 w-full sm:w-auto">
            <MinimalButton 
              onClick={() => setShowSaveLoad('save')}
              variant="secondary"
              size="sm"
              className="text-[9px] sm:text-[11px]"
            >
              Save
            </MinimalButton>
            <MinimalButton 
              onClick={() => setShowSaveLoad('load')}
              variant="secondary"
              size="sm"
              className="text-[9px] sm:text-[11px]"
            >
              Load
            </MinimalButton>
            <MinimalButton 
              onClick={() => setShowFragmentAssembly(true)}
              variant={totalFragments > 0 ? 'primary' : 'secondary'}
              size="sm"
              disabled={totalFragments === 0}
              className="text-[9px] sm:text-[11px]"
            >
              <span className="hidden sm:inline">Fragments</span>
              <span className="sm:hidden">Frag</span>
              <span className="ml-1">({totalFragments})</span>
            </MinimalButton>
            <MinimalButton 
              onClick={() => setShowInventory(true)}
              variant="secondary"
              size="sm"
              className="text-[9px] sm:text-[11px]"
            >
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">Inv</span>
            </MinimalButton>
          </div>
          
          <MinimalButton
            onClick={() => setMode('exploration')}
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto mt-2 sm:mt-0 text-[10px] sm:text-[11px]"
          >
            <span className="hidden sm:inline">→ Exploration Mode</span>
            <span className="sm:hidden">Exploration</span>
          </MinimalButton>
        </div>
      </div>
      
      {/* Modals */}
      {showFragmentAssembly && (
        <FragmentAssembly onClose={() => setShowFragmentAssembly(false)} />
      )}
      
      {showSaveLoad && (
        <SaveLoadModal 
          mode={showSaveLoad}
          onClose={() => setShowSaveLoad(null)} 
        />
      )}
      
      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
    </div>
  )
}