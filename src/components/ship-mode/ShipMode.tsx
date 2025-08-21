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
  const [showMenu, setShowMenu] = useState(false)
  
  const totalFragments = fragments.ship.size + fragments.gate.size + fragments.truth.size
  
  return (
    <div className="fixed inset-0 bg-black">
      {/* Galaxy Map - Full Screen */}
      <div className="absolute inset-0">
        <GalaxyMap />
      </div>
      
      {/* Overlay Status Bar - Semi-transparent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <ShipStatusBar onMenuClick={() => setShowMenu(!showMenu)} />
      </div>
      
      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-16 left-4 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border border-[#333]/50 rounded-lg p-2 min-w-[160px] shadow-2xl">
          <div className="flex flex-col gap-1">
            <MinimalButton 
              onClick={() => {
                setShowSaveLoad('save')
                setShowMenu(false)
              }}
              variant="ghost"
              size="sm"
              className="text-[11px] text-left justify-start px-3 py-2"
            >
              💾 Save Game
            </MinimalButton>
            <MinimalButton 
              onClick={() => {
                setShowSaveLoad('load')
                setShowMenu(false)
              }}
              variant="ghost"
              size="sm"
              className="text-[11px] text-left justify-start px-3 py-2"
            >
              📁 Load Game
            </MinimalButton>
            <MinimalButton 
              onClick={() => {
                setShowFragmentAssembly(true)
                setShowMenu(false)
              }}
              variant="ghost"
              size="sm"
              disabled={totalFragments === 0}
              className="text-[11px] text-left justify-start px-3 py-2"
            >
              🔮 Fragments ({totalFragments})
            </MinimalButton>
            <MinimalButton 
              onClick={() => {
                setShowInventory(true)
                setShowMenu(false)
              }}
              variant="ghost"
              size="sm"
              className="text-[11px] text-left justify-start px-3 py-2"
            >
              🎒 Inventory
            </MinimalButton>
            <div className="border-t border-[#333]/50 my-1" />
            <MinimalButton
              onClick={() => {
                setMode('exploration')
                setShowMenu(false)
              }}
              variant="ghost"
              size="sm"
              className="text-[11px] text-left justify-start px-3 py-2"
            >
              🚀 Exploration Mode
            </MinimalButton>
          </div>
        </div>
      )}
      
      {/* Click outside menu to close */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-15" 
          onClick={() => setShowMenu(false)}
        />
      )}
      
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