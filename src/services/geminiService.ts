import { GMResponse } from '@/types/game'

interface GeminiConfig {
  apiKeys: string[]
  model: string
  maxTokens: number
  temperature: number
  maxRetries: number
}

export class GeminiService {
  private config: GeminiConfig
  private currentKeyIndex: number = 0
  private retryCount: number = 0
  
  constructor() {
    // Parse all API keys from environment
    const apiKeys: string[] = []
    for (let i = 1; i <= 8; i++) {
      const key = process.env[`NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_${i}`] || 
                  process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
      if (key) apiKeys.push(key)
    }
    
    this.config = {
      apiKeys,
      model: 'gemini-2.0-flash-exp',
      maxTokens: 200000,
      temperature: 0.8,
      maxRetries: 3
    }
  }
  
  private getNextApiKey(): string {
    const key = this.config.apiKeys[this.currentKeyIndex]
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.config.apiKeys.length
    return key
  }
  
  async generateResponse(
    prompt: string,
    context: string,
    retryAttempt: number = 0
  ): Promise<GMResponse> {
    try {
      const apiKey = this.getNextApiKey()
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: this.buildPrompt(prompt, context)
              }]
            }],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: 2000,
              responseMimeType: "application/json"
            }
          })
        }
      )
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }
      
      const data = await response.json()
      const gmResponse = this.parseGeminiResponse(data)
      
      // Validate response
      if (!this.validateGMResponse(gmResponse)) {
        throw new Error('Invalid GM response format')
      }
      
      return gmResponse
      
    } catch (error) {
      console.error('Gemini API error:', error)
      
      // Retry logic
      if (retryAttempt < this.config.maxRetries) {
        console.log(`Retrying... (attempt ${retryAttempt + 1}/${this.config.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryAttempt + 1)))
        return this.generateResponse(prompt, context, retryAttempt + 1)
      }
      
      // Fallback response
      return this.getFallbackResponse(prompt)
    }
  }
  
  private buildPrompt(userAction: string, context: string): string {
    return `You are the Game Master for "Echoes of Earth", a mature survival horror game set in the Medusa Galaxy. 

CURRENT CONTEXT:
${context}

PLAYER ACTION: ${userAction}

You must respond with a JSON object containing:
1. "narration": A vivid, atmospheric description (2-3 sentences, mature content allowed)
2. "effects": Game state changes
3. "creativity": Rate the player's action as "poor", "standard", "clever", or "brilliant"

The effects object can include:
- player_health_delta: Health change (-100 to +100)
- enemy_damage: Array of {id: string, damage: number}
- items_gained: Array of item names
- items_lost: Array of item names
- materials_delta: Materials change
- fuel_delta: Fuel change
- fragment_found: Fragment ID if found
- location_state: Object with location changes
- status_effects: Array of new status effects

IMPORTANT RULES:
- Be harsh and unforgiving - this is a survival horror game
- Include graphic descriptions of violence and horror (18+ content)
- Fragments are extremely rare - only reveal if player is very thorough
- Combat damage varies based on creativity rating (multiply by: poor=0.5, standard=1, clever=1.5, brilliant=2)
- Death is permanent - player must reload save
- No emergency fuel generation allowed
- Maintain the dark, oppressive atmosphere

Respond ONLY with the JSON object, no additional text.`
  }
  
  private parseGeminiResponse(data: any): GMResponse {
    try {
      const text = data.candidates[0].content.parts[0].text
      const parsed = JSON.parse(text)
      
      return {
        narration: parsed.narration || 'You explore the alien environment.',
        effects: {
          player_health_delta: parsed.effects?.player_health_delta,
          enemy_damage: parsed.effects?.enemy_damage,
          items_gained: parsed.effects?.items_gained,
          items_lost: parsed.effects?.items_lost,
          materials_delta: parsed.effects?.materials_delta,
          fuel_delta: parsed.effects?.fuel_delta,
          fragment_found: parsed.effects?.fragment_found,
          location_state: parsed.effects?.location_state,
          status_effects: parsed.effects?.status_effects
        },
        creativity: parsed.creativity || 'standard',
        tags: parsed.tags || []
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      throw error
    }
  }
  
  private validateGMResponse(response: GMResponse): boolean {
    // Check required fields
    if (!response.narration || typeof response.narration !== 'string') {
      return false
    }
    
    if (!response.effects || typeof response.effects !== 'object') {
      return false
    }
    
    // Validate creativity rating
    const validCreativity = ['poor', 'standard', 'clever', 'brilliant']
    if (response.creativity && !validCreativity.includes(response.creativity)) {
      return false
    }
    
    // Validate numeric fields
    const numericFields = ['player_health_delta', 'materials_delta', 'fuel_delta']
    for (const field of numericFields) {
      const value = response.effects[field as keyof typeof response.effects]
      if (value !== undefined && typeof value !== 'number') {
        return false
      }
    }
    
    return true
  }
  
  private getFallbackResponse(action: string): GMResponse {
    const fallbackResponses = [
      'The alien environment resists your attempts to understand it.',
      'Your actions echo meaninglessly in the void.',
      'The hostile world offers no response to your efforts.',
      'Static fills your senses as reality shifts uncomfortably.'
    ]
    
    return {
      narration: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      effects: {},
      creativity: 'standard',
      tags: ['fallback']
    }
  }
}