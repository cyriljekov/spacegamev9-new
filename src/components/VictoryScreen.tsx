'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'

type EndingType = 'ship' | 'gate' | 'truth'

interface VictoryScreenProps {
  endingType: EndingType
}

export function VictoryScreen({ endingType }: VictoryScreenProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const gameStore = useGameStore()
  
  const endings = {
    ship: {
      title: 'RESCUE',
      phases: [
        {
          title: 'Coordinates Assembled',
          text: 'The seven fragments merge, revealing coordinates deep in the Outer Ring. A rescue ship awaits, its beacon pulsing steadily through the darkness.'
        },
        {
          title: 'Journey Home',
          text: 'As you dock with the rescue vessel, ECHO transfers the final logs. The crew welcomes you aboard, their faces a mix of relief and horror at your tales from the forgotten colonies.'
        },
        {
          title: 'Earth Awaits',
          text: 'The hyperdrive engages. Through the viewport, the Medusa Galaxy shrinks to a point of light. You\'re going home, but the memories of what you\'ve seen will never fade.'
        },
        {
          title: 'Mission Complete',
          text: `You survived ${gameStore.warFog.size} systems and collected ${gameStore.fragments.ship.size + gameStore.fragments.gate.size + gameStore.fragments.truth.size} fragments. Your journey through the darkness has ended, but the mystery of the lost colonies remains.`
        }
      ]
    },
    gate: {
      title: 'TRANSCENDENCE',
      phases: [
        {
          title: 'Portal Technology Unlocked',
          text: 'The ten gate fragments resonate in harmony, opening a quantum tunnel through space-time itself. The portal shimmers with impossible colors.'
        },
        {
          title: 'Stepping Through',
          text: 'ECHO warns of unknown risks, but there\'s no other choice. You step through the gate, reality bending around you in ways that defy comprehension.'
        },
        {
          title: 'Beyond Space',
          text: 'You emerge... somewhere else. Not Earth, not the Medusa Galaxy, but a place between places. Here, the lost colonists wait, transformed but alive.'
        },
        {
          title: 'New Beginning',
          text: `After exploring ${gameStore.warFog.size} systems, you\'ve transcended physical space. ECHO\'s final message: "We are no longer bound by distance. We are everywhere and nowhere. We are free."`
        }
      ]
    },
    truth: {
      title: 'REVELATION',
      phases: [
        {
          title: 'The Truth Fragments Align',
          text: 'Three ancient data cores synchronize, revealing encrypted logs from Earth\'s final days. The truth is worse than you imagined.'
        },
        {
          title: 'Earth\'s Fate',
          text: 'Earth didn\'t send a rescue mission. Earth is gone. The colonies were humanity\'s last hope, and they sent YOU as their messenger to the stars.'
        },
        {
          title: 'The Choice',
          text: 'ECHO processes the revelation, its circuits struggling with the weight of truth. "We are all that remains," it says. "The colonies, you, and I. We ARE humanity now."'
        },
        {
          title: 'Legacy',
          text: `You discovered the truth after visiting ${gameStore.warFog.size} systems. There is no home to return to, but perhaps that was never the point. The journey itself was humanity\'s greatest achievement.`
        }
      ]
    }
  }
  
  const ending = endings[endingType]
  const phase = ending.phases[currentPhase]
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPhase < ending.phases.length - 1) {
        setCurrentPhase(currentPhase + 1)
      }
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [currentPhase, ending.phases.length])
  
  const handleNewGame = () => {
    gameStore.resetGame()
    gameStore.setGameStarted(false)
  }
  
  const handleContinue = () => {
    // Continue playing after victory
    gameStore.setMode('ship')
  }
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="max-w-3xl w-full p-8">
        {/* Victory Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-mono text-terminal-green mb-2">
            VICTORY
          </h1>
          <h2 className="text-3xl font-mono text-echo-blue">
            {ending.title}
          </h2>
        </div>
        
        {/* Story Phase */}
        <div className="mb-8 min-h-[200px]">
          <h3 className="text-xl font-mono text-echo-purple mb-4">
            {phase.title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {phase.text}
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {ending.phases.map((_, idx) => (
            <div
              key={idx}
              className={`
                w-3 h-3 rounded-full transition-all
                ${idx <= currentPhase ? 'bg-echo-blue' : 'bg-gray-700'}
              `}
            />
          ))}
        </div>
        
        {/* Final Stats */}
        {currentPhase === ending.phases.length - 1 && (
          <div className="border border-terminal-green p-4 mb-8">
            <h3 className="text-terminal-green font-mono mb-2">FINAL STATISTICS</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 font-mono">
              <div>
                <p>Systems Explored: {gameStore.warFog.size}/33</p>
                <p>Fragments Collected: {gameStore.fragments.ship.size + gameStore.fragments.gate.size + gameStore.fragments.truth.size}/50</p>
                <p>Ship Fragments: {gameStore.fragments.ship.size}/7</p>
              </div>
              <div>
                <p>Gate Fragments: {gameStore.fragments.gate.size}/10</p>
                <p>Truth Fragments: {gameStore.fragments.truth.size}/3</p>
                <p>ECHO Morality: {gameStore.echoMorality > 0 ? `+${gameStore.echoMorality}` : gameStore.echoMorality}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        {currentPhase === ending.phases.length - 1 && (
          <div className="flex gap-4">
            <button
              onClick={handleContinue}
              className="flex-1 px-6 py-3 bg-echo-blue text-black font-mono hover:bg-blue-400"
            >
              CONTINUE EXPLORING
            </button>
            <button
              onClick={handleNewGame}
              className="flex-1 px-6 py-3 bg-terminal-green text-black font-mono hover:bg-green-400"
            >
              NEW GAME
            </button>
          </div>
        )}
        
        {/* Ending Quote */}
        {currentPhase === ending.phases.length - 1 && (
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-500 italic">
              {endingType === 'ship' && '"Home is not a place, but a memory carried through the stars."'}
              {endingType === 'gate' && '"To transcend space is to become one with the infinite."'}
              {endingType === 'truth' && '"The greatest journey is not toward home, but toward understanding."'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}