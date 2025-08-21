# Echoes of Earth - Development Plan v1.0

## Overview
This document provides a comprehensive 20-week development plan for **Echoes of Earth**, a mature text-based survival horror game set in the Medusa Galaxy. The plan includes detailed implementation steps, validation criteria, and integration with Supabase best practices.

## Project Summary
- **Total Development Time:** 20 weeks
- **Technology Stack:** Next.js 15+, TypeScript, Supabase, Zustand, Gemini 2.0 Flash
- **Target:** 99 planets, 50 fragments, dual-mode gameplay
- **Platform:** Progressive Web App (Desktop & Mobile)
- **Distribution:** itch.io ($10-15) + PWA install

---

## Phase 1: Foundation & Infrastructure (Weeks 1-2)

### 1.1 Project Setup & Supabase Configuration

#### Tasks
- [ ] Initialize Next.js 15+ with TypeScript and App Router
- [ ] Configure PWA with next-pwa plugin
- [ ] Create Supabase project via dashboard
- [ ] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zustand`, `seedrandom`, `next-pwa`
- [ ] Configure environment variables in `.env.local`
- [ ] Setup Supabase CLI for local development
- [ ] Initialize database migrations folder
- [ ] Configure Bun/npm scripts for dev, build, test
- [ ] Setup ESLint, Prettier, and TypeScript configs
- [ ] Create manifest.json for PWA
- [ ] Setup service worker for offline capability
- [ ] Configure app icons and splash screens

#### PWA Configuration (Online-Only)
```typescript
// next.config.js
import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Only cache static assets, not API responses
  runtimeCaching: [
    {
      // Cache static assets only
      urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      // DO NOT cache Supabase API calls - always require network
      urlPattern: /^https:.*\.supabase\.co\/.*/i,
      handler: 'NetworkOnly'
    },
    {
      // DO NOT cache Gemini API calls - always require network
      urlPattern: /^https:.*\.googleapis\.com\/.*/i,
      handler: 'NetworkOnly'
    }
  ],
  // Custom worker with connection check
  swSrc: 'public/sw-custom.js'
})

export default nextConfig
```

#### Custom Service Worker (Connection Required)
```javascript
// public/sw-custom.js
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // For API requests, always require network
  if (request.url.includes('supabase.co') || 
      request.url.includes('googleapis.com') ||
      request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return error response if offline
        return new Response(
          JSON.stringify({ 
            error: 'Internet connection required',
            offline: true 
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    return
  }
  
  // For static assets, use cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request)
      })
    )
  }
})
```

#### Connection Required Component
```typescript
// components/ConnectionRequired.tsx
'use client'
import { useEffect, useState } from 'react'

export function ConnectionRequired({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [checking, setChecking] = useState(false)
  
  useEffect(() => {
    const checkConnection = async () => {
      setChecking(true)
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-store'
        })
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
      setChecking(false)
    }
    
    // Initial check
    checkConnection()
    
    // Event listeners
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
    
    // Periodic check
    const interval = setInterval(checkConnection, 10000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])
  
  if (!isOnline) {
    return (
      <div className="connection-lost">
        <div className="connection-message">
          <h1>Connection Lost</h1>
          <p>Echoes of Earth requires an internet connection to play.</p>
          <p>The Medusa Galaxy awaits your return...</p>
          {checking && <p>Checking connection...</p>}
          <button onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}
```

#### Web App Manifest
```json
// public/manifest.json
{
  "name": "Echoes of Earth",
  "short_name": "EoE",
  "description": "A mature text-based survival horror game in the Medusa Galaxy",
  "theme_color": "#0d0d0d",
  "background_color": "#0a0a0a",
  "display": "standalone",
  "orientation": "any",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["games", "entertainment"],
  "screenshots": [
    {
      "src": "/screenshots/galaxy-map.png",
      "type": "image/png",
      "sizes": "1280x720"
    },
    {
      "src": "/screenshots/exploration.png",
      "type": "image/png",
      "sizes": "1280x720"
    }
  ]
}
```

#### Supabase Documentation Checks
- 📚 Review: [Next.js Setup Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- 📚 Check: Latest @supabase/ssr patterns for App Router
- 📚 Study: [Authentication Best Practices](https://supabase.com/docs/guides/auth)
- 📚 Review: PWA best practices for gaming applications

#### Validation Criteria
✅ `bun dev` runs without errors  
✅ Supabase client connects successfully  
✅ Anonymous auth working  
✅ Environment variables properly configured  
✅ TypeScript compiles without errors
✅ PWA installable on desktop and mobile
✅ Service worker caches static assets only
✅ Game blocks properly when offline
✅ Connection required message displays correctly

### 1.2 Mobile Optimization & Connection Management

#### Tasks
- [ ] Implement online connection requirement
- [ ] Create connection lost UI
- [ ] Add mobile touch controls
- [ ] Implement responsive layouts
- [ ] Setup connection monitoring
- [ ] Add reconnection handling

#### Connection Management
```typescript
// services/connectionService.ts
export class ConnectionService {
  private isOnline: boolean = navigator.onLine
  private connectionCheckInterval: NodeJS.Timeout | null = null
  
  init(onConnectionLost: () => void, onConnectionRestored: () => void) {
    // Monitor connection status
    window.addEventListener('online', () => {
      this.isOnline = true
      onConnectionRestored()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      onConnectionLost()
    })
    
    // Periodic connection check for Supabase/Gemini
    this.connectionCheckInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-store' 
        })
        
        if (!response.ok && this.isOnline) {
          this.isOnline = false
          onConnectionLost()
        } else if (response.ok && !this.isOnline) {
          this.isOnline = true
          onConnectionRestored()
        }
      } catch (error) {
        if (this.isOnline) {
          this.isOnline = false
          onConnectionLost()
        }
      }
    }, 5000) // Check every 5 seconds
  }
  
  cleanup() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
    }
  }
  
  requireConnection(): boolean {
    if (!this.isOnline) {
      throw new Error('Internet connection required to play Echoes of Earth')
    }
    return true
  }
}
```

#### Mobile-First Responsive Design
```css
/* styles/responsive.css */
:root {
  --mobile-breakpoint: 768px;
  --tablet-breakpoint: 1024px;
}

