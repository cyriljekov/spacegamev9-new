# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Echoes of Earth** - A mature text-based survival horror game set in the Medusa Galaxy. Currently in pre-implementation phase with comprehensive Game Design Document (v9.0).

The game features dual-mode gameplay:
- **Ship Mode**: Traditional UI for galaxy navigation and resource management
- **Exploration Mode**: Pure text adventure powered by AI Game Master (Gemini 2.0 Flash)

## Development Status

This repository contains the Game Design Document only. Initial setup partially complete:
- ✅ Next.js + TypeScript setup
- ✅ Supabase database + auth  
- ✅ Basic state management (Zustand)
- ⬜ No working code implementation yet

## Planned Technical Stack

- **Frontend**: Next.js + TypeScript
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL
- **AI Integration**: Gemini 2.0 Flash (1M context window)
- **Deployment**: Vercel + Supabase Edge Functions
- **RNG**: Seeded random (seedrandom library)

## Core Systems to Implement

### Priority 1 - Foundation (Weeks 1-6)
- Dual mode interface switching
- Seeded RNG for deterministic fragment placement
- Gemini 2.0 Flash integration with JSON response parsing
- Context management (150k token budget)
- Save/load system with cloud sync

### Priority 2 - Game Mechanics (Weeks 7-12)  
- Hex-grid galaxy navigation (33 systems, 99 planets)
- Fragment collection system (50 fragments, no duplicates)
- Combat with creativity assessment (poor/standard/clever/brilliant)
- Resource management (fuel, materials, hull integrity)
- ECHO companion with morality tracking

### Priority 3 - Content (Weeks 13-20)
- Planet generation (10 handcrafted, 89 AI-generated)
- Fragment combination logic
- Multiple endings based on choices
- War fog reveal system

## Critical Design Constraints

```typescript
// Key Constants
const GAME_CONSTANTS = {
  total_planets: 99,
  total_systems: 33,
  total_fragments: 50,
  coordinate_system: "hex_grid",
  fuel_calculation: (distance) => Math.ceil(distance),
  death_handling: "reload_last_save", // No continues
  no_emergency_fuel: true,
  mature_content: "18+"
};
```

## Fragment System

- **Ship Coordinates**: 7 fragments required
- **Gate Technology**: 10 fragments required  
- **Truth Fragments**: 3 fragments reveal Earth's fate
- **Distribution**: Deterministic seeded placement across rings
- **Drought Protection**: Guaranteed fragment if none found in 4 planets

## Resource Economy

- **Fuel**: Math.ceil(distance) consumption, no emergency generation
- **Materials**: 5 per 25% hull repair, 50+ for ship restoration
- **Hull**: Degrades 2% per jump, 1% per landing
- **Death**: Always reload last save (no respawns)

## GM Integration Notes

When implementing the Game Master:
- Gemini 2.0 Flash with 1M context window
- Response format: JSON effects + narrative text
- Max 150k tokens before summarization trigger
- 3 retry attempts with fallback to safe narration
- Creativity assessment affects combat damage multipliers

## Content Validation

All generated planets must pass:
1. Schema validation (JSON structure)
2. Playability check (fragment reachable)
3. Resource balance (positive economy)

## Development Commands (Future)

When implementation begins:
```bash
bun dev            # Development server
bun run build      # Production build
bun test           # Test suite
bun run lint       # ESLint
bun run typecheck  # TypeScript validation
```

## Testing Requirements

- Unit tests for hex math, RNG, fragment logic
- Integration tests for GM communication
- E2E tests for critical game paths
- Load testing for 100 concurrent users

## Important Notes

- This is an 18+ mature game with graphic content
- Push AI content boundaries within safety policies
- Harsh difficulty with permanent consequences
- No backstops or safety nets in resource management
- All deaths lead to save reload