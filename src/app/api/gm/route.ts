import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@/services/geminiService'
import { ContextManager } from '@/services/contextManager'

const geminiService = new GeminiService()
const contextManager = new ContextManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, gameState, currentPlanet, recentHistory } = body
    
    if (!action || !gameState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Build context
    const context = contextManager.buildContext(
      gameState,
      currentPlanet,
      recentHistory || []
    )
    
    // Generate GM response
    const gmResponse = await geminiService.generateResponse(
      action,
      context
    )
    
    // Add session event
    if (gmResponse.effects.fragment_found) {
      contextManager.addSessionEvent('discovery', `Found fragment: ${gmResponse.effects.fragment_found}`)
    }
    if (gmResponse.effects.player_health_delta && gmResponse.effects.player_health_delta < -10) {
      contextManager.addSessionEvent('combat', `Took ${Math.abs(gmResponse.effects.player_health_delta)} damage`)
    }
    
    return NextResponse.json(gmResponse)
    
  } catch (error) {
    console.error('GM API error:', error)
    
    // Return fallback response
    return NextResponse.json({
      narration: 'The alien environment shifts unpredictably around you.',
      effects: {},
      creativity: 'standard',
      tags: ['error', 'fallback']
    })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Game Master API',
    model: 'gemini-2.0-flash-exp'
  })
}