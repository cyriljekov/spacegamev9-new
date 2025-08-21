'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { WeaponType } from '@/types/game'

interface InventoryModalProps {
  onClose: () => void
}

export function InventoryModal({ onClose }: InventoryModalProps) {
  const { inventory, setWeapon, removeItem, materials, health, heal, removeStatus } = useGameStore()
  const [selectedTab, setSelectedTab] = useState<'weapons' | 'items' | 'materials'>('weapons')
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(inventory.currentWeapon)
  
  const handleEquipWeapon = (weapon: WeaponType) => {
    setWeapon(weapon)
    setSelectedWeapon(weapon)
  }
  
  const handleUseItem = (item: string) => {
    // Handle different item types
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
  
  const getItemDescription = (item: string): string => {
    const descriptions: Record<string, string> = {
      'Medical Kit': 'Restores 25 health points',
      'Emergency Rations': 'Prevents starvation for 10 cycles',
      'Repair Tools': 'Can fix basic ship systems',
      'Data Pad': 'Contains valuable information',
      'Antidote': 'Cures infection status',
      'Bandages': 'Stops bleeding status',
      'Scanner Module': 'Reveals hidden objects',
      'Shield Generator': 'Provides temporary protection',
      'Fusion Core': 'Powers advanced technology',
      'Ancient Artifact': 'Unknown purpose, feels important'
    }
    return descriptions[item] || 'A mysterious item'
  }
  
  const getWeaponStats = (weapon: WeaponType): string => {
    let stats = `Damage: ${weapon.damage} | Type: ${weapon.type}`
    if (weapon.special) {
      stats += ` | Special: ${weapon.special}`
    }
    return stats
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-space-gray border-2 border-echo-blue max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-mono text-echo-blue">INVENTORY</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['weapons', 'items', 'materials'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`
                flex-1 px-4 py-2 font-mono uppercase
                ${selectedTab === tab 
                  ? 'bg-echo-blue/20 text-echo-blue border-b-2 border-echo-blue' 
                  : 'text-gray-400 hover:text-white'
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
        <div className="flex-1 overflow-y-auto p-4">
          {selectedTab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.weapons.map((weapon, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 border-2 cursor-pointer transition-all
                    ${weapon === inventory.currentWeapon
                      ? 'border-echo-blue bg-echo-blue/10'
                      : 'border-gray-700 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handleEquipWeapon(weapon)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-mono text-white mb-1">{weapon.name}</h3>
                      <p className="text-xs text-gray-400">
                        {getWeaponStats(weapon)}
                      </p>
                    </div>
                    {weapon === inventory.currentWeapon && (
                      <span className="text-xs text-echo-blue font-mono">EQUIPPED</span>
                    )}
                  </div>
                </div>
              ))}
              
              {inventory.weapons.length === 0 && (
                <p className="text-gray-500 col-span-2">No weapons available</p>
              )}
            </div>
          )}
          
          {selectedTab === 'items' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventory.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border-2 border-gray-700 hover:border-gray-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-mono text-white mb-1">{item}</h3>
                      <p className="text-xs text-gray-400">
                        {getItemDescription(item)}
                      </p>
                    </div>
                    {(item.includes('Medical') || item.includes('Antidote') || item.includes('Bandage')) && (
                      <button
                        onClick={() => handleUseItem(item)}
                        className="ml-2 px-3 py-1 text-xs bg-terminal-green text-black font-mono hover:bg-green-400"
                      >
                        USE
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {inventory.items.length === 0 && (
                <p className="text-gray-500 col-span-2">No items in inventory</p>
              )}
              
              <div className="col-span-2 mt-4 p-3 border border-gray-700">
                <p className="text-xs text-gray-400">
                  Inventory Slots: {inventory.items.length} / {inventory.maxSlots}
                </p>
              </div>
            </div>
          )}
          
          {selectedTab === 'materials' && (
            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-700">
                <h3 className="font-mono text-white mb-2">MATERIALS</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-mono text-echo-purple">{materials}</div>
                  <div className="text-sm text-gray-400">
                    <p>• 5 materials = 25% hull repair</p>
                    <p>• Used for crafting and trading</p>
                    <p>• Found by salvaging and exploration</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-2 border-gray-700">
                <h3 className="font-mono text-white mb-2">MATERIAL USES</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Hull Repair (25%)</span>
                    <span className={materials >= 5 ? 'text-terminal-green' : 'text-terminal-red'}>
                      5 materials
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weapon Upgrade</span>
                    <span className={materials >= 10 ? 'text-terminal-green' : 'text-terminal-red'}>
                      10 materials
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Fuel Cell</span>
                    <span className={materials >= 15 ? 'text-terminal-green' : 'text-terminal-red'}>
                      15 materials
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ship Restoration</span>
                    <span className={materials >= 50 ? 'text-terminal-green' : 'text-terminal-red'}>
                      50+ materials
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Health: {health}/100 | 
              Status: {Array.from(inventory.currentWeapon ? ['Armed'] : []).join(', ') || 'Ready'}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white font-mono hover:bg-gray-600"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}