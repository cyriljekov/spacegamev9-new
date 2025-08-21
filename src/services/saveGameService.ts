import { createClient } from '@/utils/supabase'
import { GameState } from '@/types/game'

export interface SaveGame {
  id: string
  user_id: string
  slot: number
  save_name: string
  game_state: GameState
  play_time: number
  created_at: string
  updated_at: string
}

export class SaveGameService {
  private supabase = createClient()
  
  async getSaves(userId?: string): Promise<SaveGame[]> {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
        return this.getLocalSaves()
      }

      // If no userId provided, use local storage
      if (!userId) {
        return this.getLocalSaves()
      }

      const { data, error } = await this.supabase
        .from('save_games')
        .select(`
          *,
          game_states (*)
        `)
        .eq('user_id', userId)
        .order('slot')
      
      if (error) {
        console.error('Failed to get saves from Supabase:', error)
        // Fallback to local storage
        return this.getLocalSaves()
      }
      
      return (data || []).map(save => this.formatSaveGame(save))
    } catch (error) {
      console.error('Failed to get saves:', error)
      // Fallback to local storage
      return this.getLocalSaves()
    }
  }

  private getLocalSaves(): SaveGame[] {
    try {
      const saves: SaveGame[] = []
      for (let i = 1; i <= 5; i++) {
        const saveData = localStorage.getItem(`echoes-save-slot-${i}`)
        if (saveData) {
          const parsedSave = JSON.parse(saveData)
          saves.push({
            id: `local-${i}`,
            user_id: 'local',
            slot: i,
            save_name: parsedSave.save_name || `Save Slot ${i}`,
            game_state: parsedSave.game_state,
            play_time: parsedSave.play_time || 0,
            created_at: parsedSave.created_at || new Date().toISOString(),
            updated_at: parsedSave.updated_at || new Date().toISOString()
          })
        }
      }
      return saves
    } catch (error) {
      console.error('Failed to get local saves:', error)
      return []
    }
  }
  
  async saveGame(
    userId: string | null,
    slot: number,
    saveName: string,
    gameState: GameState,
    playTime: number = 0
  ): Promise<boolean> {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !userId) {
        // Use local storage fallback
        return this.saveToLocal(slot, saveName, gameState, playTime)
      }
      // First, create or update the game state
      const { data: gameStateData, error: gameStateError } = await this.supabase
        .from('game_states')
        .upsert({
          user_id: userId,
          current_system: `${gameState.currentSystem.q},${gameState.currentSystem.r}`,
          current_planet: gameState.currentPlanet,
          system_coordinates: gameState.currentSystem,
          fuel: gameState.fuel,
          materials: gameState.materials,
          hull_integrity: gameState.hull,
          player_health: gameState.health,
          player_status: Array.from(gameState.status),
          echo_stage: gameState.echoStage,
          echo_morality: gameState.echoMorality,
          war_fog: this.serializeSet(gameState.warFog),
          seed: gameState.seed,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (gameStateError) throw gameStateError
      
      // Save fragments
      const fragmentsToSave = [
        ...Array.from(gameState.fragments.ship).map(id => ({
          game_state_id: gameStateData.id,
          fragment_id: id,
          fragment_type: 'ship',
          discovered_location: gameState.currentPlanet || gameState.currentSystem.toString()
        })),
        ...Array.from(gameState.fragments.gate).map(id => ({
          game_state_id: gameStateData.id,
          fragment_id: id,
          fragment_type: 'gate',
          discovered_location: gameState.currentPlanet || gameState.currentSystem.toString()
        })),
        ...Array.from(gameState.fragments.truth).map(id => ({
          game_state_id: gameStateData.id,
          fragment_id: id,
          fragment_type: 'truth',
          discovered_location: gameState.currentPlanet || gameState.currentSystem.toString()
        }))
      ]
      
      if (fragmentsToSave.length > 0) {
        const { error: fragmentError } = await this.supabase
          .from('fragments')
          .upsert(fragmentsToSave)
        
        if (fragmentError) console.error('Fragment save error:', fragmentError)
      }
      
      // Create or update save slot
      const { error: saveError } = await this.supabase
        .from('save_games')
        .upsert({
          user_id: userId,
          slot,
          game_state_id: gameStateData.id,
          save_name: saveName,
          play_time: playTime,
          updated_at: new Date().toISOString()
        })
      
      if (saveError) throw saveError
      
      return true
    } catch (error) {
      console.error('Failed to save game:', error)
      return false
    }
  }

  private async saveToLocal(
    slot: number,
    saveName: string,
    gameState: GameState,
    playTime: number
  ): Promise<boolean> {
    try {
      const saveData = {
        save_name: saveName,
        game_state: gameState,
        play_time: playTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem(`echoes-save-slot-${slot}`, JSON.stringify(saveData))
      return true
    } catch (error) {
      console.error('Failed to save to local storage:', error)
      return false
    }
  }
  
  async loadGame(userId: string | null, slot: number): Promise<GameState | null> {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !userId) {
        // Use local storage fallback
        return this.loadFromLocal(slot)
      }
      const { data: saveData, error: saveError } = await this.supabase
        .from('save_games')
        .select(`
          *,
          game_states (*)
        `)
        .eq('user_id', userId)
        .eq('slot', slot)
        .single()
      
      if (saveError) throw saveError
      
      const gameStateData = saveData.game_states
      
      // Load fragments
      const { data: fragments, error: fragmentError } = await this.supabase
        .from('fragments')
        .select('*')
        .eq('game_state_id', gameStateData.id)
      
      if (fragmentError) throw fragmentError
      
      // Build game state
      const gameState: GameState = {
        mode: 'ship',
        currentSystem: gameStateData.system_coordinates,
        currentPlanet: gameStateData.current_planet,
        warFog: this.deserializeSet(gameStateData.war_fog),
        fuel: gameStateData.fuel,
        materials: gameStateData.materials,
        hull: gameStateData.hull_integrity,
        health: gameStateData.player_health,
        status: new Set(gameStateData.player_status || []),
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
          ship: new Set(fragments.filter(f => f.fragment_type === 'ship').map(f => f.fragment_id)),
          gate: new Set(fragments.filter(f => f.fragment_type === 'gate').map(f => f.fragment_id)),
          truth: new Set(fragments.filter(f => f.fragment_type === 'truth').map(f => f.fragment_id))
        },
        echoStage: gameStateData.echo_stage,
        echoMorality: gameStateData.echo_morality,
        seed: gameStateData.seed
      }
      
      return gameState
    } catch (error) {
      console.error('Failed to load game:', error)
      // Try local storage as fallback
      return this.loadFromLocal(slot)
    }
  }

  private loadFromLocal(slot: number): GameState | null {
    try {
      const saveData = localStorage.getItem(`echoes-save-slot-${slot}`)
      if (!saveData) return null
      
      const parsedSave = JSON.parse(saveData)
      return parsedSave.game_state
    } catch (error) {
      console.error('Failed to load from local storage:', error)
      return null
    }
  }
  
  async deleteSave(userId: string | null, slot: number): Promise<boolean> {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !userId) {
        // Use local storage fallback
        try {
          localStorage.removeItem(`echoes-save-slot-${slot}`)
          return true
        } catch (error) {
          console.error('Failed to delete local save:', error)
          return false
        }
      }
      const { error } = await this.supabase
        .from('save_games')
        .delete()
        .eq('user_id', userId)
        .eq('slot', slot)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete save:', error)
      return false
    }
  }
  
  private serializeSet(set: Set<string>): any {
    return Array.from(set)
  }
  
  private deserializeSet(data: any): Set<string> {
    return new Set(Array.isArray(data) ? data : [])
  }
  
  private formatSaveGame(data: any): SaveGame {
    return {
      id: data.id,
      user_id: data.user_id,
      slot: data.slot,
      save_name: data.save_name,
      game_state: null as any, // Will be loaded separately
      play_time: data.play_time,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at
    }
  }
}