import seedrandom from 'seedrandom'
import { HexCoordinate } from '@/types/game'
import { hexDistance, getRing, coordToString } from './hexGrid'

export interface StarSystem {
  id: string
  coordinate: HexCoordinate
  name: string
  planets: Planet[]
  discovered: boolean
  ring: number
}

export interface Planet {
  id: string
  systemId: string
  name: string
  type: 'rocky' | 'gas' | 'ice' | 'volcanic' | 'ocean' | 'desert' | 'toxic'
  hasFragment: boolean
  fragmentType?: 'ship' | 'gate' | 'truth'
  fragmentId?: string
  description: string
  danger: number // 1-10
}

const SYSTEM_NAMES = [
  'Medusa Prime', 'Serpens', 'Hydra', 'Perseus', 'Andromeda',
  'Cerberus', 'Chimera', 'Phoenix', 'Pegasus', 'Orion',
  'Draco', 'Lyra', 'Aquila', 'Cygnus', 'Vega',
  'Altair', 'Polaris', 'Sirius', 'Rigel', 'Betelgeuse',
  'Antares', 'Aldebaran', 'Arcturus', 'Spica', 'Deneb',
  'Procyon', 'Capella', 'Castor', 'Pollux', 'Regulus',
  'Bellatrix', 'Alnilam', 'Mintaka'
]

export class GalaxyGenerator {
  private rng: seedrandom.PRNG
  private seed: number
  
  constructor(seed: number) {
    this.seed = seed
    this.rng = seedrandom(seed.toString())
  }
  
  generateGalaxy(): Map<string, StarSystem> {
    const systems = new Map<string, StarSystem>()
    const coordinates = this.generateSystemCoordinates()
    
    // Distribute fragments across the galaxy
    const fragmentDistribution = this.distributeFragments(coordinates)
    
    coordinates.forEach((coord, index) => {
      const systemId = coordToString(coord)
      const system = this.generateSystem(coord, index, fragmentDistribution.get(systemId))
      systems.set(systemId, system)
    })
    
    return systems
  }
  
  private generateSystemCoordinates(): HexCoordinate[] {
    const coords: HexCoordinate[] = []
    const used = new Set<string>()
    
    // Start with center
    coords.push({ q: 0, r: 0 })
    used.add('0,0')
    
    // Generate rings
    for (let ring = 1; ring <= 5; ring++) {
      for (let i = 0; i < ring * 6; i++) {
        let attempts = 0
        while (attempts < 50) {
          const angle = (i / (ring * 6)) * Math.PI * 2
          const distance = ring + (this.rng() - 0.5) * 0.8
          
          const x = Math.cos(angle) * distance * 2
          const y = Math.sin(angle) * distance * 2
          
          const q = Math.round(x)
          const r = Math.round(y - x / 2)
          const key = `${q},${r}`
          
          if (!used.has(key) && hexDistance({ q: 0, r: 0 }, { q, r }) <= 6) {
            coords.push({ q, r })
            used.add(key)
            break
          }
          attempts++
        }
        
        if (coords.length >= 33) break
      }
      if (coords.length >= 33) break
    }
    
    return coords.slice(0, 33)
  }
  
