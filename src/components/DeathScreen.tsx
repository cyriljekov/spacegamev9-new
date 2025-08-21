'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { SaveGameService } from '@/services/saveGameService'
import { MinimalButton } from './ui/MinimalButton'
import { MinimalCard } from './ui/MinimalCard'

interface DeathScreenProps {
  causeOfDeath: string
}

export function DeathScreen({ causeOfDeath }: DeathScreenProps) {
  const [saves, setSaves] = useState<any[]>([])
  const [selectedSave, setSelectedSave] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const gameStore = useGameStore()
  const saveService = new SaveGameService()
  
  useEffect(() => {
    loadSaves()
  }, [])
  
  const loadSaves = async () => {
    setLoading(true)
    try {
      const userId = 'demo-user-001'
      const existingSaves = await saveService.getSaves(userId)
      setSaves(existingSaves.filter(save => save.id))
    } catch (error) {
      console.error('Failed to load saves:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleLoadSave = async () => {
    if (!selectedSave) return
    
    setLoading(true)
    try {
      const userId = 'demo-user-001'
      const loadedState = await saveService.loadGame(userId, selectedSave)
      
      if (loadedState) {
        gameStore.loadGameState(loadedState)
        gameStore.setGameStarted(true)
      }
    } catch (error) {
      console.error('Failed to load save:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleNewGame = () => {
    gameStore.resetGame()
    gameStore.setGameStarted(false)
  }
  
  const totalFragments = gameStore.fragments.ship.size + gameStore.fragments.gate.size + gameStore.fragments.truth.size
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="max-w-xl w-full p-10">
        {/* Death Message */}
        <div className="text-center mb-12">
          <h1 className="text-[48px] font-mono font-light text-[#ff0040] mb-4 uppercase tracking-[2px]">
            You Died
          </h1>
          <p className="text-[14px] text-gray-400">
            {causeOfDeath}
          </p>
        </div>
        
        {/* Death Stats */}
        <div className="mb-8 py-4 border-t border-b border-[#222]">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.5px] mb-1">Systems</p>
              <p className="text-[18px] font-mono text-white">{gameStore.warFog.size}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.5px] mb-1">Fragments</p>
              <p className="text-[18px] font-mono text-white">{totalFragments}/50</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.5px] mb-1">Morality</p>
              <p className="text-[18px] font-mono text-white">
                {gameStore.echoMorality > 0 ? '+' : ''}{gameStore.echoMorality}
              </p>
            </div>
          </div>
        </div>
        
        {/* Load Save Options */}
        {saves.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] text-gray-500 uppercase tracking-[1px] mb-4">
              Available Saves
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {saves.map(save => (
                <MinimalCard
                  key={save.slot}
                  hover
                  selected={selectedSave === save.slot}
                  onClick={() => setSelectedSave(save.slot)}
                  className={loading ? 'opacity-50 pointer-events-none' : ''}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[12px] font-mono text-white">
                        Slot {save.slot}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {save.save_name}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-600">
                      {new Date(save.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </MinimalCard>
              ))
            }
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          {saves.length > 0 && (
            <MinimalButton
              onClick={handleLoadSave}
              disabled={!selectedSave || loading}
              variant={selectedSave && !loading ? 'primary' : 'secondary'}
              size="lg"
              className="flex-1"
            >
              {loading ? 'Loading...' : 'Load Save'}
            </MinimalButton>
          )}
          <MinimalButton
            onClick={handleNewGame}
            variant="danger"
            size="lg"
            className="flex-1"
          >
            New Game
          </MinimalButton>
        </div>
        
        {/* Death Quote */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-gray-600 italic">
            &ldquo;In space, death is not the end.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}