'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import { useViewport } from '@/hooks/useViewport'
import { GalaxyGenerator, StarSystem, Planet } from '@/utils/galaxyGenerator'
import { hexToPixel, hexDistance, coordToString } from '@/utils/hexGrid'
import { HexCoordinate } from '@/types/game'
import seedrandom from 'seedrandom'

type ViewMode = 'galaxy' | 'system'

export function GalaxyMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useCanvasSize(containerRef)
  const viewport = useViewport()
  
  const [galaxy, setGalaxy] = useState<Map<string, StarSystem>>(new Map())
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [selectedSystemPosition, setSelectedSystemPosition] = useState<{ x: number, y: number } | null>(null)
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy')
  const [currentSystemData, setCurrentSystemData] = useState<StarSystem | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [selectedPlanetPosition, setSelectedPlanetPosition] = useState<{ x: number, y: number } | null>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null)
  const [animationTime, setAnimationTime] = useState(0)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1.5) // Start zoomed in more
  
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
  
  // Initialize galaxy
  useEffect(() => {
    const generator = new GalaxyGenerator(seed)
    const generatedGalaxy = generator.generateGalaxy()
    setGalaxy(generatedGalaxy)
  }, [seed])
  
  // Animation loop
  useEffect(() => {
    let animId: number
    const animate = () => {
      setAnimationTime(prev => prev + 0.01)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])
  
  // Update selected system position when pan/zoom changes
  useEffect(() => {
    if (selectedSystem && viewMode === 'galaxy') {
      const system = galaxy.get(selectedSystem)
      if (system) {
        const pos = hexToPixel(system.coordinate, getHexSize())
        const screenX = (pos.x * zoomLevel) + canvasSize.width/2 + panOffset.x
        const screenY = (pos.y * zoomLevel) + canvasSize.height/2 + panOffset.y
        setSelectedSystemPosition({ x: screenX, y: screenY })
      }
    }
  }, [panOffset, zoomLevel, selectedSystem, galaxy, canvasSize, viewMode])
  
  // Update selected planet position when pan/zoom/animation changes
  useEffect(() => {
    if (selectedPlanet && currentSystemData && viewMode === 'system') {
      const index = currentSystemData.planets.findIndex(p => p.id === selectedPlanet.id)
      if (index !== -1) {
        const orbitRadius = 120 + index * 80
        const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
        const x = Math.cos(angle) * orbitRadius
        const y = Math.sin(angle) * orbitRadius
        const screenX = (x * zoomLevel) + canvasSize.width/2 + panOffset.x
        const screenY = (y * zoomLevel) + canvasSize.height/2 + panOffset.y
        setSelectedPlanetPosition({ x: screenX, y: screenY })
      }
    }
  }, [panOffset, zoomLevel, selectedPlanet, currentSystemData, canvasSize, viewMode, animationTime])
  
  // Responsive hex size based on viewport - increased sizes
  const getHexSize = () => {
    if (viewport.isMobile) return 35
    if (viewport.isTablet) return 45
    return 55
  }
  
  // Draw galaxy background
  const drawGalaxyBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    gradient.addColorStop(0, 'rgba(10, 15, 30, 1)')
    gradient.addColorStop(0.5, 'rgba(5, 8, 20, 1)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw stars
    const rng = seedrandom(`${seed}-stars`)
    const starCount = Math.floor((width * height) / 5000)
    
    for (let i = 0; i < starCount; i++) {
      const x = rng() * width
      const y = rng() * height
      const size = rng() * 1.5
      const opacity = 0.3 + rng() * 0.7
      
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.fill()
    }
  }
  
  // Draw galaxy view
  const drawGalaxyView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save()
    
    // Apply zoom and pan
    ctx.translate(width/2 + panOffset.x, height/2 + panOffset.y)
    ctx.scale(zoomLevel, zoomLevel)
    
    const hexSize = getHexSize()
    
    // Draw fuel range circle first (behind everything)
    const currentPos = hexToPixel(currentSystem, hexSize)
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.15)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(currentPos.x, currentPos.y, fuel * hexSize * 0.8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw navigation path if system is selected
    if (selectedSystem && selectedSystem !== coordToString(currentSystem)) {
      const targetSystem = galaxy.get(selectedSystem)
      if (targetSystem) {
        const targetPos = hexToPixel(targetSystem.coordinate, hexSize)
        const distance = hexDistance(currentSystem, targetSystem.coordinate)
        const fuelCost = Math.ceil(distance)
        const canReach = fuel >= fuelCost
        
        // Draw path line with gradient
        const pathGradient = ctx.createLinearGradient(
          currentPos.x, currentPos.y,
          targetPos.x, targetPos.y
        )
        
        if (canReach) {
          pathGradient.addColorStop(0, 'rgba(0, 255, 100, 0.8)')
          pathGradient.addColorStop(0.5, 'rgba(0, 255, 100, 0.6)')
          pathGradient.addColorStop(1, 'rgba(0, 255, 100, 0.4)')
          ctx.shadowColor = 'rgba(0, 255, 100, 0.5)'
        } else {
          pathGradient.addColorStop(0, 'rgba(255, 50, 50, 0.8)')
          pathGradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.6)')
          pathGradient.addColorStop(1, 'rgba(255, 50, 50, 0.4)')
          ctx.shadowColor = 'rgba(255, 50, 50, 0.5)'
        }
        
        ctx.shadowBlur = 8
        ctx.strokeStyle = pathGradient
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.beginPath()
        ctx.moveTo(currentPos.x, currentPos.y)
        ctx.lineTo(targetPos.x, targetPos.y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.shadowBlur = 0
        
        // Draw distance indicator at midpoint
        const midX = (currentPos.x + targetPos.x) / 2
        const midY = (currentPos.y + targetPos.y) / 2
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(midX - 35, midY - 12, 70, 24)
        
        // Distance and fuel text
        ctx.fillStyle = canReach ? '#00ff64' : '#ff5050'
        ctx.font = 'bold 11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${fuelCost} FUEL`, midX, midY + 4)
      }
    }
    
    // Draw systems
    galaxy.forEach((system, systemId) => {
      const pos = hexToPixel(system.coordinate, hexSize)
      const isDiscovered = warFog.has(systemId)
      const isCurrent = systemId === coordToString(currentSystem)
      const isSelected = systemId === selectedSystem
      const isHovered = systemId === hoveredSystem
      
      if (isDiscovered || isCurrent) {
        // Draw pulsing ring for current system
        if (isCurrent) {
          const pulse = Math.sin(animationTime * 3) * 0.3 + 0.7
          ctx.strokeStyle = `rgba(0, 212, 255, ${pulse})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 20 + pulse * 5, 0, Math.PI * 2)
          ctx.stroke()
          
          // "YOU ARE HERE" label
          ctx.fillStyle = '#00d4ff'
          ctx.font = 'bold 9px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('CURRENT', pos.x, pos.y - 25)
        }
        
        // Draw discovered system - larger gradient
        const starGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 15)
        starGradient.addColorStop(0, isCurrent ? '#00d4ff' : '#ffcc66')
        starGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = starGradient
        ctx.fillRect(pos.x - 15, pos.y - 15, 30, 30)
        
        // Draw star - bigger
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        
        // Draw name - larger text
        ctx.fillStyle = isHovered ? '#ffffff' : '#c0c0c0'
        ctx.font = `bold ${viewport.isMobile ? '11px' : '13px'} monospace`
        ctx.textAlign = 'center'
        ctx.fillText(system.name, pos.x, pos.y + hexSize + 15)
      } else {
        // Draw undiscovered system as subtle nebula/fog effect
        const nebulaGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20)
        nebulaGradient.addColorStop(0, 'rgba(120, 100, 180, 0.08)')
        nebulaGradient.addColorStop(0.5, 'rgba(100, 80, 160, 0.05)')
        nebulaGradient.addColorStop(1, 'rgba(80, 60, 140, 0)')
        ctx.fillStyle = nebulaGradient
        ctx.fillRect(pos.x - 20, pos.y - 20, 40, 40)
        
        // Draw small mysterious dot with shimmer
        const shimmer = Math.sin(animationTime * 2 + pos.x * 0.01 + pos.y * 0.01) * 0.3 + 0.2
        ctx.fillStyle = `rgba(140, 120, 200, ${shimmer})`
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Add subtle glow
        ctx.strokeStyle = `rgba(140, 120, 200, ${shimmer * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Highlight selected/hovered
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#00d4ff' : '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, hexSize * 0.8, 0, Math.PI * 2)
        ctx.stroke()
        
        // Show fuel cost on hover
        if (isHovered && !isCurrent) {
          const distance = hexDistance(currentSystem, system.coordinate)
          const fuelCost = Math.ceil(distance)
          const canReach = fuel >= fuelCost
          
          // Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
          ctx.fillRect(pos.x - 30, pos.y - 40, 60, 18)
          
          // Fuel cost text
          ctx.fillStyle = canReach ? '#00ff64' : '#ff5050'
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(`${fuelCost} FUEL`, pos.x, pos.y - 27)
        }
      }
    })
    
    ctx.restore()
  }
  
  // Draw system view
  const drawSystemView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentSystemData) return
    
    ctx.save()
    ctx.translate(width/2, height/2)
    ctx.scale(zoomLevel, zoomLevel)
    
    // Draw star - bigger central star
    const pulseScale = 1 + Math.sin(animationTime * 2) * 0.1
    const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80 * pulseScale)
    starGradient.addColorStop(0, '#ffcc66')
    starGradient.addColorStop(0.5, '#ff9933')
    starGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = starGradient
    ctx.fillRect(-80 * pulseScale, -80 * pulseScale, 160 * pulseScale, 160 * pulseScale)
    
    // Draw orbits and planets - larger orbits
    currentSystemData.planets.forEach((planet, index) => {
      const orbitRadius = 120 + index * 80
      const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
      const x = Math.cos(angle) * orbitRadius
      const y = Math.sin(angle) * orbitRadius
      
      // Draw orbit
      ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, orbitRadius, 0, Math.PI * 2)
      ctx.stroke()
      
      // Draw planet - bigger planets
      const planetSize = viewport.isMobile ? 18 : 22
      const planetGradient = ctx.createRadialGradient(x, y, 0, x, y, planetSize)
      planetGradient.addColorStop(0, '#6666ff')
      planetGradient.addColorStop(1, '#333366')
      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(x, y, planetSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw planet name - larger text
      ctx.fillStyle = planet === hoveredPlanet ? '#ffffff' : '#999999'
      ctx.font = `bold ${viewport.isMobile ? '12px' : '14px'} monospace`
      ctx.textAlign = 'center'
      ctx.fillText(planet.name, x, y + planetSize + 20)
      
      // Highlight if has fragment
      if (planet.hasFragment) {
        ctx.strokeStyle = '#9f44d3'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, planetSize + 5, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Highlight selected
      if (planet === selectedPlanet) {
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, planetSize + 8, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
    
    ctx.restore()
  }
  
  // Main draw function
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    // Save the context state
    ctx.save()
    
    // Scale for high DPI
    ctx.scale(canvasSize.scale, canvasSize.scale)
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    
    // Draw background
    drawGalaxyBackground(ctx, canvasSize.width, canvasSize.height)
    
    // Draw based on view mode
    if (viewMode === 'galaxy') {
      drawGalaxyView(ctx, canvasSize.width, canvasSize.height)
    } else {
      drawSystemView(ctx, canvasSize.width, canvasSize.height)
    }
    
    // Restore the context state
    ctx.restore()
  }, [canvasSize, galaxy, viewMode, selectedSystem, hoveredSystem, selectedPlanet, hoveredPlanet, animationTime, panOffset, zoomLevel, viewport])
  
  // Handle canvas interactions
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    // Account for canvas CSS size vs actual size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Convert to canvas coordinates
    const canvasX = (clientX - rect.left) * scaleX / canvasSize.scale
    const canvasY = (clientY - rect.top) * scaleY / canvasSize.scale
    
    // Transform to world coordinates based on view mode
    if (viewMode === 'galaxy') {
      return {
        x: (canvasX - canvasSize.width/2 - panOffset.x) / zoomLevel,
        y: (canvasY - canvasSize.height/2 - panOffset.y) / zoomLevel
      }
    } else {
      // System view coordinates (no pan offset in system view)
      return {
        x: (canvasX - canvasSize.width/2) / zoomLevel,
        y: (canvasY - canvasSize.height/2) / zoomLevel
      }
    }
  }
  
  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoordinates(e)
    console.log('Click coordinates:', coords, 'View mode:', viewMode)
    
    if (viewMode === 'galaxy') {
      // Find clicked system
      let clickedSystem: StarSystem | null = null
      let minDistance = Infinity
      
      galaxy.forEach(system => {
        const pos = hexToPixel(system.coordinate, getHexSize())
        const distance = Math.sqrt((coords.x - pos.x) ** 2 + (coords.y - pos.y) ** 2)
        // Use smaller click radius for more precise selection
        if (distance < 30 && distance < minDistance) {
          minDistance = distance
          clickedSystem = system
        }
      })
      
      if (clickedSystem) {
        console.log('Clicked system:', clickedSystem.name, 'ID:', clickedSystem.id)
        console.log('Previously selected:', selectedSystem, 'In war fog:', warFog.has(clickedSystem.id))
        
        // Calculate screen position for the overlay
        const pos = hexToPixel(clickedSystem.coordinate, getHexSize())
        const screenX = (pos.x * zoomLevel) + canvasSize.width/2 + panOffset.x
        const screenY = (pos.y * zoomLevel) + canvasSize.height/2 + panOffset.y
        
        setSelectedSystem(clickedSystem.id)
        setSelectedSystemPosition({ x: screenX, y: screenY })
        
        // Double-click/tap to view system (not travel)
        if (selectedSystem === clickedSystem.id) {
          const distance = hexDistance(currentSystem, clickedSystem.coordinate)
          if (distance === 0) {
            // Already at this system, just view it
            setViewMode('system')
            setCurrentSystemData(clickedSystem)
          }
        }
      } else {
        console.log('No system found at click position')
        setSelectedSystem(null)
        setSelectedSystemPosition(null)
      }
    } else {
      // System view - select planet
      if (!currentSystemData) return
      
      currentSystemData.planets.forEach((planet, index) => {
        // Use same orbital radius as drawing function
        const orbitRadius = 120 + index * 80
        const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
        const x = Math.cos(angle) * orbitRadius
        const y = Math.sin(angle) * orbitRadius
        
        const distance = Math.sqrt((coords.x - x) ** 2 + (coords.y - y) ** 2)
        // Larger click radius for planets
        if (distance < 30) {
          // Calculate screen position for the overlay
          const screenX = (x * zoomLevel) + canvasSize.width/2 + panOffset.x
          const screenY = (y * zoomLevel) + canvasSize.height/2 + panOffset.y
          
          setSelectedPlanet(planet)
          setSelectedPlanetPosition({ x: screenX, y: screenY })
          
          // Double-click/tap to land
          if (selectedPlanet === planet) {
            landOnPlanet(planet.id)
            setSelectedPlanet(null)
            setSelectedPlanetPosition(null)
          }
        }
      })
    }
  }
  
  // Touch gesture handling
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || e.touches.length !== 1) return
    
    const deltaX = e.touches[0].clientX - touchStart.x
    const deltaY = e.touches[0].clientY - touchStart.y
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }
  
  // Handle mouse drag for panning
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle mouse or Shift+Left click
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      e.preventDefault()
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }
  
  const handleMouseMoveWithDrag = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else {
      handleMouseMove(e)
    }
  }
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoomLevel(prev => Math.max(0.8, Math.min(4, prev * delta)))
  }
  
  // Handle mouse move for hover states
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e)
    
    if (viewMode === 'galaxy') {
      // Find hovered system
      let newHoveredSystem: string | null = null
      let minDistance = Infinity
      
      galaxy.forEach(system => {
        const pos = hexToPixel(system.coordinate, getHexSize())
        const distance = Math.sqrt((coords.x - pos.x) ** 2 + (coords.y - pos.y) ** 2)
        if (distance < 30 && distance < minDistance) {
          minDistance = distance
          newHoveredSystem = system.id
        }
      })
      
      setHoveredSystem(newHoveredSystem)
    } else if (viewMode === 'system' && currentSystemData) {
      // Find hovered planet
      let newHoveredPlanet: Planet | null = null
      
      currentSystemData.planets.forEach((planet, index) => {
        const orbitRadius = 120 + index * 80
        const angle = (Math.PI * 2 / currentSystemData.planets.length) * index + animationTime * (0.2 / (index + 1))
        const x = Math.cos(angle) * orbitRadius
        const y = Math.sin(angle) * orbitRadius
        const distance = Math.sqrt((coords.x - x) ** 2 + (coords.y - y) ** 2)
        
        if (distance < 30) {
          newHoveredPlanet = planet
        }
      })
      
      setHoveredPlanet(newHoveredPlanet)
    }
  }
  
  const handleMouseLeave = () => {
    setHoveredSystem(null)
    setHoveredPlanet(null)
  }
  
  return (
    <div ref={containerRef} className="absolute inset-0 bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasSize.width * canvasSize.scale}
        height={canvasSize.height * canvasSize.scale}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`
        }}
        className="cursor-pointer"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMoveWithDrag}
        onMouseLeave={() => {
          handleMouseLeave()
          handleMouseUp()
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleCanvasClick}
        onWheel={handleWheel}
      />
      
      {/* Mobile controls */}
      {viewport.isMobile && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setZoomLevel(prev => Math.min(3, prev * 1.2))}
            className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm text-white rounded-full text-lg border border-gray-600/30"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev * 0.8))}
            className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm text-white rounded-full text-lg border border-gray-600/30"
          >
            -
          </button>
        </div>
      )}
      
      {/* Navigation hint */}
      {!viewport.isMobile && viewMode === 'galaxy' && (
        <div className="absolute bottom-4 left-4 text-[10px] text-gray-500/50 font-mono space-y-1">
          <div>SCROLL: Zoom</div>
          <div>SHIFT+DRAG: Pan</div>
        </div>
      )}
      
      {/* Back button for system view */}
      {viewMode === 'system' && (
        <button
          onClick={() => {
            setViewMode('galaxy')
            setSelectedPlanet(null)
            setSelectedPlanetPosition(null)
            setHoveredPlanet(null)
          }}
          className="absolute top-20 left-4 z-10 px-3 py-2 bg-gray-800/80 backdrop-blur-sm text-white font-mono text-xs sm:text-sm hover:bg-gray-700/80 border border-gray-600/30 rounded-lg"
        >
          ← {viewport.isMobile ? 'BACK' : 'BACK TO GALAXY'}
        </button>
      )}
      
      {/* Floating System Info Overlay - Ultra-thin design */}
      {selectedSystem && selectedSystemPosition && viewMode === 'galaxy' && (() => {
        const system = galaxy.get(selectedSystem)
        if (!system) return null
        const distance = hexDistance(currentSystem, system.coordinate)
        const fuelCost = Math.ceil(distance)
        const canTravel = fuel >= fuelCost && distance > 0
        const isCurrentSystem = distance === 0
        
        // Adjust position to keep overlay on screen
        let adjustedX = selectedSystemPosition.x
        let adjustedY = selectedSystemPosition.y
        const margin = 120 // Keep this much space from edges
        
        // Clamp to screen bounds
        adjustedX = Math.max(margin, Math.min(canvasSize.width - margin, adjustedX))
        adjustedY = Math.max(margin, Math.min(canvasSize.height - margin, adjustedY))
        
        return (
          <div 
            className="absolute pointer-events-none transition-all duration-300 ease-out z-20"
            style={{
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Pulse animation ring */}
            <div className="absolute inset-0 -inset-[40px] animate-pulse">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30" />
            </div>
            
            {/* Main overlay container */}
            <div className="relative pointer-events-auto">
              {/* Glass card with ultra-thin design */}
              <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-4 min-w-[200px] shadow-2xl shadow-cyan-400/10">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-400/5 to-transparent" />
                
                {/* Content */}
                <div className="relative space-y-2">
                  {/* System name */}
                  <h3 className="text-cyan-300 font-mono text-sm font-medium tracking-wide">
                    {system.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Distance</span>
                      <span className="text-xs text-white font-mono">{distance} pc</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Fuel Cost</span>
                      <span className={`text-xs font-mono ${
                        isCurrentSystem ? 'text-gray-400' : 
                        canTravel ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isCurrentSystem ? '-' : fuelCost}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  {isCurrentSystem ? (
                    <button
                      onClick={() => {
                        setViewMode('system')
                        setCurrentSystemData(system)
                      }}
                      className="w-full mt-2 px-3 py-1.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 font-mono text-xs rounded-lg transition-all"
                    >
                      VIEW SYSTEM
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canTravel) {
                          moveToSystem(system.coordinate)
                          consumeFuel(fuelCost)
                          setViewMode('system')
                          setCurrentSystemData(system)
                          triggerAutoSave()
                          setSelectedSystem(null)
                          setSelectedSystemPosition(null)
                        }
                      }}
                      disabled={!canTravel}
                      className={`w-full mt-2 px-3 py-1.5 font-mono text-xs rounded-lg transition-all ${
                        canTravel 
                          ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20 hover:from-cyan-400/30 hover:to-blue-400/30 border border-cyan-400/40 text-cyan-300' 
                          : 'bg-red-900/20 border border-red-400/20 text-red-400/50 cursor-not-allowed'
                      }`}
                    >
                      {canTravel ? 'TRAVEL →' : 'INSUFFICIENT FUEL'}
                    </button>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => {
                    setSelectedSystem(null)
                    setSelectedSystemPosition(null)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 border border-cyan-400/20 rounded-full flex items-center justify-center text-cyan-400/60 hover:text-cyan-400 hover:border-cyan-400/40 transition-all"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
              
              {/* Connecting line to system */}
              <div className="absolute top-full left-1/2 w-px h-8 bg-gradient-to-b from-cyan-400/20 to-transparent transform -translate-x-1/2" />
            </div>
          </div>
        )
      })()}
      
      {/* Floating Planet Info Overlay - Ultra-thin design */}
      {selectedPlanet && selectedPlanetPosition && viewMode === 'system' && (() => {
        // Adjust position to keep overlay on screen
        let adjustedX = selectedPlanetPosition.x
        let adjustedY = selectedPlanetPosition.y
        const margin = 120
        
        adjustedX = Math.max(margin, Math.min(canvasSize.width - margin, adjustedX))
        adjustedY = Math.max(margin, Math.min(canvasSize.height - margin, adjustedY))
        
        return (
          <div 
            className="absolute pointer-events-none transition-all duration-300 ease-out z-20"
            style={{
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
              transform: 'translate(-50%, -120%)' // Position above planet
            }}
          >
            {/* Pulse animation ring */}
            <div className="absolute inset-0 -inset-[30px] animate-pulse pointer-events-none">
              <div className="absolute inset-0 rounded-full border-2 border-purple-400/20" />
            </div>
            
            {/* Main overlay container */}
            <div className="relative pointer-events-auto">
              {/* Glass card with ultra-thin design */}
              <div className="relative bg-black/60 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-4 min-w-[180px] shadow-2xl shadow-purple-400/10">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-400/5 to-transparent" />
                
                {/* Content */}
                <div className="relative space-y-2">
                  {/* Planet name */}
                  <h3 className="text-purple-300 font-mono text-sm font-medium tracking-wide">
                    {selectedPlanet.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Type</span>
                      <span className="text-xs text-white font-mono">{selectedPlanet.type}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Danger</span>
                      <span className={`text-xs font-mono ${
                        selectedPlanet.danger <= 3 ? 'text-green-400' : 
                        selectedPlanet.danger <= 6 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {selectedPlanet.danger}/10
                      </span>
                    </div>
                  </div>
                  
                  {/* Fragment indicator */}
                  {selectedPlanet.hasFragment && (
                    <div className="mt-2 p-1.5 bg-purple-400/10 border border-purple-400/30 rounded-lg">
                      <p className="text-[10px] text-purple-300 text-center font-mono uppercase tracking-wider">
                        Fragment Detected
                      </p>
                    </div>
                  )}
                  
                  {/* Land button */}
                  <button
                    onClick={() => {
                      landOnPlanet(selectedPlanet.id)
                      setSelectedPlanet(null)
                      setSelectedPlanetPosition(null)
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-400/20 to-pink-400/20 hover:from-purple-400/30 hover:to-pink-400/30 border border-purple-400/40 text-purple-300 font-mono text-xs rounded-lg transition-all"
                  >
                    EXPLORE →
                  </button>
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => {
                    setSelectedPlanet(null)
                    setSelectedPlanetPosition(null)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 border border-purple-400/20 rounded-full flex items-center justify-center text-purple-400/60 hover:text-purple-400 hover:border-purple-400/40 transition-all"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
              
              {/* Connecting line to planet */}
              <div className="absolute top-full left-1/2 w-px h-6 bg-gradient-to-b from-purple-400/20 to-transparent transform -translate-x-1/2" />
            </div>
          </div>
        )
      })()}
    </div>
  )
}