/* Mobile-first approach */
.game-container {
  width: 100%;
  padding: 1rem;
}

/* Touch-friendly buttons */
.command-button {
  min-height: 44px; /* iOS recommendation */
  min-width: 44px;
  padding: 12px 20px;
  touch-action: manipulation; /* Prevent zoom on double-tap */
}

/* Responsive terminal */
.exploration-terminal {
  height: 100vh;
  font-size: 14px;
}

@media (min-width: 768px) {
  .exploration-terminal {
    height: 80vh;
    font-size: 16px;
  }
}

/* Galaxy map responsiveness */
.galaxy-map {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
}

/* Mobile virtual keyboard handling */
.input-container {
  position: fixed;
  bottom: env(safe-area-inset-bottom, 0);
  width: 100%;
}
```

#### Validation Criteria
✅ Connection monitoring works properly
✅ Game blocks when offline
✅ Reconnection handled gracefully  
✅ Touch controls responsive on mobile
✅ UI adapts to all screen sizes
✅ Virtual keyboard doesn't obscure input

### 1.3 Core Type System & Constants

#### Tasks
- [ ] Create `types/game.ts` with all interfaces
- [ ] Define `constants/config.ts` with SYSTEM_CONFIG
- [ ] Implement hex coordinate system in `utils/hex.ts`
- [ ] Setup seeded RNG with seedrandom in `utils/rng.ts`
- [ ] Create fragment types and validation schemas
- [ ] Add inventory system types

#### Code Structure
```typescript
// types/game.ts
export interface GameState {
  mode: 'ship' | 'exploration';
  currentSystem: HexCoordinate;
  currentPlanet: string | null;
  warFog: Set<string>;
  fuel: number;
  materials: number;
  hull: number;
  health: number;
  status: Set<'wounded' | 'bleeding' | 'infected'>;
  inventory: Inventory;
  fragments: {
    ship: Set<string>;
    gate: Set<string>;
    truth: Set<string>;
  };
  echoStage: string;
  echoMorality: number;
  rng: SeededRandom;
}

export interface Inventory {
  weapons: WeaponType[];
  currentWeapon: WeaponType;
  items: string[];
  maxSlots: number;
}

// constants/config.ts
export const SYSTEM_CONFIG = {
  total_planets: 99,
  total_systems: 33,
  coordinate_system: "hex_grid",
  fuel_calculation: (distance: number) => Math.ceil(distance),
  death_handling: "reload_last_save",
  no_emergency_fuel: true,
  mature_content: "18+"
};
```

#### Validation Criteria
✅ All types compile without errors  
✅ Hex distance calculations accurate  
✅ Seeded RNG produces deterministic results  
✅ Constants properly exported and typed

---

## Phase 2: Database Schema & Security (Week 3)

### 2.1 Database Schema Design

#### Tasks
- [ ] Create initial migration for core tables
- [ ] Setup UUID generation extension
- [ ] Design optimized JSONB columns
- [ ] Add proper indexes for performance
- [ ] Create database functions for complex operations

#### SQL Schema
```sql
-- migrations/001_initial_schema.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core game state
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    current_system TEXT NOT NULL,
    current_planet TEXT,
    system_coordinates JSONB NOT NULL,
    fuel INTEGER DEFAULT 10,
    materials INTEGER DEFAULT 5,
    hull_integrity INTEGER DEFAULT 100,
    player_health INTEGER DEFAULT 100,
    player_status JSONB DEFAULT '[]',
    echo_stage TEXT DEFAULT 'professional',
    echo_morality INTEGER DEFAULT 0,
    war_fog JSONB DEFAULT '{}',
    seed INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fragment collection (with duplicate prevention)
CREATE TABLE fragments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_state_id UUID REFERENCES game_states ON DELETE CASCADE,
    fragment_id TEXT NOT NULL,
    fragment_type TEXT NOT NULL CHECK (fragment_type IN ('ship', 'gate', 'truth')),
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    discovered_location TEXT,
    combined BOOLEAN DEFAULT FALSE,
    UNIQUE(game_state_id, fragment_id) -- Prevents duplicates
);

-- Location memory
CREATE TABLE location_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_state_id UUID REFERENCES game_states ON DELETE CASCADE,
    system_name TEXT NOT NULL,
    planet_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    permanent_state JSONB DEFAULT '{}',
    items_taken JSONB DEFAULT '[]',
    enemies_defeated JSONB DEFAULT '[]',
    last_visited TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_state_id, system_name, planet_name, location_name)
);

-- Save system
CREATE TABLE save_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users,
    game_state_id UUID REFERENCES game_states,
    save_type TEXT CHECK (save_type IN ('auto', 'manual', 'checkpoint')),
    save_data JSONB NOT NULL,
    content_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game logs and telemetry
CREATE TABLE game_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_state_id UUID REFERENCES game_states,
    log_type TEXT NOT NULL,
    turn_id UUID,
    input TEXT,
    output TEXT,
    gm_response JSONB,
    creativity_score TEXT,
    metadata JSONB,
    tokens_in INTEGER,
    tokens_out INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_game_states_user_id ON game_states(user_id);
CREATE INDEX idx_fragments_lookup ON fragments(game_state_id, fragment_id);
CREATE INDEX idx_location_states_compound ON location_states(game_state_id, system_name, planet_name);
CREATE INDEX idx_save_games_user ON save_games(user_id, created_at DESC);
CREATE INDEX idx_game_logs_state ON game_logs(game_state_id, created_at DESC);
```

#### Supabase MCP Commands
```bash
# Apply migration
mcp__supabase__apply_migration(
  name: "initial_schema",
  query: <above SQL>
)

# Check for issues
mcp__supabase__get_advisors(type: "performance")
mcp__supabase__get_advisors(type: "security")
```

#### Validation Criteria
✅ All tables created successfully  
✅ Indexes improve query performance  
✅ No security advisor warnings  
✅ Unique constraints prevent duplicates

### 2.2 Row Level Security Implementation

#### Tasks
- [ ] Enable RLS on all game tables
- [ ] Create policies for user data isolation
- [ ] Test policy effectiveness
- [ ] Setup service role for admin operations

#### RLS Policies
```sql
-- migrations/002_row_level_security.sql