  private distributeFragments(coordinates: HexCoordinate[]): Map<string, Array<{type: 'ship' | 'gate' | 'truth', id: string}>> {
    const distribution = new Map<string, Array<{type: 'ship' | 'gate' | 'truth', id: string}>>()
    
    // Fragment counts per ring: Ring 1: 12, Ring 2: 20, Ring 3: 18
    const ringFragments = { 1: 12, 2: 20, 3: 18 }
    const fragmentsPerType = { ship: 7, gate: 10, truth: 3 }
    
    // Group systems by ring
    const systemsByRing: Map<number, string[]> = new Map([
      [1, []],
      [2, []],
      [3, []]
    ])
    
    coordinates.forEach(coord => {
      const ring = getRing(coord)
      const key = coordToString(coord)
      systemsByRing.get(ring)?.push(key)
    })
    
    // Distribute fragments
    let shipCount = 0, gateCount = 0, truthCount = 0
    
    for (const [ring, systems] of systemsByRing.entries()) {
      const fragmentCount = ringFragments[ring as 1 | 2 | 3] || 0
      const shuffled = [...systems].sort(() => this.rng() - 0.5)
      
      for (let i = 0; i < Math.min(fragmentCount, shuffled.length * 3); i++) {
        const systemIndex = Math.floor(i / 3)
        if (systemIndex >= shuffled.length) break
        
        const systemId = shuffled[systemIndex]
        if (!distribution.has(systemId)) {
          distribution.set(systemId, [])
        }
        
        // Determine fragment type based on remaining counts
        let type: 'ship' | 'gate' | 'truth'
        if (truthCount < 3 && this.rng() < 0.1) {
          type = 'truth'
          truthCount++
        } else if (shipCount < 7 && this.rng() < 0.4) {
          type = 'ship'
          shipCount++
        } else if (gateCount < 10) {
          type = 'gate'
          gateCount++
        } else if (shipCount < 7) {
          type = 'ship'
          shipCount++
        } else {
          type = 'truth'
          truthCount++
        }
        
        const fragments = distribution.get(systemId)!
        if (fragments.length < 2) { // Max 2 fragments per system
          fragments.push({
            type,
            id: `${type}_${String(fragments.length + 1).padStart(3, '0')}`
          })
        }
      }
    }
    
    // Add remaining ship coordinates to Medusa Prime
    while (shipCount < 7) {
      const medusaFragments = distribution.get('0,0') || []
      medusaFragments.push({
        type: 'ship',
        id: `ship_${String(shipCount + 1).padStart(3, '0')}`
      })
      distribution.set('0,0', medusaFragments)
      shipCount++
    }
    
    return distribution
  }
  
  private generateSystem(
    coord: HexCoordinate, 
    index: number,
    fragments?: Array<{type: 'ship' | 'gate' | 'truth', id: string}>
  ): StarSystem {
    const systemId = coordToString(coord)
    const name = SYSTEM_NAMES[index] || `System ${index + 1}`
    const ring = getRing(coord)
    
    // Generate 3 planets per system
    const planets: Planet[] = []
    const fragmentsToPlace = fragments ? [...fragments] : []
    
    for (let i = 0; i < 3; i++) {
      const fragment = fragmentsToPlace.shift()
      const planet = this.generatePlanet(systemId, i, ring, fragment)
      planets.push(planet)
    }
    
    return {
      id: systemId,
      coordinate: coord,
      name,
      planets,
      discovered: systemId === '0,0', // Only Medusa Prime starts discovered
      ring
    }
  }
  
  private generatePlanet(
    systemId: string, 
    index: number,
    ring: number,
    fragment?: {type: 'ship' | 'gate' | 'truth', id: string}
  ): Planet {
    const types: Planet['type'][] = ['rocky', 'gas', 'ice', 'volcanic', 'ocean', 'desert', 'toxic']
    const type = types[Math.floor(this.rng() * types.length)]
    
    const danger = Math.min(10, Math.floor(this.rng() * 4) + ring * 2)
    
    return {
      id: `${systemId}_p${index}`,
      systemId,
      name: `${this.getGreekLetter(index)}`,
      type,
      hasFragment: !!fragment,
      fragmentType: fragment?.type,
      fragmentId: fragment?.id,
      description: this.generatePlanetDescription(type, danger, !!fragment),
      danger
    }
  }
  
  private getGreekLetter(index: number): string {
    const letters = ['Alpha', 'Beta', 'Gamma']
    return letters[index] || `Planet ${index + 1}`
  }
  
  private generatePlanetDescription(type: Planet['type'], danger: number, hasFragment: boolean): string {
    const descriptions: Record<Planet['type'], string> = {
      rocky: 'A barren world of stone and dust, scarred by ancient impacts.',
      gas: 'A swirling giant of toxic clouds and crushing pressure.',
      ice: 'A frozen wasteland where methane falls as snow.',
      volcanic: 'A hellscape of lava flows and sulfurous storms.',
      ocean: 'An endless sea hiding unknowable depths.',
      desert: 'Endless dunes shift under alien winds.',
      toxic: 'A poisonous world where the very air corrodes metal.'
    }
    
    let desc = descriptions[type]
    if (hasFragment) {
      desc += ' Your sensors detect an anomalous signal from the surface.'
    }
    if (danger >= 7) {
      desc += ' Extreme danger detected.'
    }
    
    return desc
  }
}