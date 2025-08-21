'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { GalaxyGenerator, StarSystem, Planet } from '@/utils/galaxyGenerator'
import { hexToPixel, hexDistance, coordToString } from '@/utils/hexGrid'
import { HexCoordinate } from '@/types/game'

type ViewMode = 'galaxy' | 'system'

export function GalaxyMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [galaxy, setGalaxy] = useState<Map<string, StarSystem>>(new Map())
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  
  // New states for system view
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy')
  const [currentSystemData, setCurrentSystemData] = useState<StarSystem | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null)
  const [animationTime, setAnimationTime] = useState(0)
  
  const { 
    currentSystem, 
    warFog, 
    fuel, 
    hull,
    moveToSystem, 
    consumeFuel,
    landOnPlanet,
    seed,
    triggerAutoSave
  } = useGameStore()
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      setAnimationTime(prev => prev + 0.01)
      requestAnimationFrame(animate)
    }
    const animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])
  
  // Draw a beautiful galaxy background with consistent star positions
  const drawGalaxyBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create deep space gradient
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    gradient.addColorStop(0, '#0a0618')
    gradient.addColorStop(0.3, '#090416')
    gradient.addColorStop(0.6, '#050212')
    gradient.addColorStop(1, '#000000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Use seeded random for consistent star positions
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    // Draw distant stars
    const starCount = 300
    for (let i = 0; i < starCount; i++) {
      const x = seededRandom(seed + i * 2) * width
      const y = seededRandom(seed + i * 3) * height
      const radius = seededRandom(seed + i * 5) * 1.2
      const opacity = seededRandom(seed + i * 7) * 0.8 + 0.2
      
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.fill()
    }
    
    // Draw bright stars with glow
    const brightStarCount = 20
    for (let i = 0; i < brightStarCount; i++) {
      const x = seededRandom(seed + i * 11 + 1000) * width
      const y = seededRandom(seed + i * 13 + 1000) * height
      const radius = seededRandom(seed + i * 17 + 1000) * 2 + 1
      
      // Glow effect
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
      glowGradient.addColorStop(0, 'rgba(150, 180, 255, 0.8)')
      glowGradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.3)')
      glowGradient.addColorStop(1, 'rgba(150, 180, 255, 0)')
      ctx.fillStyle = glowGradient
      ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8)
      
      // Star core
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    
    // Draw nebula clouds
    ctx.globalAlpha = 0.15
    
    // Purple nebula
    const purpleNebula = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, 150)
    purpleNebula.addColorStop(0, '#9f44d3')
    purpleNebula.addColorStop(0.5, '#6a2c8f')
    purpleNebula.addColorStop(1, 'transparent')
    ctx.fillStyle = purpleNebula
    ctx.fillRect(0, 0, width, height)
    
    // Blue nebula
    const blueNebula = ctx.createRadialGradient(width * 0.2, height * 0.6, 0, width * 0.2, height * 0.6, 180)
    blueNebula.addColorStop(0, '#00d4ff')
    blueNebula.addColorStop(0.5, '#0080aa')
    blueNebula.addColorStop(1, 'transparent')
    ctx.fillStyle = blueNebula
    ctx.fillRect(0, 0, width, height)
    
    // Red nebula
    const redNebula = ctx.createRadialGradient(width * 0.8, height * 0.8, 0, width * 0.8, height * 0.8, 120)
    redNebula.addColorStop(0, '#ff4466')
    redNebula.addColorStop(0.5, '#aa2244')
    redNebula.addColorStop(1, 'transparent')
    ctx.fillStyle = redNebula
    ctx.fillRect(0, 0, width, height)
    
    ctx.globalAlpha = 1
    
    // Add subtle cosmic dust
    ctx.globalAlpha = 0.05
    for (let i = 0; i < 5; i++) {
      const x = seededRandom(seed + i * 31 + 2000) * width
      const y = seededRandom(seed + i * 37 + 2000) * height
      const radius = seededRandom(seed + i * 41 + 2000) * 200 + 100
      const dustGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      dustGradient.addColorStop(0, '#ffffff')
      dustGradient.addColorStop(0.5, '#666666')
      dustGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = dustGradient
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
    ctx.globalAlpha = 1
  }
  
  // Draw system view with orbiting planets
  const drawSystemView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentSystemData) return
    
    const centerX = width / 2
    const centerY = height / 2
    
    // Draw the star at center with animated glow
    const pulseScale = 1 + Math.sin(animationTime * 2) * 0.1
    const starRadius = 40 * pulseScale
    
    // Star glow layers
    for (let i = 3; i > 0; i--) {
      const glowRadius = starRadius * (1 + i * 0.5)
      const starGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
      starGlow.addColorStop(0, 'rgba(255, 220, 100, 0.8)')
      starGlow.addColorStop(0.3, 'rgba(255, 200, 50, 0.4)')
      starGlow.addColorStop(0.7, 'rgba(255, 150, 0, 0.2)')
      starGlow.addColorStop(1, 'rgba(255, 100, 0, 0)')
      ctx.fillStyle = starGlow
      ctx.fillRect(centerX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2)
    }
    
    // Draw star core
    const starGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, starRadius)
    starGradient.addColorStop(0, '#ffffff')
    starGradient.addColorStop(0.3, '#ffffcc')
    starGradient.addColorStop(0.7, '#ffcc66')
    starGradient.addColorStop(1, '#ff9933')
    ctx.fillStyle = starGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, starRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw star corona effects
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + animationTime * 0.5
      const x1 = centerX + Math.cos(angle) * starRadius
      const y1 = centerY + Math.sin(angle) * starRadius
      const x2 = centerX + Math.cos(angle) * (starRadius + 20)
      const y2 = centerY + Math.sin(angle) * (starRadius + 20)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
    
    // Draw system name
    ctx.shadowBlur = 4
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(currentSystemData.name.toUpperCase(), centerX, 40)
    ctx.shadowBlur = 0
    
    // Draw orbital rings
    const orbitRadii = [120, 180, 250, 330]
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 10])
    orbitRadii.forEach(radius => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.setLineDash([])
    
    // Draw planets
    currentSystemData.planets.forEach((planet, index) => {
      const orbitRadius = orbitRadii[Math.min(index, orbitRadii.length - 1)]
      const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
      const x = centerX + Math.cos(angle) * orbitRadius
      const y = centerY + Math.sin(angle) * orbitRadius
      
      const isHovered = hoveredPlanet?.id === planet.id
      const isSelected = selectedPlanet?.id === planet.id
      const planetRadius = 15 + (isHovered ? 3 : 0)
      
      // Planet selection/hover glow
      if (isSelected || isHovered) {
        const glowColor = isSelected ? 'rgba(159, 68, 211, 0.5)' : 'rgba(255, 255, 255, 0.3)'
        const glowRadius = planetRadius + 10
        const planetGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
        planetGlow.addColorStop(0, glowColor)
        planetGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = planetGlow
        ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2)
      }
      
      // Draw planet based on type
      const planetColors: Record<string, [string, string]> = {
        'rocky': ['#8B7355', '#5C4A3A'],
        'gas': ['#E4A853', '#B8860B'],
        'ice': ['#B0E0E6', '#4682B4'],
        'volcanic': ['#FF6347', '#8B0000'],
        'ocean': ['#1E90FF', '#000080'],
        'desert': ['#F4A460', '#D2691E'],
        'toxic': ['#9ACD32', '#556B2F']
      }
      
      const [color1, color2] = planetColors[planet.type] || ['#808080', '#404040']
      const planetGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, planetRadius)
      planetGradient.addColorStop(0, color1)
      planetGradient.addColorStop(1, color2)
      
      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(x, y, planetRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw danger indicator
      if (planet.danger > 5) {
        ctx.strokeStyle = `rgba(255, 0, 0, ${planet.danger / 20})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, planetRadius + 5, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Draw fragment indicator
      if (planet.hasFragment) {
        const pulse = Math.sin(animationTime * 4) * 0.5 + 0.5
        ctx.strokeStyle = `rgba(159, 68, 211, ${pulse})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, planetRadius + 8, 0, Math.PI * 2)
        ctx.stroke()
        
        // Signal text
        ctx.fillStyle = '#9f44d3'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('SIGNAL', x, y - planetRadius - 15)
      }
      
      // Draw planet name
      ctx.fillStyle = isHovered ? '#ffffff' : '#c0c0c0'
      ctx.font = isHovered ? 'bold 11px monospace' : '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(planet.name, x, y + planetRadius + 15)
    })
  }
  
  useEffect(() => {
    const generator = new GalaxyGenerator(seed)
    const generatedGalaxy = generator.generateGalaxy()
    setGalaxy(generatedGalaxy)
  }, [seed])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw galaxy background
      drawGalaxyBackground(ctx, canvas.width, canvas.height)
      
      if (viewMode === 'galaxy') {
        // Draw galaxy view
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const hexSize = 30
        
        // Draw connections with gradient
        galaxy.forEach((system) => {
          const from = hexToPixel(system.coordinate, hexSize)
          galaxy.forEach((other) => {
            if (system.id !== other.id) {
              const distance = hexDistance(system.coordinate, other.coordinate)
              if (distance <= 2) {
                const to = hexToPixel(other.coordinate, hexSize)
                
                // Create gradient for connection line
                const gradient = ctx.createLinearGradient(
                  centerX + from.x, centerY + from.y,
                  centerX + to.x, centerY + to.y
                )
                gradient.addColorStop(0, 'rgba(100, 150, 255, 0.15)')
                gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.25)')
                gradient.addColorStop(1, 'rgba(100, 150, 255, 0.15)')
                
                ctx.strokeStyle = gradient
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(centerX + from.x, centerY + from.y)
                ctx.lineTo(centerX + to.x, centerY + to.y)
                ctx.stroke()
              }
            }
          })
        })
        
        // Draw systems
        galaxy.forEach((system) => {
          const pos = hexToPixel(system.coordinate, hexSize)
          const x = centerX + pos.x
          const y = centerY + pos.y
          const isDiscovered = warFog.has(system.id)
          const isCurrent = coordToString(currentSystem) === system.id
          const isHovered = hoveredSystem === system.id
          const isSelected = selectedSystem === system.id
          
          // Draw hex
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            const hx = x + hexSize * Math.cos(angle)
            const hy = y + hexSize * Math.sin(angle)
            if (i === 0) ctx.moveTo(hx, hy)
            else ctx.lineTo(hx, hy)
          }
          ctx.closePath()
          
          // Fill based on state with better space theme
          if (isCurrent) {
            // Glowing cyan for current system
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, hexSize)
            glowGradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)')
            glowGradient.addColorStop(0.7, 'rgba(0, 212, 255, 0.15)')
            glowGradient.addColorStop(1, 'rgba(0, 212, 255, 0.05)')
            ctx.fillStyle = glowGradient
            ctx.fill()
            ctx.strokeStyle = '#00d4ff'
            ctx.lineWidth = 2
            ctx.shadowBlur = 10
            ctx.shadowColor = '#00d4ff'
          } else if (isSelected) {
            // Purple glow for selected
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, hexSize)
            glowGradient.addColorStop(0, 'rgba(159, 68, 211, 0.3)')
            glowGradient.addColorStop(0.7, 'rgba(159, 68, 211, 0.15)')
            glowGradient.addColorStop(1, 'rgba(159, 68, 211, 0.05)')
            ctx.fillStyle = glowGradient
            ctx.fill()
            ctx.strokeStyle = '#9f44d3'
            ctx.lineWidth = 2
            ctx.shadowBlur = 8
            ctx.shadowColor = '#9f44d3'
          } else if (isHovered) {
            // Subtle white glow for hover
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 1
            ctx.shadowBlur = 5
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
          } else if (isDiscovered) {
            // Discovered systems - subtle blue tint
            ctx.fillStyle = 'rgba(50, 100, 150, 0.1)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)'
            ctx.lineWidth = 1
          } else {
            // Undiscovered - very subtle
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(100, 100, 150, 0.15)'
            ctx.lineWidth = 0.5
          }
          ctx.stroke()
          ctx.shadowBlur = 0 // Reset shadow
          
          // Draw system icon
          if (isDiscovered) {
            // Draw star with glow effect
            const starGradient = ctx.createRadialGradient(x, y, 0, x, y, 8)
            if (isCurrent) {
              starGradient.addColorStop(0, '#ffffff')
              starGradient.addColorStop(0.3, '#00d4ff')
              starGradient.addColorStop(0.7, 'rgba(0, 212, 255, 0.3)')
              starGradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
            } else {
              starGradient.addColorStop(0, '#ffffff')
              starGradient.addColorStop(0.3, '#ffcc66')
              starGradient.addColorStop(0.7, 'rgba(255, 204, 102, 0.3)')
              starGradient.addColorStop(1, 'rgba(255, 204, 102, 0)')
            }
            ctx.fillStyle = starGradient
            ctx.fillRect(x - 8, y - 8, 16, 16)
            
            // Draw star core
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fillStyle = '#ffffff'
            ctx.fill()
            
            // Draw star rays (4-pointed star effect)
            ctx.strokeStyle = isCurrent ? 'rgba(0, 212, 255, 0.6)' : 'rgba(255, 204, 102, 0.4)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(x - 8, y)
            ctx.lineTo(x + 8, y)
            ctx.moveTo(x, y - 8)
            ctx.lineTo(x, y + 8)
            ctx.stroke()
            
            // Draw name with subtle glow
            ctx.shadowBlur = 3
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
            ctx.fillStyle = isHovered ? '#ffffff' : '#c0c0c0'
            ctx.font = 'bold 10px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(system.name, x, y + hexSize + 12)
            ctx.shadowBlur = 0
          } else {
            // Draw mysterious undiscovered system
            const mysteryGradient = ctx.createRadialGradient(x, y, 0, x, y, 10)
            mysteryGradient.addColorStop(0, 'rgba(100, 100, 150, 0.3)')
            mysteryGradient.addColorStop(1, 'rgba(100, 100, 150, 0)')
            ctx.fillStyle = mysteryGradient
            ctx.fillRect(x - 10, y - 10, 20, 20)
            
            // Draw question mark with glow
            ctx.shadowBlur = 2
            ctx.shadowColor = 'rgba(100, 100, 150, 0.5)'
            ctx.fillStyle = 'rgba(150, 150, 200, 0.6)'
            ctx.font = 'bold 14px monospace'
            ctx.textAlign = 'center'
            ctx.fillText('?', x, y + 5)
            ctx.shadowBlur = 0
          }
        })
        
        // Draw range indicator with gradient
        if (selectedSystem && selectedSystem !== coordToString(currentSystem)) {
          const from = hexToPixel(currentSystem, hexSize)
          const target = galaxy.get(selectedSystem)
          if (target) {
            const to = hexToPixel(target.coordinate, hexSize)
            const distance = hexDistance(currentSystem, target.coordinate)
            const canReach = distance <= fuel
            
            // Create gradient for the path line
            const pathGradient = ctx.createLinearGradient(
              centerX + from.x, centerY + from.y,
              centerX + to.x, centerY + to.y
            )
            
            if (canReach) {
              // Green gradient for reachable
              pathGradient.addColorStop(0, 'rgba(0, 255, 100, 0.8)')
              pathGradient.addColorStop(0.5, 'rgba(0, 255, 100, 0.6)')
              pathGradient.addColorStop(1, 'rgba(0, 255, 100, 0.4)')
            } else {
              // Red gradient for unreachable
              pathGradient.addColorStop(0, 'rgba(255, 50, 50, 0.8)')
              pathGradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.6)')
              pathGradient.addColorStop(1, 'rgba(255, 50, 50, 0.4)')
            }
            
            // Draw glow effect for the line
            ctx.shadowBlur = 8
            ctx.shadowColor = canReach ? 'rgba(0, 255, 100, 0.5)' : 'rgba(255, 50, 50, 0.5)'
            ctx.strokeStyle = pathGradient
            ctx.lineWidth = 2
            ctx.setLineDash([8, 4])
            ctx.beginPath()
            ctx.moveTo(centerX + from.x, centerY + from.y)
            ctx.lineTo(centerX + to.x, centerY + to.y)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.shadowBlur = 0
            
            // Draw distance indicator at midpoint
            const midX = centerX + (from.x + to.x) / 2
            const midY = centerY + (from.y + to.y) / 2
            
            // Background for text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            ctx.fillRect(midX - 25, midY - 10, 50, 20)
            
            // Distance text
            ctx.fillStyle = canReach ? '#00ff64' : '#ff5050'
            ctx.font = 'bold 11px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(`${Math.ceil(distance)} pc`, midX, midY + 3)
          }
        }
      } else {
        // Draw system view
        drawSystemView(ctx, canvas.width, canvas.height)
      }
    }
    
    draw()
  }, [galaxy, currentSystem, warFog, selectedSystem, hoveredSystem, fuel, viewMode, currentSystemData, selectedPlanet, hoveredPlanet, animationTime])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (viewMode === 'galaxy') {
      // Galaxy view click handling
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const relX = x - centerX
      const relY = y - centerY
      
      // Find clicked system
      let clickedSystem: string | null = null
      galaxy.forEach((system) => {
        const pos = hexToPixel(system.coordinate, 30)
        const distance = Math.sqrt((relX - pos.x) ** 2 + (relY - pos.y) ** 2)
        if (distance < 30) {
          clickedSystem = system.id
        }
      })
      
      if (clickedSystem) {
        if (selectedSystem === clickedSystem) {
          // Double click to travel or enter system
          const target = galaxy.get(clickedSystem)
          if (target) {
            if (clickedSystem === coordToString(currentSystem)) {
              // Enter current system view
              setCurrentSystemData(target)
              setViewMode('system')
            } else {
              // Travel to system
              const distance = hexDistance(currentSystem, target.coordinate)
              if (distance <= fuel) {
                moveToSystem(target.coordinate)
                consumeFuel(Math.ceil(distance))
                setSelectedSystem(null)
                triggerAutoSave()
              }
            }
          }
        } else {
          setSelectedSystem(clickedSystem)
        }
      } else {
        setSelectedSystem(null)
      }
    } else {
      // System view click handling
      if (!currentSystemData) return
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Check if clicked on a planet
      const orbitRadii = [120, 180, 250, 330]
      currentSystemData.planets.forEach((planet, index) => {
        const orbitRadius = orbitRadii[Math.min(index, orbitRadii.length - 1)]
        const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
        const px = centerX + Math.cos(angle) * orbitRadius
        const py = centerY + Math.sin(angle) * orbitRadius
        
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
        if (distance < 20) {
          if (selectedPlanet?.id === planet.id) {
            // Double click to land
            if (hull >= 10) {
              landOnPlanet(planet.id)
            }
          } else {
            setSelectedPlanet(planet)
          }
        }
      })
    }
  }
  
  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Update mouse position for parallax effect
    setMousePos({ 
      x: x / canvas.width - 0.5,
      y: y / canvas.height - 0.5
    })
    
    if (viewMode === 'galaxy') {
      // Galaxy view hover
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const relX = x - centerX
      const relY = y - centerY
      
      let hoveredSys: string | null = null
      galaxy.forEach((system) => {
        const pos = hexToPixel(system.coordinate, 30)
        const distance = Math.sqrt((relX - pos.x) ** 2 + (relY - pos.y) ** 2)
        if (distance < 30) {
          hoveredSys = system.id
        }
      })
      
      setHoveredSystem(hoveredSys)
    } else {
      // System view hover
      if (!currentSystemData) return
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Check hover on planets
      let hoveredPlanetFound: Planet | null = null
      const orbitRadii = [120, 180, 250, 330]
      currentSystemData.planets.forEach((planet, index) => {
        const orbitRadius = orbitRadii[Math.min(index, orbitRadii.length - 1)]
        const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
        const px = centerX + Math.cos(angle) * orbitRadius
        const py = centerY + Math.sin(angle) * orbitRadius
        
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
        if (distance < 20) {
          hoveredPlanetFound = planet
        }
      })
      
      setHoveredPlanet(hoveredPlanetFound)
    }
  }
  
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasClick(e)
  }
  
  // Load current system data when entering system view
  useEffect(() => {
    if (viewMode === 'system' && !currentSystemData) {
      const system = galaxy.get(coordToString(currentSystem))
      if (system) {
        setCurrentSystemData(system)
      }
    }
  }, [viewMode, currentSystemData, galaxy, currentSystem])
  
  const selectedSystemData = selectedSystem ? galaxy.get(selectedSystem) : null
  const travelDistance = selectedSystemData 
    ? hexDistance(currentSystem, selectedSystemData.coordinate)
    : 0
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-700 cursor-pointer"
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleCanvasMove}
      />
      
      {/* View mode toggle */}
      {viewMode === 'system' && (
        <button
          onClick={() => {
            setViewMode('galaxy')
            setSelectedPlanet(null)
            setHoveredPlanet(null)
          }}
          className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-white font-mono text-sm hover:bg-gray-700 border border-gray-600"
        >
          ← BACK TO GALAXY
        </button>
      )}
      
      {/* Galaxy view info panel */}
      {viewMode === 'galaxy' && selectedSystemData && (
        <div className="absolute top-4 right-4 bg-space-gray border border-gray-700 p-4 max-w-xs">
          <h3 className="text-echo-blue font-mono mb-2">{selectedSystemData.name}</h3>
          <p className="text-sm text-gray-400 mb-2">
            Coordinates: [{selectedSystemData.coordinate.q}, {selectedSystemData.coordinate.r}]
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Distance: {travelDistance} parsecs
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Fuel Required: {Math.ceil(travelDistance)}
          </p>
          
          {warFog.has(selectedSystemData.id) && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Planets: {selectedSystemData.planets.length}</p>
              {selectedSystemData.planets.map(planet => (
                <div key={planet.id} className="text-xs text-gray-500 ml-2">
                  • {planet.name} - {planet.type}
                  {planet.hasFragment && (
                    <span className="text-echo-purple ml-1">[SIGNAL]</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {travelDistance > 0 && travelDistance !== 0 && (
            <button
              onClick={() => {
                if (travelDistance <= fuel) {
                  moveToSystem(selectedSystemData.coordinate)
                  consumeFuel(Math.ceil(travelDistance))
                  setSelectedSystem(null)
                }
              }}
              disabled={travelDistance > fuel}
              className={`
                mt-3 w-full px-3 py-2 font-mono text-sm
                ${travelDistance <= fuel 
                  ? 'bg-echo-blue text-black hover:bg-blue-400' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {travelDistance <= fuel ? 'JUMP TO SYSTEM' : 'INSUFFICIENT FUEL'}
            </button>
          )}
          
          {selectedSystemData.id === coordToString(currentSystem) && (
            <button
              onClick={() => {
                setCurrentSystemData(selectedSystemData)
                setViewMode('system')
              }}
              className="mt-3 w-full px-3 py-2 font-mono text-sm bg-echo-purple text-white hover:bg-purple-600"
            >
              ENTER SYSTEM VIEW
            </button>
          )}
        </div>
      )}
      
      {/* System view planet info panel */}
      {viewMode === 'system' && (hoveredPlanet || selectedPlanet) && (
        <div className="absolute top-4 right-4 bg-space-gray border border-gray-700 p-4 max-w-xs">
          {(() => {
            const planet = selectedPlanet || hoveredPlanet
            if (!planet) return null
            
            return (
              <>
                <h3 className="text-echo-purple font-mono mb-2">{planet.name}</h3>
                <p className="text-sm text-gray-400 mb-1">Type: {planet.type}</p>
                <p className="text-sm text-terminal-red mb-2">Danger Level: {planet.danger}/10</p>
                <p className="text-xs text-gray-500 mb-3">{planet.description}</p>
                
                {planet.hasFragment && (
                  <div className="mb-3 p-2 border border-echo-purple bg-purple-900/20">
                    <p className="text-echo-purple text-sm font-bold">FRAGMENT SIGNAL DETECTED</p>
                  </div>
                )}
                
                {selectedPlanet && (
                  <>
                    <button
                      onClick={() => {
                        if (hull >= 10) {
                          landOnPlanet(planet.id)
                        }
                      }}
                      disabled={hull < 10}
                      className={`
                        w-full px-3 py-2 font-mono text-sm
                        ${hull >= 10
                          ? 'bg-echo-blue text-black hover:bg-blue-400' 
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {hull >= 10 ? 'LAND ON PLANET' : 'HULL TOO DAMAGED'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Landing requires 10% hull integrity (costs 1%)
                    </p>
                  </>
                )}
              </>
            )
          })()}
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        {viewMode === 'galaxy' 
          ? 'Click to select • Double-click to jump/enter • Hover for info'
          : 'Click to select planet • Double-click to land • Hover for info'
        }
      </div>
    </div>
  )
}