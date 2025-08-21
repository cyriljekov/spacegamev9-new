import { GameState } from '@/types/game'
import { Planet } from '@/utils/galaxyGenerator'

interface SessionEvent {
  timestamp: number
  type: 'action' | 'discovery' | 'combat' | 'dialogue'
  summary: string
}

export class ContextManager {
  private static readonly MAX_TOKENS = 200000
  private static readonly SUMMARY_THRESHOLD = 150000
  private sessionEvents: SessionEvent[] = []
  private currentTokenCount: number = 0
  
  constructor() {
    this.sessionEvents = []
    this.currentTokenCount = 0
  }
  
  buildContext(
    gameState: GameState,
    currentPlanet: Planet | null,
    recentHistory: Array<{type: string, text: string}>
  ): string {
    const context = {
      playerStatus: this.buildPlayerStatus(gameState),
      location: this.buildLocationContext(currentPlanet),
      inventory: this.buildInventoryContext(gameState),
      fragments: this.buildFragmentContext(gameState),
      echo: this.buildEchoContext(gameState),
      recentEvents: this.buildRecentEvents(recentHistory),
      sessionSummary: this.buildSessionSummary()
    }
    
    const contextString = `
PLAYER STATUS:
${context.playerStatus}

CURRENT LOCATION:
${context.location}

INVENTORY:
${context.inventory}

FRAGMENTS COLLECTED:
${context.fragments}

ECHO COMPANION:
${context.echo}

RECENT EVENTS:
${context.recentEvents}

SESSION CONTEXT:
${context.sessionSummary}
`
    
    // Check if we need to summarize
    this.currentTokenCount = this.estimateTokens(contextString)
    if (this.currentTokenCount > ContextManager.SUMMARY_THRESHOLD) {
      this.summarizeOldEvents()
    }
    
    return contextString
  }
  
  private buildPlayerStatus(gameState: GameState): string {
    const status = []
    status.push(`Health: ${gameState.health}%`)
    status.push(`Hull Integrity: ${gameState.hull}%`)
    status.push(`Fuel: ${gameState.fuel} units`)
    status.push(`Materials: ${gameState.materials} units`)
    
    if (gameState.status.size > 0) {
      status.push(`Conditions: ${Array.from(gameState.status).join(', ')}`)
    }
    
    return status.join('\n')
  }
  
  private buildLocationContext(planet: Planet | null): string {
    if (!planet) {
      return 'Currently aboard ship in space'
    }
    
    const details = []
    details.push(`Planet: ${planet.name}`)
    details.push(`Type: ${planet.type}`)
    details.push(`Danger Level: ${planet.danger}/10`)
    details.push(planet.description)
    
    if (planet.hasFragment) {
      details.push(`ANOMALOUS SIGNAL DETECTED`)
    }
    
    return details.join('\n')
  }
  
  private buildInventoryContext(gameState: GameState): string {
    const inv = []
    inv.push(`Current Weapon: ${gameState.inventory.currentWeapon.name} (${gameState.inventory.currentWeapon.damage} damage)`)
    
    if (gameState.inventory.items.length > 0) {
      inv.push(`Items: ${gameState.inventory.items.join(', ')}`)
    } else {
      inv.push('Items: None')
    }
    
    inv.push(`Inventory Slots: ${gameState.inventory.items.length}/${gameState.inventory.maxSlots}`)
    
    return inv.join('\n')
  }
  
  private buildFragmentContext(gameState: GameState): string {
    const frags = []
    frags.push(`Ship Coordinates: ${gameState.fragments.ship.size}/7`)
    frags.push(`Gate Technology: ${gameState.fragments.gate.size}/10`)
    frags.push(`Truth Fragments: ${gameState.fragments.truth.size}/3`)
    
    const total = gameState.fragments.ship.size + 
                  gameState.fragments.gate.size + 
                  gameState.fragments.truth.size
    frags.push(`Total: ${total}/50`)
    
    return frags.join('\n')
  }
  
  private buildEchoContext(gameState: GameState): string {
    const echo = []
    echo.push(`Development Stage: ${gameState.echoStage}`)
    echo.push(`Morality Alignment: ${gameState.echoMorality > 0 ? 'Positive' : 'Negative'} (${Math.abs(gameState.echoMorality)})`)
    
    // Add personality traits based on morality
    if (gameState.echoMorality > 50) {
      echo.push('Personality: Protective, encouraging, hopeful')
    } else if (gameState.echoMorality > 0) {
      echo.push('Personality: Professional, analytical, cautious')
    } else if (gameState.echoMorality > -50) {
      echo.push('Personality: Cold, calculating, pragmatic')
    } else {
      echo.push('Personality: Hostile, manipulative, cruel')
    }
    
    return echo.join('\n')
  }
  
  private buildRecentEvents(history: Array<{type: string, text: string}>): string {
    // Get last 10 events
    const recent = history.slice(-10)
    return recent.map(event => `- ${event.text}`).join('\n')
  }
  
  private buildSessionSummary(): string {
    if (this.sessionEvents.length === 0) {
      return 'Session just started'
    }
    
    // Group events by type
    const eventTypes: Record<string, number> = {}
    this.sessionEvents.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1
    })
    
    const summary = []
    summary.push(`Total events: ${this.sessionEvents.length}`)
    
    Object.entries(eventTypes).forEach(([type, count]) => {
      summary.push(`${type}: ${count}`)
    })
    
    // Add recent significant events
    const significant = this.sessionEvents
      .filter(e => e.type === 'discovery' || e.type === 'combat')
      .slice(-5)
    
    if (significant.length > 0) {
      summary.push('\nRecent significant events:')
      significant.forEach(event => {
        summary.push(`- ${event.summary}`)
      })
    }
    
    return summary.join('\n')
  }
  
  addSessionEvent(type: SessionEvent['type'], summary: string): void {
    this.sessionEvents.push({
      timestamp: Date.now(),
      type,
      summary
    })
  }
  
  private summarizeOldEvents(): void {
    // Keep only last 50 events
    if (this.sessionEvents.length > 50) {
      const toSummarize = this.sessionEvents.slice(0, -50)
      const summary = this.createSummary(toSummarize)
      
      // Replace old events with summary
      this.sessionEvents = [
        {
          timestamp: toSummarize[0].timestamp,
          type: 'action',
          summary: `[Summarized ${toSummarize.length} events: ${summary}]`
        },
        ...this.sessionEvents.slice(-50)
      ]
    }
  }
  
  private createSummary(events: SessionEvent[]): string {
    const types: Record<string, number> = {}
    events.forEach(e => {
      types[e.type] = (types[e.type] || 0) + 1
    })
    
    return Object.entries(types)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ')
  }
  
  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }
  
  reset(): void {
    this.sessionEvents = []
    this.currentTokenCount = 0
  }
}