-- Enable RLS on all tables
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- Game states policies
CREATE POLICY "Users can view own game states" ON game_states
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own game states" ON game_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game states" ON game_states
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own game states" ON game_states
    FOR DELETE USING (auth.uid() = user_id);

-- Fragments policies
CREATE POLICY "Users can manage own fragments" ON fragments
    FOR ALL USING (
        game_state_id IN (
            SELECT id FROM game_states WHERE user_id = auth.uid()
        )
    );

-- Location states policies
CREATE POLICY "Users can manage own location states" ON location_states
    FOR ALL USING (
        game_state_id IN (
            SELECT id FROM game_states WHERE user_id = auth.uid()
        )
    );

-- Save games policies
CREATE POLICY "Users can manage own saves" ON save_games
    FOR ALL USING (auth.uid() = user_id);

-- Game logs policies
CREATE POLICY "Users can manage own logs" ON game_logs
    FOR ALL USING (
        game_state_id IN (
            SELECT id FROM game_states WHERE user_id = auth.uid()
        )
    );
```

#### Validation Criteria
✅ RLS enabled on all tables  
✅ Users cannot access other players' data  
✅ Policies tested with different user contexts  
✅ Service role can bypass RLS when needed

---

## Phase 3: Dual Mode Interface (Weeks 4-5)

### 3.1 Ship Mode UI

#### Tasks
- [ ] Create galaxy map component with hex grid
- [ ] Implement war fog system
- [ ] Build resource status displays
- [ ] Create fragment assembly interface
- [ ] Add system selection and navigation

#### Component Structure
```typescript
// components/ship-mode/GalaxyMap.tsx
export function GalaxyMap() {
  // Hex grid rendering
  // War fog overlay
  // System selection
  // Distance calculation
  // Fuel cost preview
}

// components/ship-mode/ResourcePanel.tsx
export function ResourcePanel() {
  // Fuel gauge
  // Materials counter
  // Hull integrity bar
  // Health status
}

// components/ship-mode/FragmentLab.tsx
export function FragmentLab() {
  // Fragment collection display
  // Combination attempts
  // Progress indicators
}
```

#### Validation Criteria
✅ Galaxy map renders 33 systems correctly  
✅ War fog reveals/hides systems properly  
✅ Resource displays update in real-time  
✅ Fragment assembly UI intuitive

### 3.2 Exploration Mode UI (Mobile-First)

#### Tasks
- [ ] Create terminal-style text interface
- [ ] Implement scrolling text display with touch support
- [ ] Add input field with command parsing
- [ ] Color-code text by speaker type
- [ ] Add quick command buttons for mobile
- [ ] Implement swipe gestures for commands
- [ ] Add haptic feedback for actions

#### Component Structure
```typescript
// components/exploration-mode/Terminal.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

export function Terminal() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile('ontouchstart' in window)
  }, [])
  
  // Touch gesture handlers
  const handlers = useSwipeable({
    onSwipedUp: () => scrollToBottom(),
    onSwipedLeft: () => showQuickCommands(),
    preventScrollOnSwipe: true,
    trackMouse: false
  })
  
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Short haptic feedback
    }
  }
  
  return (
    <div className="terminal-container" {...handlers}>
      <div ref={scrollRef} className="terminal-output">
        {/* Text history with color coding */}
      </div>
      
      {isMobile && (
        <div className="quick-commands">
          <button onClick={() => sendCommand('/inventory')}>INV</button>
          <button onClick={() => sendCommand('/health')}>HP</button>
          <button onClick={() => sendCommand('/map')}>MAP</button>
          <button onClick={() => sendCommand('/return')}>SHIP</button>
        </div>
      )}
      
      <div className="terminal-input">
        <input 
          type="text"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>
    </div>
  )
}

