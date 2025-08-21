'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { SaveGameService, SaveGame } from '@/services/saveGameService'
import { MinimalModal } from '../ui/MinimalModal'
import { MinimalButton } from '../ui/MinimalButton'
import { MinimalCard } from '../ui/MinimalCard'

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
  
  useEffect(() => {
    loadSaves()
  }, [])
  
  const loadSaves = async () => {
    setLoading(true)
    try {
      const existingSaves = await saveService.getSaves()
      
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
      const currentState = gameStore
      
      const success = await saveService.saveGame(
        null,
        selectedSlot,
        name,
        currentState,
        Math.floor(Date.now() / 1000)
      )
      
      if (success) {
        setMessage({ type: 'success', text: 'Game saved successfully' })
        setTimeout(() => onClose(), 1500)
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
        setMessage({ type: 'success', text: 'Game loaded successfully' })
        setTimeout(() => onClose(), 1500)
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
    if (!confirm('Delete this save?')) return
    
    setLoading(true)
    try {
      await saveService.deleteSave('demo-user-001', slot)
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
    <MinimalModal
      title={mode === 'save' ? 'Save Game' : 'Load Game'}
      onClose={onClose}
      width="md"
    >
      <div className="p-8">
        {/* Message */}
        {message && (
          <div className={`
            mb-6 px-4 py-3 border text-[12px] uppercase tracking-[0.5px]
            ${message.type === 'success' 
              ? 'border-[#00ff41] bg-[#00ff4108] text-[#00ff41]' 
              : 'border-[#ff0040] bg-[#ff004008] text-[#ff0040]'
            }
          `}>
            {message.text}
          </div>
        )}
        
        {/* Save Slots */}
        <div className="space-y-3 mb-6">
          {saves.map(save => (
            <MinimalCard
              key={save.slot}
              hover
              selected={selectedSlot === save.slot}
              onClick={() => setSelectedSlot(save.slot)}
              className={loading ? 'opacity-50 pointer-events-none' : ''}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-[12px] text-white uppercase tracking-[0.5px] mb-1">
                    Slot {save.slot}
                  </h3>
                  <p className="text-[14px] text-gray-400">
                    {save.save_name}
                  </p>
                  {save.id && (
                    <div className="text-[10px] text-gray-600 mt-2 space-y-1">
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
                    className="text-[10px] text-[#ff0040] hover:text-[#ff0060] uppercase tracking-[0.5px]"
                  >
                    Delete
                  </button>
                )}
              </div>
            </MinimalCard>
          ))}
        </div>
        
        {/* Save Name Input (for save mode) */}
        {mode === 'save' && selectedSlot && (
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-[0.5px] mb-2">
              Save Name (Optional)
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={`Save ${selectedSlot} - ${new Date().toLocaleDateString()}`}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] text-white text-[14px] font-mono focus:border-[#333] outline-none"
              disabled={loading}
            />
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <MinimalButton
            onClick={mode === 'save' ? handleSave : handleLoad}
            disabled={!selectedSlot || loading}
            variant={selectedSlot && !loading ? 'primary' : 'secondary'}
            size="lg"
            className="flex-1"
          >
            {loading ? 'Processing...' : mode === 'save' ? 'Save Game' : 'Load Game'}
          </MinimalButton>
          <MinimalButton
            onClick={onClose}
            variant="secondary"
            size="lg"
          >
            Cancel
          </MinimalButton>
        </div>
      </div>
    </MinimalModal>
  )
}