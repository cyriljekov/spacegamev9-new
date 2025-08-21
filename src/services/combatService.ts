import { WeaponType } from '@/types/game'

export type CombatQuality = 'poor' | 'standard' | 'clever' | 'brilliant'

export interface CombatResult {
  damage: number
  quality: CombatQuality
  description: string
  enemyDefeated: boolean
  playerDefeated: boolean
}

export interface Enemy {
  name: string
  health: number
  maxHealth: number
  attackPower: number
  type: 'creature' | 'construct' | 'environmental'
  weaknesses: string[]
  resistances: string[]
}

export class CombatService {
  private combatMultipliers: Record<CombatQuality, number> = {
    poor: 0.5,
    standard: 1.0,
    clever: 1.5,
    brilliant: 2.0
  }
  
  calculateDamage(
    weapon: WeaponType,
    enemy: Enemy,
    actionQuality: CombatQuality
  ): number {
    let baseDamage = weapon.damage
    const multiplier = this.combatMultipliers[actionQuality]
    
    // Apply weakness/resistance modifiers
    if (enemy.weaknesses.includes(weapon.type)) {
      baseDamage *= 1.5
    }
    if (enemy.resistances.includes(weapon.type)) {
      baseDamage *= 0.5
    }
    
    // Apply quality multiplier
    const finalDamage = Math.floor(baseDamage * multiplier)
    return Math.max(1, finalDamage) // Minimum 1 damage
  }
  
  performAttack(
    weapon: WeaponType,
    enemy: Enemy,
    actionQuality: CombatQuality,
    playerHealth: number
  ): CombatResult {
    const damage = this.calculateDamage(weapon, enemy, actionQuality)
    enemy.health = Math.max(0, enemy.health - damage)
    
    // Enemy counter-attack if still alive
    let playerDamage = 0
    if (enemy.health > 0) {
      // Clever and brilliant actions reduce counter damage
      const defenseMod = actionQuality === 'brilliant' ? 0.25 : 
                         actionQuality === 'clever' ? 0.5 : 1.0
      playerDamage = Math.floor(enemy.attackPower * defenseMod)
    }
    
    return {
      damage,
      quality: actionQuality,
      description: this.getCombatDescription(weapon, enemy, actionQuality, damage),
      enemyDefeated: enemy.health <= 0,
      playerDefeated: playerHealth - playerDamage <= 0
    }
  }
  
  private getCombatDescription(
    weapon: WeaponType,
    enemy: Enemy,
    quality: CombatQuality,
    damage: number
  ): string {
    const descriptions: Record<CombatQuality, string[]> = {
      poor: [
        `Your clumsy attack with the ${weapon.name} barely scratches the ${enemy.name}.`,
        `You fumble with the ${weapon.name}, dealing minimal damage.`,
        `Your poorly aimed strike glances off the ${enemy.name}.`
      ],
      standard: [
        `You strike the ${enemy.name} with your ${weapon.name}, dealing solid damage.`,
        `Your ${weapon.name} connects cleanly with the ${enemy.name}.`,
        `You land a direct hit on the ${enemy.name}.`
      ],
      clever: [
        `You exploit an opening, striking the ${enemy.name}'s weak point!`,
        `Your tactical maneuver catches the ${enemy.name} off-guard!`,
        `You cleverly outmaneuver the ${enemy.name}, landing a critical strike!`
      ],
      brilliant: [
        `Brilliant! You execute a perfect attack sequence, devastating the ${enemy.name}!`,
        `Your masterful technique completely overwhelms the ${enemy.name}!`,
        `In a flash of inspiration, you deliver a devastating blow to the ${enemy.name}!`
      ]
    }
    
    const descList = descriptions[quality]
    const desc = descList[Math.floor(Math.random() * descList.length)]
    return `${desc} [${damage} damage]`
  }
  
  createEnemy(type: string): Enemy {
    const enemies: Record<string, Enemy> = {
      'corrupted_drone': {
        name: 'Corrupted Security Drone',
        health: 40,
        maxHealth: 40,
        attackPower: 15,
        type: 'construct',
        weaknesses: ['energy', 'electric'],
        resistances: ['physical']
      },
      'shadow_beast': {
        name: 'Shadow Beast',
        health: 60,
        maxHealth: 60,
        attackPower: 20,
        type: 'creature',
        weaknesses: ['energy', 'fire'],
        resistances: ['physical', 'cold']
      },
      'toxic_fungus': {
        name: 'Toxic Fungal Colony',
        health: 30,
        maxHealth: 30,
        attackPower: 10,
        type: 'environmental',
        weaknesses: ['fire', 'chemical'],
        resistances: ['physical', 'electric']
      },
      'rogue_ai': {
        name: 'Rogue AI Construct',
        health: 80,
        maxHealth: 80,
        attackPower: 25,
        type: 'construct',
        weaknesses: ['electric', 'hacking'],
        resistances: ['physical', 'fire']
      },
      'mutant_survivor': {
        name: 'Mutated Survivor',
        health: 50,
        maxHealth: 50,
        attackPower: 18,
        type: 'creature',
        weaknesses: ['chemical', 'fire'],
        resistances: ['cold', 'electric']
      }
    }
    
    return enemies[type] || enemies['corrupted_drone']
  }
  
  // Assess action quality based on GM response
  assessActionQuality(gmResponse: string): CombatQuality {
    const lowerResponse = gmResponse.toLowerCase()
    
    // Keywords indicating quality
    const brilliantKeywords = ['brilliant', 'masterful', 'perfect', 'flawless', 'genius']
    const cleverKeywords = ['clever', 'smart', 'tactical', 'strategic', 'cunning']
    const poorKeywords = ['clumsy', 'fumble', 'miss', 'fail', 'poor', 'weak']
    
    if (brilliantKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return 'brilliant'
    }
    if (cleverKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return 'clever'
    }
    if (poorKeywords.some(keyword => lowerResponse.includes(keyword))) {
      return 'poor'
    }
    
    return 'standard'
  }
}