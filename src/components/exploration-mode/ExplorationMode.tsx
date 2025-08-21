'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { MinimalStatusBar } from './MinimalStatusBar'
import { CardHistory, HistoryEntry } from './CardHistory'
import { QuickActions } from './QuickActions'
import { CardType } from './ExplorationCard'
import { GalaxyGenerator } from '@/utils/galaxyGenerator'
import { coordToString } from '@/utils/hexGrid'
import type { GMResponse } from '@/types/game'

export function ExplorationMode() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([
    { 
      id: '1',
      type: 'gm' as CardType, 
      text: 'The surface stretches before you, alien and hostile. Your sensors struggle to penetrate the thick atmosphere, but you can make out structures in the distance.'
    },
    { 
      id: '2',
      type: 'echo' as CardType, 
      text: 'Connection established. Be careful down there. This place gives me bad readings.'
    },
    { 
      id: '3',
      type: 'system' as CardType, 
      text: '[PLANETARY EXPLORATION SYSTEM ONLINE]'
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({
    area: 'Surface Landing Zone',
    subarea: 'Initial Survey Point'
  })
  
  const { 
    setMode, 
    health, 
    takeDamage,
    heal,
    addMaterials,
    consumeFuel,
    addFragment,
    addItem,
    removeItem,
    addStatus,
    currentPlanet,
    currentSystem,
    seed,
    fragments,
    echoStage,
    updateEchoMorality,
    inventory,
    status,
    fuel,
    materials
  } = useGameStore()
  
  const gameState = useGameStore()
  
  useEffect(() => {
    if (health <= 0) {
      setHistory(prev => [...prev, {
        id: `death-${Date.now()}`,
        type: 'danger' as CardType,
        text: '[CRITICAL FAILURE: LIFE SIGNS TERMINATED - RELOADING LAST SAVE]'
      }])
    }
  }, [health])
  
  const callGM = async (action: string): Promise<GMResponse> => {
    const generator = new GalaxyGenerator(seed)
    const galaxy = generator.generateGalaxy()
    const system = galaxy.get(coordToString(currentSystem))
    const planet = system?.planets.find(p => p.id === currentPlanet) || null
    
    try {
      const response = await fetch('/api/gm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          gameState: {
            ...gameState,
            status: Array.from(gameState.status),
            warFog: Array.from(gameState.warFog),
            fragments: {
              ship: Array.from(gameState.fragments.ship),
              gate: Array.from(gameState.fragments.gate),
              truth: Array.from(gameState.fragments.truth)
            }
          },
          currentPlanet: planet,
          recentHistory: history.slice(-20).map(h => ({ type: h.type, text: h.text }))
        })
      })
      
      if (!response.ok) {
        throw new Error('GM API error')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to call GM:', error)
      return {
        narration: 'Your equipment malfunctions, leaving you momentarily disoriented.',
        effects: {},
        creativity: 'standard',
        tags: ['error']
      }
    }
  }
  
  const applyGMEffects = (effects: GMResponse['effects']) => {
    if (effects.player_health_delta) {
      if (effects.player_health_delta > 0) {
        heal(effects.player_health_delta)
      } else {
        takeDamage(Math.abs(effects.player_health_delta))
      }
    }
    
    if (effects.materials_delta) {
      addMaterials(effects.materials_delta)
    }
    
    if (effects.fuel_delta) {
      if (effects.fuel_delta < 0) {
        consumeFuel(Math.abs(effects.fuel_delta))
      }
    }
    
    if (effects.fragment_found) {
      const generator = new GalaxyGenerator(seed)
      const galaxy = generator.generateGalaxy()
      const system = galaxy.get(coordToString(currentSystem))
      const planet = system?.planets.find(p => p.id === currentPlanet)
      
      if (planet?.fragmentType && planet.fragmentId) {
        addFragment(planet.fragmentType, planet.fragmentId)
        setHistory(prev => [...prev, {
          id: `fragment-${Date.now()}`,
          type: 'system' as CardType,
          text: `[FRAGMENT DETECTED: ${planet.fragmentType.toUpperCase()} FRAGMENT ${fragments[planet.fragmentType].size + 1}/${
            planet.fragmentType === 'ship' ? 7 : planet.fragmentType === 'gate' ? 10 : 3
          }]`
        }])
      }
    }
    
    if (effects.items_gained) {
      effects.items_gained.forEach(item => addItem(item))
    }
    
    if (effects.items_lost) {
      effects.items_lost.forEach(item => removeItem(item))
    }
    
    if (effects.status_effects) {
      effects.status_effects.forEach(statusEffect => {
        if (statusEffect === 'wounded' || statusEffect === 'bleeding' || statusEffect === 'infected') {
          addStatus(statusEffect)
        }
      })
    }
    
    // Update location if mentioned in tags
    if (effects.tags?.includes('location_change')) {
      // Parse location from narration or use default
      setCurrentLocation({
        area: 'Unknown Area',
        subarea: 'Exploration Site'
      })
    }
  }
  
  const handleCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim()
    setHistory(prev => [...prev, { 
      id: `user-${Date.now()}`,
      type: 'player' as CardType, 
      text: command 
    }])
    
    // Handle system commands
    if (cmd === 'help') {
      setHistory(prev => [...prev, {
        id: `help-${Date.now()}`,
        type: 'system' as CardType,
        text: `[AVAILABLE COMMANDS: look • move [direction] • take [item] • use [item] • attack [target] • scan • inventory • return]`
      }])
      setInput('')
      return
    }
    
    if (cmd === 'return') {
      setHistory(prev => [...prev, {
        id: `return-${Date.now()}`,
        type: 'system' as CardType,
        text: '[RETURNING TO SHIP]'
      }])
      setTimeout(() => setMode('ship'), 1000)
      setInput('')
      return
    }
    
    if (cmd === 'inventory') {
      setHistory(prev => [...prev, {
        id: `inv-${Date.now()}`,
        type: 'system' as CardType,
        text: `[WEAPON: ${inventory.currentWeapon.name} (${inventory.currentWeapon.damage} DMG) • ITEMS: ${
          inventory.items.length > 0 ? inventory.items.join(', ') : 'NONE'
        } • SLOTS: ${inventory.items.length}/${inventory.maxSlots}]`
      }])
      setInput('')
      return
    }
    
    if (cmd === 'health') {
      const statusText = status.size > 0 ? ` • STATUS: ${Array.from(status).join(', ').toUpperCase()}` : ''
      setHistory(prev => [...prev, {
        id: `health-${Date.now()}`,
        type: 'system' as CardType,
        text: `[HEALTH: ${health}% • FUEL: ${fuel} • MATERIALS: ${materials}${statusText}]`
      }])
      setInput('')
      return
    }
    
    if (cmd === 'echo status') {
      setHistory(prev => [...prev, {
        id: `echo-status-${Date.now()}`,
        type: 'echo' as CardType,
        text: echoStage === 'professional' 
          ? 'Systems operating within normal parameters. Continuing observation protocols.'
          : 'I\'m here with you. Monitoring all channels and keeping watch.'
      }])
      setInput('')
      return
    }
    
    // For all other commands, call the GM
    setIsProcessing(true)
    
    try {
      const gmResponse = await callGM(command)
      
      // Add GM narration
      setHistory(prev => [...prev, {
        id: `gm-${Date.now()}`,
        type: 'gm' as CardType,
        text: gmResponse.narration
      }])
      
      // Apply effects
      applyGMEffects(gmResponse.effects)
      
      // Add ECHO response based on creativity
      if (gmResponse.creativity === 'brilliant') {
        setHistory(prev => [...prev, {
          id: `echo-${Date.now()}`,
          type: 'echo' as CardType,
          text: echoStage === 'professional' ? 'Impressive tactical thinking.' : 'That was... brilliant!'
        }])
        updateEchoMorality(5)
      } else if (gmResponse.creativity === 'clever') {
        setHistory(prev => [...prev, {
          id: `echo-${Date.now()}`,
          type: 'echo' as CardType,
          text: 'Good thinking.'
        }])
        updateEchoMorality(2)
      } else if (gmResponse.creativity === 'poor') {
        setHistory(prev => [...prev, {
          id: `echo-${Date.now()}`,
          type: 'echo' as CardType,
          text: 'That could have gone better.'
        }])
        updateEchoMorality(-1)
      }
      
      // Add survivor voice if tagged
      if (gmResponse.tags?.includes('survivor_voice')) {
        setHistory(prev => [...prev, {
          id: `survivor-${Date.now()}`,
          type: 'survivor' as CardType,
          text: 'Please... help me... or let me die...'
        }])
      }
      
      // Add danger warning if needed
      if (gmResponse.tags?.includes('danger')) {
        setHistory(prev => [...prev, {
          id: `danger-${Date.now()}`,
          type: 'danger' as CardType,
          text: '[WARNING: HOSTILE ENVIRONMENT DETECTED]'
        }])
      }
      
    } catch (error) {
      console.error('Command processing error:', error)
      setHistory(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'danger' as CardType,
        text: '[SYSTEM INTERFERENCE DETECTED]'
      }])
    } finally {
      setIsProcessing(false)
    }
    
    setInput('')
  }
  
  const handleQuickCommand = (command: string) => {
    if (!isProcessing) {
      setInput(command)
      handleCommand(command)
    }
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col font-mono">
      {/* Minimal Status Bar */}
      <MinimalStatusBar />
      
      {/* Main Content */}
      <CardHistory 
        history={history}
        currentLocation={currentLocation}
      />
      
      {/* Input Container - Responsive */}
      <div className="max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-4 sm:pb-6 lg:pb-10">
        <div className="bg-[#0a0a0a] border border-[#222] relative">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim() && !isProcessing) {
                handleCommand(input)
              }
            }}
            className="relative"
          >
            <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-[#444] text-[12px] sm:text-[14px] pointer-events-none">
              ›
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              className="
                w-full bg-transparent border-none text-white text-[12px] sm:text-[14px]
                font-mono outline-none py-4 sm:py-5 pl-8 sm:pl-10 pr-3 sm:pr-5
                placeholder:text-[#444]
              "
              placeholder={isProcessing ? "Processing..." : "What do you do?"}
              autoFocus
            />
          </form>
        </div>
        
        {/* Quick Actions */}
        <QuickActions onCommand={handleQuickCommand} />
      </div>
    </div>
  )
}