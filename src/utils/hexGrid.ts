import { HexCoordinate } from '@/types/game'

export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ]
  return directions.map(d => ({ q: hex.q + d.q, r: hex.r + d.r }))
}

export function hexToPixel(hex: HexCoordinate, size: number): { x: number, y: number } {
  const x = size * (3/2 * hex.q)
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r)
  return { x, y }
}

export function pixelToHex(x: number, y: number, size: number): HexCoordinate {
  const q = (2/3 * x) / size
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size
  return hexRound({ q, r })
}

export function hexRound(hex: { q: number, r: number }): HexCoordinate {
  const s = -hex.q - hex.r
  let rq = Math.round(hex.q)
  let rr = Math.round(hex.r)
  const rs = Math.round(s)
  
  const q_diff = Math.abs(rq - hex.q)
  const r_diff = Math.abs(rr - hex.r)
  const s_diff = Math.abs(rs - s)
  
  if (q_diff > r_diff && q_diff > s_diff) {
    rq = -rr - rs
  } else if (r_diff > s_diff) {
    rr = -rq - rs
  }
  
  return { q: rq, r: rr }
}

export function coordToString(coord: HexCoordinate): string {
  return `${coord.q},${coord.r}`
}

export function stringToCoord(str: string): HexCoordinate {
  const [q, r] = str.split(',').map(Number)
  return { q, r }
}

export function getRing(coord: HexCoordinate): number {
  const distance = hexDistance({ q: 0, r: 0 }, coord)
  if (distance <= 2) return 1 // Inner ring
  if (distance <= 4) return 2 // Middle ring
  return 3 // Outer ring
}