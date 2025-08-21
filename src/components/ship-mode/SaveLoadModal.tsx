'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { SaveGameService, SaveGame } from '@/services/saveGameService'
import { createClient } from '@/utils/supabase'

interface SaveLoadModalProps {
  mode: 'save' | 'load'
  onClose: () => void
}

export function SaveLoadModal({ mode, onClose }: SaveLoadModalProps) {
  const [saves, setSaves] = useState<SaveGame[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [saveName, setSaveName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const gameStore = useGameStore()
  const saveService = new SaveGameService()
  const supabase = createClient()
  
  useEffect(() => {
    loadSaves()
  }, [])
  
  const loadSaves = async () => {
    setLoading(true)
    try {
      // Try to get saves (will use local storage if Supabase not configured)
      const existingSaves = await saveService.getSaves()
      
      // Create empty slots
      const allSlots: SaveGame[] = []
      for (let i = 1; i <= 5; i++) {
        const existing = existingSaves.find(s => s.slot === i)
        if (existing) {
          allSlots.push(existing)
        } else {
          allSlots.push({
            id: '',
            user_id: 'local',
            slot: i,
            save_name: `Empty Slot ${i}`,
            game_state: null as any,
            play_time: 0,
            created_at: '',
            updated_at: ''
          })
        }
      }
      
      setSaves(allSlots)
    } catch (error) {
      console.error('Failed to load saves:', error)
      setMessage({ type: 'error', text: 'Failed to load save games' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleSave = async () => {
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a save slot' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    try {
      const name = saveName || `Save ${selectedSlot} - ${new Date().toLocaleDateString()}`
      
      // Get current game state
      const currentState = gameStore
      
      const success = await saveService.saveGame(
        null, // Will use local storage
        selectedSlot,
        name,
        currentState,
        Math.floor(Date.now() / 1000) // Play time in seconds
      )
      
      if (success) {
        setMessage({ type: 'success', text: 'Game saved successfully!' })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'Failed to save game' })
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleLoad = async () => {
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a save slot' })
      return
    }
    
    setLoading(true)
    setMessage(null)
    
    try {
      const loadedState = await saveService.loadGame(null, selectedSlot)
      
      if (loadedState) {
        gameStore.loadGameState(loadedState)
        setMessage({ type: 'success', text: 'Game loaded successfully!' })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'Failed to load game' })
      }
    } catch (error) {
      console.error('Load error:', error)
      setMessage({ type: 'error', text: 'An error occurred while loading' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (slot: number) => {
    if (!confirm('Are you sure you want to delete this save?')) return
    
    setLoading(true)
    try {
      const userId = 'demo-user-001'
      await saveService.deleteSave(userId, slot)
      await loadSaves()
      setMessage({ type: 'success', text: 'Save deleted' })
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Failed to delete save' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-space-gray border-2 border-echo-blue max-w-2xl w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-mono text-echo-blue">
            {mode === 'save' ? 'SAVE GAME' : 'LOAD GAME'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {message && (
            <div className={`mb-4 p-3 border ${
              message.type === 'success' 
                ? 'border-terminal-green bg-terminal-green/10 text-terminal-green' 
                : 'border-terminal-red bg-terminal-red/10 text-terminal-red'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Save Slots */}
          <div className="space-y-2 mb-4">
            {saves.map(save => (
              <div
                key={save.slot}
                onClick={() => setSelectedSlot(save.slot)}
                className={`
                  p-4 border-2 cursor-pointer transition-all
                  ${selectedSlot === save.slot 
                    ? 'border-echo-blue bg-echo-blue/10' 
                    : 'border-gray-700 hover:border-gray-500'
                  }
                  ${loading ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono text-white">
                      SLOT {save.slot}: {save.save_name}
                    </h3>
                    {save.id && (
                      <div className="text-xs text-gray-400 mt-1">
                        <p>Play Time: {Math.floor(save.play_time / 60)} minutes</p>
                        <p>Last Saved: {save.updated_at ? new Date(save.updated_at).toLocaleString() : 'Never'}</p>
                      </div>
                    )}
                  </div>
                  {save.id && mode === 'save' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(save.slot)
                      }}
                      className="text-terminal-red hover:text-red-400 text-sm"
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Save Name Input (for save mode) */}
          {mode === 'save' && selectedSlot && (
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Save Name (optional)
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`Save ${selectedSlot} - ${new Date().toLocaleDateString()}`}
                className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono focus:border-echo-blue outline-none"
                disabled={loading}
              />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={mode === 'save' ? handleSave : handleLoad}
              disabled={!selectedSlot || loading}
              className={`
                flex-1 px-4 py-3 font-mono
                ${selectedSlot && !loading
                  ? 'bg-echo-blue text-black hover:bg-blue-400'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {loading ? 'PROCESSING...' : mode === 'save' ? 'SAVE GAME' : 'LOAD GAME'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white font-mono hover:bg-gray-600"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}