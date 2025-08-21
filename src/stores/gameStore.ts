import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { GameState, HexCoordinate, Inventory, WeaponType } from '@/types/game'
import { WEAPONS } from '@/constants/config'

interface GameStore extends GameState {
  gameStarted: boolean
  setGameStarted: (started: boolean) => void
  isDead: boolean
  causeOfDeath: string
  victory: boolean
  victoryType: 'ship' | 'gate' | 'truth' | null
  
  // Mode management
  setMode: (mode: 'ship' | 'exploration') => void
  
  // Movement
  moveToSystem: (coord: HexCoordinate) => void
  landOnPlanet: (planetId: string) => void
  
  // Resources
  consumeFuel: (amount: number) => void
  addMaterials: (amount: number) => void
  repairHull: (amount: number) => void
  
  // Health
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  addStatus: (status: 'wounded' | 'bleeding' | 'infected') => void
  removeStatus: (status: 'wounded' | 'bleeding' | 'infected') => void
  checkDeath: () => void
  
  // Fragments
  addFragment: (type: 'ship' | 'gate' | 'truth', id: string) => void
  triggerVictory: (type: 'ship' | 'gate' | 'truth') => void
  
  // Inventory
  addItem: (item: string) => void
  removeItem: (item: string) => void
  setWeapon: (weapon: WeaponType) => void
  
  // ECHO
  updateEchoMorality: (delta: number) => void
  setEchoStage: (stage: string) => void
  
  // War fog
  revealSystem: (coord: string) => void
  
  // Save/Load
  resetGame: () => void
  loadGameState: (state: Partial<GameState>) => void
  
  // Auto-save
  lastAutoSave: number
  triggerAutoSave: () => void
}

const initialState: GameState = {
  mode: 'ship',
  currentSystem: { q: 0, r: 0 },
  currentPlanet: null,
  warFog: new Set(['0,0']), // Start with Medusa Prime discovered
  fuel: 10,
  materials: 5,
  hull: 100,
  health: 100,
  status: new Set(),
  inventory: {
    weapons: [{
      name: 'Plasma Torch',
      damage: 20,
      type: 'energy',
      special: 'starting'
    }],
    currentWeapon: {
      name: 'Plasma Torch',
      damage: 20,
      type: 'energy',
      special: 'starting'
    },
    items: [],
    maxSlots: 12
  },
  fragments: {
    ship: new Set(),
    gate: new Set(),
    truth: new Set()
  },
  echoStage: 'professional',
  echoMorality: 0,
  seed: Math.floor(Math.random() * 1000000)
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        gameStarted: false,
        isDead: false,
        causeOfDeath: '',
        victory: false,
        victoryType: null,
        lastAutoSave: Date.now(),
        
        setGameStarted: (started) => set({ gameStarted: started }),
        
        setMode: (mode) => set({ mode }),
        
        moveToSystem: (coord) => set((state) => ({
          currentSystem: coord,
          warFog: new Set([...state.warFog, `${coord.q},${coord.r}`])
        })),
        
        landOnPlanet: (planetId) => set((state) => ({
          currentPlanet: planetId,
          hull: Math.max(0, state.hull - 1),
          mode: 'exploration'
        })),
        
        consumeFuel: (amount) => set((state) => ({
          fuel: Math.max(0, state.fuel - amount)
        })),
        
        addMaterials: (amount) => set((state) => ({
          materials: state.materials + amount
        })),
        
        repairHull: (amount) => set((state) => ({
          hull: Math.min(100, state.hull + amount),
          materials: Math.max(0, state.materials - Math.ceil(amount / 25) * 5)
        })),
        
        takeDamage: (amount) => set((state) => {
          const newHealth = Math.max(0, state.health - amount)
          if (newHealth <= 0) {
            return {
              health: 0,
              isDead: true,
              causeOfDeath: 'You succumbed to your injuries.'
            }
          }
          return { health: newHealth }
        }),
        
        heal: (amount) => set((state) => ({
          health: Math.min(100, state.health + amount)
        })),
        
        addStatus: (status) => set((state) => ({
          status: new Set([...state.status, status])
        })),
        
        removeStatus: (status) => set((state) => {
          const newStatus = new Set(state.status)
          newStatus.delete(status)
          return { status: newStatus }
        }),
        
        checkDeath: () => set((state) => {
          if (state.health <= 0) {
            return { isDead: true, causeOfDeath: 'Your injuries proved fatal.' }
          }
          if (state.fuel <= 0 && state.currentPlanet === null) {
            return { isDead: true, causeOfDeath: 'You drifted endlessly through space, fuel exhausted.' }
          }
          if (state.hull <= 0) {
            return { isDead: true, causeOfDeath: 'Your ship broke apart in the void.' }
          }
          return {}
        }),
        
        addFragment: (type, id) => set((state) => {
          const fragments = { ...state.fragments }
          fragments[type] = new Set([...fragments[type], id])
          return { fragments }
        }),
        
        triggerVictory: (type) => set({
          victory: true,
          victoryType: type
        }),
        
        addItem: (item) => set((state) => ({
          inventory: {
            ...state.inventory,
            items: state.inventory.items.length < state.inventory.maxSlots
              ? [...state.inventory.items, item]
              : state.inventory.items
          }
        })),
        
        removeItem: (item) => set((state) => ({
          inventory: {
            ...state.inventory,
            items: state.inventory.items.filter(i => i !== item)
          }
        })),
        
        setWeapon: (weapon) => set((state) => ({
          inventory: {
            ...state.inventory,
            currentWeapon: weapon
          }
        })),
        
        updateEchoMorality: (delta) => set((state) => ({
          echoMorality: Math.max(-100, Math.min(100, state.echoMorality + delta))
        })),
        
        setEchoStage: (stage) => set({ echoStage: stage }),
        
        revealSystem: (coord) => set((state) => ({
          warFog: new Set([...state.warFog, coord])
        })),
        
        resetGame: () => set({
          ...initialState,
          seed: Math.floor(Math.random() * 1000000),
          gameStarted: false,
          isDead: false,
          causeOfDeath: '',
          victory: false,
          victoryType: null,
          lastAutoSave: Date.now()
        }),
        
        loadGameState: (state) => set((prev) => ({ ...prev, ...state })),
        
        triggerAutoSave: async () => {
          const now = Date.now()
          const state = get()
          
          // Auto-save every 5 minutes or on significant events
          if (now - state.lastAutoSave > 300000) {
            set({ lastAutoSave: now })
            
            // Import dynamically to avoid circular dependency
            const { SaveGameService } = await import('@/services/saveGameService')
            const saveService = new SaveGameService()
            
            // Save to slot 1 as auto-save
            await saveService.saveGame(
              'demo-user-001',
              1,
              'Auto-Save',
              state,
              Math.floor((now - state.lastAutoSave) / 1000)
            )
          }
        }
      }),
      {
        name: 'echoes-of-earth-game',
        partialize: (state) => {
          const { gameStarted, ...gameState } = state
          return gameState
        }
      }
    )
  )
)