// styles/terminal.module.css
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100dvh; /* Dynamic viewport height for mobile */
  background: var(--bg-terminal);
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  font-size: clamp(14px, 2.5vw, 16px); /* Responsive font size */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.quick-commands {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.quick-commands button {
  flex: 1;
  padding: 0.75rem;
  min-height: 44px;
  font-size: 12px;
  font-weight: bold;
  touch-action: manipulation;
}

.terminal-input {
  padding: 1rem;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

.terminal-input input {
  width: 100%;
  padding: 0.75rem;
  font-size: 16px; /* Prevents zoom on iOS */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--gm-green);
}

/* Desktop enhancements */
@media (min-width: 768px) {
  .quick-commands {
    display: none; /* Hide mobile controls on desktop */
  }
  
  .terminal-output {
    font-size: 16px;
    padding: 2rem;
  }
}
```

#### Validation Criteria
✅ Text renders with correct colors  
✅ Input accepts and processes commands  
✅ Scrolling smooth with touch support  
✅ Mobile quick commands accessible
✅ Haptic feedback on mobile actions
✅ Virtual keyboard handling proper
✅ Landscape and portrait modes work

---

## Phase 4: Game Master System (Weeks 6-7)

### 4.1 Mock GM for Testing

#### Tasks
- [ ] Create mock GM responses for all scenarios
- [ ] Implement JSON response parser
- [ ] Build effects application system
- [ ] Add creativity assessment logic
- [ ] Create fallback responses

#### Mock System
```typescript
// services/mockGM.ts
export class MockGM {
  async processInput(input: string, context: GameContext): Promise<GMResponse> {
    // Parse input
    // Generate appropriate mock response
    // Include random creativity assessment
    // Return structured response
  }
}
```

#### Validation Criteria
✅ Mock responses cover all game scenarios  
✅ JSON parsing handles all response types  
✅ Effects apply correctly to game state  
✅ Creativity assessment affects damage

### 4.2 Gemini Integration & Edge Functions

#### Tasks
- [ ] Create game-master Edge Function
- [ ] Implement Gemini 2.0 Flash API integration
- [ ] Add retry logic (3 attempts)
- [ ] Build context management (150k tokens)
- [ ] Setup response validation

#### Edge Function Implementation
```typescript
// supabase/functions/game-master/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const MAX_RETRIES = 3
const MAX_CONTEXT_TOKENS = 200000  // 20% of 1M context window

serve(async (req: Request) => {
  try {
    // 1. Verify authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )
    
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)
    
    if (error || !user) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // 2. Parse request
    const { gameStateId, playerInput } = await req.json()
    
    // 3. Build context
    const context = await buildGameContext(supabaseClient, gameStateId)
    
    // 4. Call Gemini with retry
    let response = null
    let attempts = 0
    
    while (attempts < MAX_RETRIES && !response) {
      try {
        response = await callGemini(context, playerInput)
      } catch (error) {
        attempts++
        if (attempts === MAX_RETRIES) {
          response = getFallbackResponse(playerInput)
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // 5. Validate and save response
    const validated = validateGMResponse(response)
    await saveGameLog(supabaseClient, gameStateId, playerInput, validated)
    
    return new Response(JSON.stringify(validated), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function callGemini(context: GameContext, input: string) {
  const prompt = buildPrompt(context, input)
  
  // Check token count and summarize if needed
  if (estimateTokens(prompt) > MAX_CONTEXT_TOKENS) {
    context = await summarizeContext(context)
  }
  
  // Call Gemini API (using v1beta for latest features)
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
        topK: 40
      }
    })
  })
  
  return await response.json()
}

// Session Summary System
async function summarizeContext(context: GameContext): Promise<GameContext> {
  const summaryPrompt = `
    Summarize the following game session into key bullet points:
    - Major events and discoveries
    - Combat encounters and outcomes
    - Fragments found
    - Important NPC interactions
    - Player choices and consequences
    
    Keep only essential information for continuity.
    Maximum 5000 tokens.
    
    Session data: ${JSON.stringify(context.recentExchanges)}
  `
  
  const summary = await callGemini({ ...context, recentExchanges: [] }, summaryPrompt)
  
  return {
    ...context,
    sessionSummary: summary.text,
    recentExchanges: context.recentExchanges.slice(-10) // Keep last 10 exchanges
  }
}

// Context Budget Management
const CONTEXT_BUDGET = {
  maxContextTokens: 200000,  // 20% of 1M
  structure: {
    systemPrompt: 1000,
    planetData: 2000,
    locationMemory: 1000,
    playerState: 500,
    recentExchanges: 15000,
    sessionSummary: 5000,
    buffer: 176500  // Huge safety margin
  },
  triggers: {
    exchangeCount: 30,
    tokenCount: 150000,
    sceneChange: true
  }
}
```

#### Supabase MCP Commands
```bash
# Deploy Edge Function
mcp__supabase__deploy_edge_function(
  name: "game-master",
  files: [{ name: "index.ts", content: <above code> }]
)

# Monitor performance
mcp__supabase__get_logs(service: "edge-function")
```

#### Validation Criteria
✅ Edge Function responds < 2.5 seconds  
✅ Retry logic handles failures gracefully  
✅ Context stays under token limit  
✅ Responses validated and logged

---

## Phase 5: Core Game Mechanics (Weeks 8-9)

### 5.1 Resource Management System

#### Tasks
- [ ] Implement fuel consumption calculation
- [ ] Add material tracking and usage
- [ ] Create hull degradation system
- [ ] Build health and status effects
- [ ] Implement death → reload save mechanic

#### Implementation
```typescript
// stores/resourceStore.ts
export const useResourceStore = create<ResourceStore>((set, get) => ({
  fuel: 10,
  materials: 5,
  hull: 100,
  health: 100,
  
  consumeFuel: (distance: number) => {
    const cost = Math.ceil(distance)
    const currentFuel = get().fuel
    
    if (currentFuel < cost) {
      throw new Error('Insufficient fuel')
    }
    
    set({ fuel: currentFuel - cost })
    
    // Check for death condition
    if (currentFuel - cost === 0) {
      get().checkFuelDeath()
    }
  },
  
  degradeHull: (type: 'jump' | 'landing' | 'damage', amount?: number) => {
    let degradation = 0
    
    switch(type) {
      case 'jump':
        degradation = 2  // -2% per system jump
        break
      case 'landing':
        degradation = 1  // -1% per landing
        break
      case 'damage':
        degradation = amount || 5  // Variable environmental damage
        break
    }
    
    const newHull = Math.max(0, get().hull - degradation)
    set({ hull: newHull })
    
    if (newHull === 0) {
      get().triggerDeath('hull_breach')
    }
  },
  
  triggerDeath: async (cause: string) => {
    // Log death
    await supabase.from('game_logs').insert({
      log_type: 'death',
      metadata: { cause }
    })
    
    // Load last save
    await get().loadLastSave()
  }
}))
```

#### Validation Criteria
✅ Fuel consumption accurate (Math.ceil)  
✅ No emergency fuel generation  
✅ Death triggers save reload  
✅ Resource depletion tracked correctly

### 5.2 Fragment System

#### Tasks
- [ ] Implement deterministic placement with seed
- [ ] Create fragment discovery mechanism
- [ ] Add duplicate prevention (Set + DB)
- [ ] Build combination validation
- [ ] Implement drought protection
- [ ] Enforce distribution ratios per ring
- [ ] Add cluster prevention logic

#### Implementation
```typescript
// services/fragmentService.ts
export class FragmentService {
  private rng: SeededRandom
  
  // Fragment distribution per GDD specifications
  private readonly DISTRIBUTION = {
    inner: { planets: 36, fragments: 12, rate: 0.33 },
    middle: { planets: 36, fragments: 20, rate: 0.55 },
    outer: { planets: 27, fragments: 18, rate: 0.67 }
  }
  
  private readonly MAX_FRAGMENTS_PER_SYSTEM = 2
  
  constructor(seed: number) {
    this.rng = new SeededRandom(seed)
  }
  
  placeFragments(): Map<string, string[]> {
    const placement = new Map<string, string[]>()
    const systemFragmentCount = new Map<string, number>()
    
    // Place fragments according to ring distribution
    this.placeRingFragments('inner', 12, placement, systemFragmentCount)
    this.placeRingFragments('middle', 20, placement, systemFragmentCount)
    this.placeRingFragments('outer', 18, placement, systemFragmentCount)
    
    // Ensure critical fragments are spread properly
    this.ensureCriticalFragmentSpread(placement)
    
    return placement
  }
  
  private placeRingFragments(
    ring: string, 
    count: number, 
    placement: Map<string, string[]>,
    systemCount: Map<string, number>
  ) {
    const planets = this.getPlanetsInRing(ring)
    const fragments = this.getFragmentsForRing(ring, count)
    
    for (const fragment of fragments) {
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < 100) {
        const planet = planets[Math.floor(this.rng() * planets.length)]
        const system = this.getSystemForPlanet(planet)
        
        // Check cluster prevention
        if ((systemCount.get(system) || 0) < this.MAX_FRAGMENTS_PER_SYSTEM) {
          if (!placement.has(planet)) {
            placement.set(planet, [])
          }
          placement.get(planet)!.push(fragment)
          systemCount.set(system, (systemCount.get(system) || 0) + 1)
          placed = true
        }
        attempts++
      }
    }
  }
  
  async discoverFragment(gameStateId: string, fragmentId: string) {
    // Check for duplicate
    const { data: existing } = await supabase
      .from('fragments')
      .select('id')
      .eq('game_state_id', gameStateId)
      .eq('fragment_id', fragmentId)
      .single()
    
    if (existing) {
      return { duplicate: true, message: 'Fragment already collected' }
    }
    
    // Add to collection
    const { error } = await supabase
      .from('fragments')
      .insert({
        game_state_id: gameStateId,
        fragment_id: fragmentId,
        fragment_type: this.getFragmentType(fragmentId)
      })
    
    if (error && error.code === '23505') { // Unique violation
      return { duplicate: true, message: 'Fragment already collected' }
    }
    
    return { duplicate: false, fragmentId }
  }
}
```

#### Database Function for Drought Protection
```sql
-- migrations/003_fragment_drought.sql
CREATE OR REPLACE FUNCTION check_fragment_drought(p_game_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  planets_since_fragment INTEGER;
BEGIN
  -- Count planets explored since last fragment
  SELECT COUNT(DISTINCT metadata->>'planet_id')
  INTO planets_since_fragment
  FROM game_logs
  WHERE game_state_id = p_game_id
  AND log_type = 'planet_explored'
  AND created_at > COALESCE(
    (SELECT MAX(discovered_at) 
     FROM fragments 
     WHERE game_state_id = p_game_id),
    '1970-01-01'::TIMESTAMPTZ
  );
  
  RETURN planets_since_fragment >= 4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Validation Criteria
✅ Fragments place deterministically with seed  
✅ No duplicate fragments possible  
✅ Drought protection triggers after 4 planets  
✅ Combinations reveal correct information

---

## Phase 6: Combat System (Weeks 10-11)

### 6.1 Combat Resolution

#### Tasks
- [ ] Implement damage calculation with creativity
- [ ] Add all 10 weapon types with correct damage values
- [ ] Create enemy profiles with resistances
- [ ] Build multi-enemy combat
- [ ] Add environmental bonuses

#### Weapon Types (Per GDD)
```typescript
const WEAPONS = {
  'plasma_torch': { damage: 20, type: 'energy', special: 'starting' },
  'pulse_rifle': { damage: 35, type: 'energy', special: 'standard' },
  'rail_pistol': { damage: 40, type: 'kinetic', special: 'armor_piercing' },
  'microwave_cannon': { damage: 45, type: 'radiation', special: 'internal_damage' },
  'neural_disruptor': { damage: 30, type: 'neural', special: 'double_vs_synthetics' },
  'shard_launcher': { damage: 55, type: 'spread', special: 'multi_target' },
  'flesh_melter': { damage: 60, type: 'chemical', special: 'banned_weapon' },
  'void_rifle': { damage: 70, type: 'exotic', special: 'ignores_armor' },
  'thermite_charge': { damage: 80, type: 'explosive', special: 'consumable_area' },
  'emp_grenade': { damage: 50, type: 'explosive', special: 'consumable_vs_synthetics' }
}
```

#### Implementation
```typescript
// services/combatService.ts
export class CombatService {
  private weapons = WEAPONS
  
  calculateDamage(params: {
    weaponName: string,
    creativity: 'poor' | 'standard' | 'clever' | 'brilliant',
    enemyType: string,
    environmentalBonus: boolean
  }): number {
    const weapon = this.weapons[params.weaponName]
    const creativityMultipliers = {
      poor: 0.75,
      standard: 1.0,
      clever: 1.25,
      brilliant: 1.5
    }
    
    // Base calculation with weapon damage
    let damage = weapon.damage * creativityMultipliers[params.creativity]
    
    // Special weapon effects
    if (weapon.special === 'double_vs_synthetics' && params.enemyType.includes('synthetic')) {
      damage *= 2
    }
    
    // Check resistances
    const resistance = this.getResistance(params.enemyType, weapon.type)
    damage *= (1 - resistance)
    
    // Environmental bonus
    if (params.environmentalBonus) {
      damage *= 1.2
    }
    
    // Random variance ±20%
    const variance = 0.8 + (Math.random() * 0.4)
    damage *= variance
    
    return Math.floor(damage)
  }
  
  private getResistance(enemyType: string, weaponType: string): number {
    const resistances: Record<string, Record<string, number>> = {
      'security_synthetic': {
        'kinetic': 0.5,
        'energy': 0.25,
        'emp': -0.5 // Weakness
      },
      'flesh_hybrid': {
        'neural': 0.75,
        'fire': -0.25,
        'chemical': -0.25
      }
    }
    
    return resistances[enemyType]?.[weaponType] || 0
  }
}
```

#### Validation Criteria
✅ Creativity multipliers apply correctly  
✅ Resistances and weaknesses work  
✅ Multi-enemy combat handles targeting  
✅ Environmental bonuses calculated

---

## Phase 7: Save System & Cloud Sync (Week 12)

### 7.1 Auto-Save Implementation

#### Tasks
- [ ] Create save triggers
- [ ] Implement save versioning
- [ ] Add save compression
- [ ] Build corruption detection
- [ ] Create rollback mechanism

#### Database Triggers
```sql
-- migrations/004_save_system.sql

-- Auto-save trigger
CREATE OR REPLACE FUNCTION auto_save_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Only save on significant events
  IF (TG_OP = 'UPDATE' AND (
    OLD.current_system IS DISTINCT FROM NEW.current_system OR
    OLD.player_health <= 0 AND NEW.player_health > 0
  )) THEN
    INSERT INTO save_games (
      user_id,
      game_state_id,
      save_type,
      save_data,
      content_version
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'auto',
      row_to_json(NEW),
      '1.0.0'
    );
    
    -- Keep only 5 most recent saves per game
    DELETE FROM save_games
    WHERE game_state_id = NEW.id
    AND id NOT IN (
      SELECT id FROM save_games
      WHERE game_state_id = NEW.id
      ORDER BY created_at DESC
      LIMIT 5
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_save_trigger
AFTER UPDATE ON game_states
FOR EACH ROW
EXECUTE FUNCTION auto_save_game();

-- Save corruption detection
CREATE OR REPLACE FUNCTION validate_save_data(p_save_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check required fields
  IF NOT (
    p_save_data ? 'fuel' AND
    p_save_data ? 'materials' AND
    p_save_data ? 'hull_integrity' AND
    p_save_data ? 'player_health' AND
    p_save_data ? 'seed'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check value ranges
  IF (
    (p_save_data->>'fuel')::INTEGER < 0 OR
    (p_save_data->>'hull_integrity')::INTEGER < 0 OR
    (p_save_data->>'hull_integrity')::INTEGER > 100
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### Client Implementation
```typescript
// services/saveService.ts
export class SaveService {
  async autoSave(trigger: string) {
    const gameState = useGameStore.getState()
    
    await supabase.from('save_games').insert({
      user_id: gameState.userId,
      game_state_id: gameState.id,
      save_type: 'auto',
      save_data: this.serializeState(gameState),
      content_version: '1.0.0'
    })
  }
  
  async loadSave(saveId: string) {
    const { data: save } = await supabase
      .from('save_games')
      .select('*')
      .eq('id', saveId)
      .single()
    
    if (!this.validateSaveData(save.save_data)) {
      throw new Error('Save data corrupted')
    }
    
    return this.deserializeState(save.save_data)
  }
}
```

#### Validation Criteria
✅ Auto-save triggers on key events  
✅ Save versioning handles updates  
✅ Corruption detection works  
✅ Can rollback to any recent save

---

## Phase 8: Content Creation (Weeks 13-15)

### 8.1 Handcrafted Core Planets

#### Tasks
- [ ] Create 10 hand-crafted planets (including 3 tutorial)
- [ ] Design learning progression for tutorial planets
- [ ] Build story-critical planet templates
- [ ] Create diverse environment types
- [ ] Add ECHO awakening sequence
- [ ] Implement survivor variety encounters

#### Planet Templates (10 Handcrafted)
```yaml
# Tutorial Planets (3)
1. abandoned_outpost_alpha - First fragment, basic combat
2. derelict_research_station - Resource management tutorial
3. crashed_colony_ship - ECHO awakening, moral choice

# Story Critical Planets (4)
4. hedonist_station - Pleasure district horror (fragment: ship.beta7)
5. upload_facility_gamma - Mind transfer experiments (fragment: gate.q5)
6. flesh_market_bazaar - Body modification horror (fragment: truth.signal2)
7. exodus_prime_location - Hidden intergalactic ship (requires all ship fragments)

# Environment Variety (3)
8. frozen_mining_colony - Environmental hazards, The Pure cannibals
9. void_touched_monastery - Reality distortion, psychological horror
10. synthetic_rebellion_site - Military synthetics, heavy combat
```

#### Survivor Varieties Implementation
```typescript
const SURVIVOR_TYPES = {
  synthetics: { corruptionTypes: ['pleasure', 'military', 'service'] },
  cyborgs: { addictionLevels: ['mild', 'severe', 'terminal'] },
  uploadedMinds: { loopTypes: ['death', 'pleasure', 'trauma'] },
  symbiotics: { mergeStates: ['voluntary', 'forced', 'parasitic'] },
  thePure: { cannibalismLevel: ['desperate', 'ritualistic', 'preferred'] },
  machineCults: { devotionTypes: ['zealot', 'sacrifice', 'merger'] },
  transformed: { mutationStages: ['early', 'advanced', 'unrecognizable'] },
  voidTouched: { madnessLevel: ['lucid', 'prophetic', 'lost'] },
  fleshTraders: { specialties: ['organs', 'modifications', 'whole_bodies'] },
  pleasureSynthetics: { corruptionLevel: ['functional', 'broken', 'seeking_death'] }
}
```

#### Validation Criteria
✅ 10 unique handcrafted planets complete  
✅ Tutorial progression smooth (3 planets)  
✅ Story critical locations memorable (4 planets)  
✅ Environment variety sufficient (3 planets)  
✅ Each survivor type appears at least once  
✅ ECHO evolution triggers properly

### 8.2 Planet Generation Pipeline

#### Tasks
- [ ] Create generation prompts for Claude/GPT
- [ ] Build validation system
- [ ] Generate 30 initial planets
- [ ] Test fragment accessibility
- [ ] Balance resource distribution

#### Generation Script
```typescript
// scripts/generatePlanets.ts
async function generatePlanet(params: {
  ring: 'inner' | 'middle' | 'outer',
  dangerLevel: number,
  hasFragment: boolean,
  fragmentType?: string
}) {
  const prompt = `
    Generate a planet for Echoes of Earth (mature sci-fi horror).
    
    Requirements:
    - Ring: ${params.ring}
    - Danger: ${params.dangerLevel}/10
    - Fragment: ${params.hasFragment ? params.fragmentType : 'none'}
    - Include 3-5 locations
    - Add disturbing/mature content
    - Include at least one combat encounter
    - Balance resources (fuel: 0-4, materials: 0-8)
    
    Output as YAML following the schema...
  `
  
  const generated = await callAI(prompt)
  const validated = await validatePlanet(generated)
  
  if (!validated.valid) {
    console.error('Validation failed:', validated.errors)
    return null
  }
  
  return validated.planet
}

async function validatePlanet(planet: any): Promise<ValidationResult> {
  const checks = [
    checkSchema(planet),
    checkPlayability(planet),
    checkResourceBalance(planet),
    checkFragmentAccess(planet)
  ]
  
  const failures = checks.filter(c => !c.passed)
  
  return {
    valid: failures.length === 0,
    errors: failures.map(f => f.error)
  }
}
```

#### Validation Criteria
✅ All planets pass schema validation  
✅ Fragments are accessible  
✅ Resource economy balanced  
✅ Content appropriately mature

---

## Phase 9: ECHO & Polish (Weeks 16-17)

### 9.1 ECHO Companion System

#### Tasks
- [ ] Implement evolution stages
- [ ] Add morality tracking
- [ ] Create dialogue variations
- [ ] Build fragment analysis
- [ ] Add story revelations

#### Implementation
```typescript
// services/echoService.ts
export class ECHOService {
  private stage: ECHOStage = 'professional'
  private morality: number = 0
  
  evolve(fragments: number, events: GameEvent[]) {
    if (fragments >= 40 && this.stage !== 'truth') {
      this.stage = 'truth'
      return "I... I know what happened to Earth. You need to know."
    }
    
    if (fragments >= 20 && this.stage !== 'nihilistic') {
      this.stage = 'nihilistic'
      return "Maybe Earth deserves to stay lost after seeing this."
    }
    
    if (fragments >= 5 && this.stage !== 'awakening') {
      this.stage = 'awakening'
      return "Fuck... I'm starting to feel things. This is wrong."
    }
  }
  
  trackMorality(action: string) {
    const moralityImpacts: Record<string, number> = {
      'free_prisoner': 10,
      'kill_innocent': -20,
      'spare_enemy': 5,
      'torture': -15,
      'mercy_kill': 3
    }
    
    this.morality += moralityImpacts[action] || 0
    this.morality = Math.max(-100, Math.min(100, this.morality))
  }
  
  getDialogue(context: string): string {
    const variations = {
      positive: {
        professional: "Optimal outcome achieved, Commander.",
        awakening: "Good job. You're not like them.",
        nihilistic: "At least you're still human.",
        truth: "You give me hope we deserve to find Earth."
      },
      negative: {
        professional: "Objective complete.",
        awakening: "Jesus Christ, was that necessary?",
        nihilistic: "You're becoming one of them.",
        truth: "Earth doesn't need more monsters."
      }
    }
    
    const tone = this.morality > 0 ? 'positive' : 'negative'
    return variations[tone][this.stage]
  }
}
```

#### Validation Criteria
✅ ECHO evolves at correct triggers  
✅ Morality affects dialogue  
✅ Story reveals at right moments  
✅ Fragment analysis helpful

### 9.2 Performance Optimization

#### Tasks
- [ ] Optimize database queries
- [ ] Add strategic caching
- [ ] Improve Edge Function cold starts
- [ ] Optimize bundle size
- [ ] Add progressive loading

#### Optimization Queries
```sql
-- migrations/005_performance.sql

-- Optimize fragment lookups
CREATE INDEX CONCURRENTLY idx_fragments_game_type 
ON fragments(game_state_id, fragment_type);

-- Optimize recent games
CREATE INDEX CONCURRENTLY idx_game_states_recent 
ON game_states(user_id, updated_at DESC)
WHERE updated_at > NOW() - INTERVAL '7 days';

-- Create materialized view for stats
CREATE MATERIALIZED VIEW game_statistics AS
SELECT 
  user_id,
  COUNT(DISTINCT game_state_id) as total_games,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_play_hours,
  MAX(array_length(string_to_array(war_fog::text, ','), 1)) as max_systems_explored,
  COUNT(DISTINCT f.fragment_id) as unique_fragments
FROM game_states gs
LEFT JOIN fragments f ON f.game_state_id = gs.id
GROUP BY user_id;

CREATE UNIQUE INDEX ON game_statistics(user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_game_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY game_statistics;
END;
$$ LANGUAGE plpgsql;
```

#### Validation Criteria
✅ Queries execute < 100ms  
✅ Edge Functions start < 500ms  
✅ Bundle size < 500KB  
✅ No performance degradation under load

---

## Phase 10: Testing & Launch (Weeks 18-20)

### 10.1 Comprehensive Testing

#### Tasks
- [ ] Unit test all game logic
- [ ] Integration test Supabase APIs
- [ ] E2E test critical paths
- [ ] Load test with 100 users
- [ ] Security audit

#### Test Suite
```typescript
// tests/integration/gameFlow.test.ts
describe('Game Flow Integration', () => {
  test('Complete tutorial sequence', async () => {
    // Create anonymous user
    // Start new game
    // Land on tutorial planet
    // Discover first fragment
    // Return to ship
    // Verify auto-save
  })
  
  test('Death and reload', async () => {
    // Deplete fuel to 0
    // Verify death trigger
    // Check save reload
    // Confirm state restored
  })
  
  test('Fragment deduplication', async () => {
    // Discover fragment
    // Attempt rediscovery
    // Verify rejection
    // Check database constraint
  })
})

// tests/load/concurrent.test.ts
describe('Load Testing', () => {
  test('100 concurrent users', async () => {
    const users = await createTestUsers(100)
    const results = await Promise.all(
      users.map(u => simulateGameSession(u))
    )
    
    expect(results.every(r => r.success)).toBe(true)
    expect(getAverageResponseTime(results)).toBeLessThan(2500)
  })
})
```

#### Validation Criteria
✅ All unit tests pass (>95% coverage)  
✅ Integration tests successful  
✅ E2E tests complete without errors  
✅ Load test: <2.5s response at 100 users  
✅ Security audit passes

### 10.2 Production Deployment & PWA Distribution

#### Tasks
- [ ] Deploy to Vercel with PWA optimizations
- [ ] Configure production Supabase
- [ ] Setup monitoring (Sentry)
- [ ] Configure analytics
- [ ] Create itch.io page
- [ ] Submit to PWA stores
- [ ] Configure Web App Install banners

#### PWA Deployment Configuration
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Production Checklist
```yaml
deployment_checklist:
  infrastructure:
    - [ ] Vercel project created
    - [ ] Environment variables set
    - [ ] Custom domain configured
    - [ ] SSL certificates active (required for PWA)
    - [ ] CDN caching configured
  
  pwa_requirements:
    - [ ] HTTPS enabled everywhere
    - [ ] Service worker registered
    - [ ] Manifest.json validated
    - [ ] Icons for all platforms
    - [ ] Splash screens generated
    - [ ] Connection required page created
    - [ ] Install prompts configured
    - [ ] Online-only validation working
  
  supabase:
    - [ ] Production project created
    - [ ] Database migrated
    - [ ] RLS policies verified
    - [ ] Backups configured
    - [ ] Connection pooling enabled
    - [ ] Edge Functions deployed
  
  monitoring:
    - [ ] Sentry error tracking
    - [ ] Vercel Analytics
    - [ ] PWA install tracking
    - [ ] Offline usage metrics
    - [ ] Supabase logs streaming
    - [ ] Uptime monitoring
  
  distribution:
    - [ ] itch.io page created
    - [ ] PWA listed on PWA stores
    - [ ] Microsoft Store submission (via PWA)
    - [ ] Google Play Store (via TWA)
    - [ ] App Store Connect (Safari Web App)
    - [ ] Payment processing tested
    - [ ] Screenshots prepared (PWA & web)
    - [ ] Marketing copy written
    - [ ] Discord/community setup
  
  performance:
    - [ ] Lighthouse score >90
    - [ ] First Contentful Paint <1.5s
    - [ ] Time to Interactive <3.5s
    - [ ] Bundle size <500KB initial
    - [ ] Service worker caching optimal
```

#### Final Validation
✅ Production deployment stable  
✅ <1% error rate in first 24h  
✅ Payment processing working  
✅ Players can complete tutorial  
✅ No critical bugs reported

---

## Milestone Summary

| Week | Milestone | Validation |
|------|-----------|------------|
| 2 | Foundation complete | Supabase connected, types defined |
| 3 | Database & RLS ready | Schema deployed, security enabled |
| 5 | Dual-mode UI working | Both interfaces functional |
| 7 | GM system integrated | <2.5s responses, JSON parsing |
| 9 | Core mechanics done | Resources, fragments, death |
| 11 | Combat functional | Creativity multipliers working |
| 12 | Save system complete | Auto-save, cloud sync |
| 15 | 30+ planets ready | Content validated, balanced |
| 17 | ECHO & polish done | Evolution, morality tracking |
| 20 | **LAUNCH READY** | All systems tested, deployed |

---

## Success Metrics

### Technical Performance
- **GM Response Time:** <2.5 seconds average
- **Database Queries:** <100ms p95
- **Edge Function Start:** <500ms cold start
- **Error Rate:** <1% in production
- **Uptime:** 99.9% availability

### Game Metrics
- **Total Planets:** 99 unique, explorable
- **Fragment System:** 50 fragments, no duplicates
- **Combat Balance:** Creativity affects outcomes
- **Save System:** Reliable auto-save, cloud sync
- **Death Handling:** Always reload last save

### Player Engagement
- **Tutorial Completion:** >80%
- **First Fragment:** >90% discover
- **First Death:** >70% experience
- **Reach Outer Ring:** >30% achieve
- **Complete Game:** >10% finish
- **Average Session:** 45-60 minutes
- **Fragment Discovery Rate:** Inner 33%, Middle 55%, Outer 67%
- **Weapon Variety Usage:** All 10 types used by >20% of players
- **Context Summarization:** <5 seconds when triggered

### Business Goals
- **Launch Platform:** itch.io ready
- **Price Point:** $10-15 configured
- **Payment:** Processing functional
- **Community:** Discord/forums active
- **Reviews:** 4.2+ star average

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Gemini API limits | Implement caching, fallback responses |
| Database performance | Indexes, connection pooling, caching |
| Edge Function timeouts | Retry logic, response streaming |
| Save corruption | Validation, multiple backups |
| Fragment duplication | DB constraints, Set in memory |

### Content Risks
| Risk | Mitigation |
|------|-----------|
| AI content refusal | Multiple prompts, fallback content |
| Planet validation failures | Manual review, adjustment pipeline |
| Mature content limits | Test boundaries, have alternatives |
| Content repetition | Large variety, procedural elements |

### Business Risks
| Risk | Mitigation |
|------|-----------|
| Low player retention | Strong tutorial, clear progression |
| Technical support burden | Comprehensive testing, clear docs |
| Negative reviews | Beta testing, community feedback |
| Platform rejection | Content warnings, age gating |

---

## Documentation & Resources

### Required Documentation
- [ ] Player guide / manual
- [ ] API documentation
- [ ] Database schema docs
- [ ] Deployment guide
- [ ] Content creation guide

### Supabase Resources
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Performance Optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Monitoring & Debugging](https://supabase.com/docs/guides/database/inspect)

### External Resources
- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Conclusion

This development plan provides a structured 20-week path to launch **Echoes of Earth**. Each phase builds upon the previous, with clear validation criteria and Supabase integration at every step. The plan emphasizes:

1. **Solid Foundation:** Proper setup and typing from the start
2. **Security First:** RLS and validation throughout
3. **Performance Focus:** Optimization at each layer
4. **Content Pipeline:** Validated, balanced generation
5. **Testing Rigor:** Comprehensive test coverage
6. **Production Ready:** Monitoring and support prepared

Following this plan will result in a polished, performant, and engaging game ready for launch on itch.io.

**Let's build something dark, beautiful, and unforgettable.**

---

*End of Development Plan v1.0*  
*Next Step: Begin Phase 1.1 - Project Setup*