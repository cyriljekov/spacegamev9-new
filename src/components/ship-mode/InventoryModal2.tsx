'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { WeaponType } from '@/types/game'
import { MinimalModal } from '../ui/MinimalModal'
import { MinimalCard } from '../ui/MinimalCard'
import { MinimalButton } from '../ui/MinimalButton'

export function InventoryModal({ onClose }: { onClose: () => void }) {
  const { inventory, setWeapon, removeItem, materials, health, heal, removeStatus } = useGameStore()
  const [selectedTab, setSelectedTab] = useState<'weapons' | 'items' | 'materials'>('weapons')
  
  const handleEquipWeapon = (weapon: WeaponType) => {
    setWeapon(weapon)
  }
  
  const handleUseItem = (item: string) => {
    if (item.includes('Medical')) {
      heal(25)
      removeItem(item)
    } else if (item.includes('Antidote')) {
      removeStatus('infected')
      removeItem(item)
    } else if (item.includes('Bandage')) {
      removeStatus('bleeding')
      removeItem(item)
    }
  }
  
  return (
    <MinimalModal title="Inventory" onClose={onClose} width="lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#222]">
        {(['weapons', 'items', 'materials'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`
              flex-1 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.5px]
              transition-colors duration-200
              ${selectedTab === tab 
                ? 'bg-[#111] text-white border-b-2 border-[#00b4d8]' 
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {tab} ({tab === 'weapons' ? inventory.weapons.length : 
                     tab === 'items' ? inventory.items.length : 
                     materials})
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-8">
        {selectedTab === 'weapons' && (
          <div className="space-y-3">
            {inventory.weapons.map((weapon, idx) => (
              <MinimalCard
                key={idx}
                hover
                selected={weapon === inventory.currentWeapon}
                onClick={() => handleEquipWeapon(weapon)}
                accent={weapon === inventory.currentWeapon ? 'blue' : 'none'}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-mono text-[14px] text-white mb-1">{weapon.name}</h3>
                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.5px]">
                      DMG {weapon.damage} • {weapon.type}
                      {weapon.special && ` • ${weapon.special}`}
                    </p>
                  </div>
                  {weapon === inventory.currentWeapon && (
                    <span className="text-[10px] text-[#00b4d8] uppercase tracking-[0.5px]">Equipped</span>
                  )}
                </div>
              </MinimalCard>
            ))}
            
            {inventory.weapons.length === 0 && (
              <p className="text-gray-500 text-[12px]">No weapons available</p>
            )}
          </div>
        )}
        
        {selectedTab === 'items' && (
          <div>
            <div className="space-y-3 mb-6">
              {inventory.items.map((item, idx) => {
                const isUsable = item.includes('Medical') || item.includes('Antidote') || item.includes('Bandage')
                
                return (
                  <MinimalCard key={idx} hover accent="none">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-mono text-[14px] text-white mb-1">{item}</h3>
                        <p className="text-[11px] text-gray-500">
                          {item.includes('Medical') && 'Restores 25 health'}
                          {item.includes('Antidote') && 'Cures infection'}
                          {item.includes('Bandage') && 'Stops bleeding'}
                          {!isUsable && 'Special item'}
                        </p>
                      </div>
                      {isUsable && (
                        <MinimalButton
                          onClick={() => handleUseItem(item)}
                          variant="primary"
                          size="sm"
                        >
                          Use
                        </MinimalButton>
                      )}
                    </div>
                  </MinimalCard>
                )
              })}
              
              {inventory.items.length === 0 && (
                <p className="text-gray-500 text-[12px]">No items in inventory</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-[#222]">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.5px]">
                Slots Used: {inventory.items.length} / {inventory.maxSlots}
              </p>
            </div>
          </div>
        )}
        
        {selectedTab === 'materials' && (
          <div className="space-y-6">
            <MinimalCard accent="amber">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-[14px] text-white mb-2">Materials</h3>
                  <p className="text-[11px] text-gray-500">
                    Used for repairs, crafting, and trading
                  </p>
                </div>
                <div className="text-[36px] font-mono text-[#ffb700]">
                  {materials}
                </div>
              </div>
            </MinimalCard>
            
            <div className="space-y-3">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-[1px]">Material Uses</h4>
              {[
                { name: 'Hull Repair (25%)', cost: 5 },
                { name: 'Weapon Upgrade', cost: 10 },
                { name: 'Emergency Fuel', cost: 15 },
                { name: 'Ship Restoration', cost: 50 }
              ].map(use => (
                <div key={use.name} className="flex justify-between items-center py-2 border-b border-[#222]">
                  <span className="text-[12px] text-gray-400">{use.name}</span>
                  <span className={`text-[12px] font-mono ${
                    materials >= use.cost ? 'text-[#00ff41]' : 'text-[#ff0040]'
                  }`}>
                    {use.cost} MAT
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MinimalModal>
  )
}