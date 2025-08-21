'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { ConnectionMonitor } from '@/components/ui/ConnectionMonitor'
import { MainMenu } from '@/components/ui/MainMenu'
import { ShipMode } from '@/components/ship-mode/ShipMode'
import { ExplorationMode } from '@/components/exploration-mode/ExplorationMode'
import { DeathScreen } from '@/components/DeathScreen'
import { VictoryScreen } from '@/components/VictoryScreen'

export default function Home() {
  const [isOnline, setIsOnline] = useState(true)
  const { gameStarted, mode, isDead, causeOfDeath, victory, victoryType } = useGameStore()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return <ConnectionMonitor isOnline={false} />
  }

  if (!gameStarted) {
    return <MainMenu />
  }

  if (isDead) {
    return <DeathScreen causeOfDeath={causeOfDeath} />
  }

  if (victory && victoryType) {
    return <VictoryScreen endingType={victoryType} />
  }

  return mode === 'ship' ? <ShipMode /> : <ExplorationMode />
}