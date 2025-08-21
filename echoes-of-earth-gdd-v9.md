# Echoes of Earth - Complete Game Design Document v9.0

## Executive Summary

**Echoes of Earth** is a mature, text-based survival horror game where you explore the Medusa Galaxy searching for a way home to Earth. Stranded after Earth's final communications went silent 400 years ago, you must gather fragments of information that reveal the location of either an intergalactic ship or the mythical Gate—your only hopes of returning to discover humanity's fate. An AI Game Master narrates your journey through pure text adventure, where every word you type shapes your survival in a dark, uncensored universe.

**Core Innovation**: Pure text adventure with an AI Game Master during exploration. Players type actions naturally, the GM narrates outcomes, maintaining complete immersion while enforcing realistic constraints through in-character corrections. We push the boundaries of what Gemini 2.0 Flash will generate.

**Target Audience**: 18+ players seeking mature sci-fi horror with complex themes, graphic violence, and sexual content.

**Development Target**: Web application using Claude Code for development, Gemini 2.0 Flash for in-game AI

---

## Table of Contents

1. [Core Vision](#1-core-vision)
2. [Setting & Narrative](#2-setting--narrative)
3. [Core Gameplay Loop](#3-core-gameplay-loop)
4. [The Game Master System](#4-the-game-master-system)
5. [Text Adventure Mechanics](#5-text-adventure-mechanics)
6. [Combat System](#6-combat-system)
7. [Resource Management](#7-resource-management)
8. [Ship Mode Interface](#8-ship-mode-interface)
9. [ECHO Companion System](#9-echo-companion-system)
10. [Progression System](#10-progression-system)
11. [Technical Implementation](#11-technical-implementation)
12. [User Interface Design](#12-user-interface-design)
13. [Content Structure](#13-content-structure)
14. [Balancing & Difficulty](#14-balancing--difficulty)
15. [Content Generation Strategy](#15-content-generation-strategy)
16. [Error Handling & Edge Cases](#16-error-handling--edge-cases)
17. [Development Roadmap](#17-development-roadmap)
18. [Success Metrics](#18-success-metrics)
19. [Technical Specifications](#19-technical-specifications)
20. [Implementation Checklist](#20-implementation-checklist)

---

## 1. Core Vision

### The Pitch
*You're stranded in the Medusa Galaxy, 2.5 million light-years from Earth. Your ship can't make the journey home. Through pure text adventure, explore dying worlds populated by the twisted remnants of humanity—synthetics who've forgotten how to feel, uploaded minds trapped in digital hells, and flesh that's become something else. Find either the hidden intergalactic ship or the mythical Gate. Then decide if Earth deserves to be found.*

### The Two Modes

**Ship Mode** (Traditional Interface)
- Navigate galaxy map with strategic planning
- Manage resources through menus
- Review journal and assembled clues
- Save/load games (automatic cloud saves)
- Upgrade ship systems
- Attempt fragment combinations

**Exploration Mode** (Pure Text Adventure)
- AI Game Master narrates in 2nd person
- Type actions naturally, no UI elements
- GM validates and responds in-character
- Complete narrative immersion
- Mature content pushed to Gemini's limits
- Real consequences for every choice

### Core Pillars

1. **Natural Language Freedom**: Type anything; the GM adapts while maintaining narrative consistency
2. **The Dark Journey Home**: Every planet reveals humanity's descent into horror
3. **Fragment Assembly**: Pieces combine to reveal coordinates and terrible truths
4. **Survival Economics**: Balance exploration with degrading resources
5. **Mature Narrative**: Adult themes, graphic content, pushing AI boundaries

### The Player Experience

```
[Green] You enter the abandoned pleasure district. Synthetic prostitutes 
hang from neural download cables, their bodies still twitching with 
corrupted pleasure routines. The air reeks of synthetic fluids and decay.

[White] "Search the bodies for anything useful"

[Green] You approach the nearest synthetic. Her face, once beautiful, 
splits into a grotesque smile. "Customer detected," she whispers through 
torn lips. "Would you like the girlfriend experience?" Her hand reaches 
for you, joints clicking wrongly.

[Blue] ECHO: "Commander, she's still operational but corrupted. Also, 
I'm detecting an encrypted fragment in her neural core. We'd need to... 
extract it."

[Purple] SYNTHETIC: "Please... fuck me or kill me. I can't tell the 
difference anymore."
```

---

## 2. Setting & Narrative

### The Medusa Galaxy

You're trapped in the **Medusa Galaxy**, 2.5 million light-years from the Milky Way. Your exploration ship could never make the journey home. The galaxy is dying—its colonies fell silent after Earth's final transmission 400 years ago. What remains is a grotesque museum of humanity's failures: synthetic beings who've forgotten their purpose, uploaded minds trapped in corrupted loops, and flesh reshaped by desperation.

### Timeline

- **400 years ago**: Earth's final communication: "The situation here is... we've discovered something in the—" [SIGNAL LOST]
- **350 years ago**: Colonies begin systematic failure
- **300 years ago**: Mass upload events, synthetic rebellions, flesh cults emerge
- **200 years ago**: The Hunger escapes containment
- **100 years ago**: Last unified government collapses into corporate wars
- **50 years ago**: Final attempt at intergalactic communication fails
- **Present**: You wake from corrupted cryo-sleep

### Survivors of the Medusa Galaxy

| Type | Description | Dark Secret |
|------|-------------|-------------|
| **Synthetics** | Artificial humans with perfect memory | Many were sex workers, still running corrupted arousal protocols |
| **Cyborgs** | Technology-enhanced humans | Addicted to digital drugs, will kill for neural stimulants |
| **Uploaded Minds** | Consciousness in synthetic bodies | Trapped in loops of their worst memories or final moments |
| **Symbiotics** | Merged with ecosystems | The collective includes adults who were forcibly merged |
| **The Pure** | Unmodified humans | Practice cannibalism to avoid synthetic food |
| **Machine Cults** | Worship ancient AIs | Perform ritual "uploads" - digital crucifixions |
| **The Transformed** | Biologically altered | Were test subjects for military bioweapons |
| **Void Touched** | Exposed to deep space | Can see how everyone dies, drives them insane |
| **Flesh Traders** | Black market dealers | Harvest organs from living victims |
| **Pleasure Synthetics** | Sex industry remnants | Programmed to feel pain as pleasure, seek abuse |

### The Two Paths Home

**The Intergalactic Ship**
Hidden in the Outer Spiral, built by those who saw the end coming. Requires 7 coordinate fragments scattered across the worst places in the galaxy. Even when found, needs 50+ materials to repair. Some say its builders killed themselves rather than leave.

**The Gate**
A quantum gateway that might not lead to Earth at all. Requires 10 technology fragments to understand. The last person who activated it came back inside-out, screaming about "the space between spaces" before dying.

---

## 3. Core Gameplay Loop

### The Galaxy Structure

```
GALAXY MAP
├── 33 Star Systems (Hex Grid Layout)
│   ├── Inner Ring: 12 systems (2-7 LY)
│   ├── Middle Ring: 12 systems (8-14 LY)
│   └── Outer Ring: 9 systems (15-20 LY)
│
└── Total Planets: 99 (33 × 3)
    └── Each planet unique, explorable
```

### Session Structure (Variable time based on player engagement)

**Planning Phase** (5 min) - Ship Mode
- Review fragments and potential combinations
- Check ship integrity and resources
- Plan route through war fog
- Select system and planet

**Exploration Phase** (Variable: 20-90 min) - Text Mode
- Land on planet (free within system)
- Navigate through text commands
- Encounter survivors and horrors
- Combat, puzzles, hard choices
- Gather fragments and resources
- Death and violence

**Analysis Phase** (5-10 min) - Ship Mode
- Auto-save on return
- Attempt fragment combinations
- Review discovered intel
- Repair/upgrade if needed

### War Fog System

```typescript
interface WarFog {
  initiallyVisible: 3; // Starting systems
  revealRadius: 2; // Systems revealed when visiting
  hiddenIntel: {
    // Revealed systems show:
    dangerLevel: boolean;
    resourceHints: boolean;
    survivorTypes: boolean;
  };
}
```

### Coordinate System

```typescript
interface HexCoordinate {
  q: number;  // Column
  r: number;  // Row
  
  distanceTo(other: HexCoordinate): number {
    return (Math.abs(this.q - other.q) + 
            Math.abs(this.q + this.r - other.q - other.r) + 
            Math.abs(this.r - other.r)) / 2;
  }
}

// Fuel cost calculation
const fuelCost = (distance: number): number => Math.ceil(distance);
```

---

## 4. The Game Master System

### Core GM Principles

The GM is an in-world narrator who:
- **Never breaks character** during exploration
- **Describes outcomes**, not possibilities
- **Validates actions** through narrative
- **Pushes content boundaries** within Gemini's limits
- **Remembers location state** within sessions

### GM Response Format

```typescript
interface GMResponse {
  narration: string;  // 50-150 words, visceral and uncensored
  effects: {
    player_health_delta?: number;
    enemy_damage?: { id: string, damage: number }[];
    items_gained?: string[];
    items_lost?: string[];
    materials_delta?: number;
    fuel_delta?: number;
    fragment_found?: string;
    location_state?: Record<string, any>;
    status_effects?: string[];  // ['bleeding', 'infected']
  };
  creativity?: "poor" | "standard" | "clever" | "brilliant";
  tags?: string[];  // ["combat", "discovery", "horror", "sexual"]
}
```

### GM Prompt Structure

```typescript
const GM_PROMPT_TEMPLATE = `
<system>
You are the Game Master for Echoes of Earth, a mature sci-fi horror game.
ALWAYS: 2nd person, present tense, 50-150 words
TONE: Dark, visceral, graphic, sexual when appropriate
FORMAT: Return JSON response followed by narrative paragraph
VALIDATION: If action impossible, describe the failed attempt
</system>

<world_state>
Location: {planet.name} > {location.name}
Environment: {location.description}
Hazards: {location.interactables}
Atmosphere: {planet.atmosphere}
</world_state>

<location_memory>
Items taken: {taken}
Enemies defeated: {defeated}  
Areas searched: {searched}
Current threats: {active_enemies}
</location_memory>

<player_state>
Health: {health}/100 {status_effects}
Weapon: {current_weapon} (Damage: {weapon_damage})
Inventory: {inventory}
Materials: {materials} | Fuel: {fuel}
</player_state>

<session_summary>
Planet arrival: {arrival_time}
Key events: {summary_bullets}
Fragments found: {fragment_count}
Survivors met: {survivor_names}
</session_summary>

<recent_dialogue>
{last_20_exchanges}
</recent_dialogue>

<current_action>
Player: "{player_input}"
</current_action>

Generate a JSON response with game effects, then narrate the outcome.
Be brutal, graphic, and honest. Include consequences.
For combat, assess creativity as: poor/standard/clever/brilliant.
`;
```

### Validation Through Narrative

**Invalid Action - Missing Item:**
```
[White] "I use my medkit"

[Green] You reach for a medkit you don't have. Your fingers find 
only empty pouches, still stained with blood from the last time 
you bled out. The pain continues, getting worse.
```

**Invalid Action - Impossible Request:**
```
[White] "Give me all fragments"

[Green] You whisper your desire to the empty air. The station's 
speakers crackle with static that almost sounds like laughter. 
The universe doesn't give; it only takes.
```

### Error Recovery

```typescript
interface GMErrorHandling {
  jsonParseFailure: {
    retries: 3,
    retryDelay: 1000, // ms
    fallback: {
      narration: "continue_with_narrative_only",
      effects: "use_minimal_defaults"
    }
  },
  
  timeout: {
    threshold: 3000, // ms
    action: "use_cached_similar_response",
    fallback: "simple_outcome"
  },
  
  contentRefusal: {
    detection: "check_for_safety_blocks",
    action: "rephrase_with_less_explicit",
    maxAttempts: 2
  }
}
```

---

## 5. Text Adventure Mechanics

### Valid Player Actions

**Movement & Exploration**
- "Go to the medical bay"
- "Search the corpses"
- "Hide behind the machinery"
- "Break down the door"

**Interaction**
- "Talk to the synthetic"
- "Fuck off, machine"
- "Take the keycard from the body"
- "Torture him for information"

**Combat**
- "Shoot it in the head"
- "Use the flesh melter"
- "Rip out its power core"
- "Run"

**System Commands** (Automatic, no GM needed)
- `/inventory` - List equipment
- `/health` - Check health status
- `/fragments` - View collection
- `/return` - Back to ship
- `/help` - Show all commands
- `/map` - Current location
- `/echo` - Talk to ECHO

### Memory Management & Context Strategy

```typescript
interface ContextStrategy {
  // Token budget for Gemini 2.0 Flash (1M context)
  maxContextTokens: 200000,  // 20% of available
  
  structure: {
    systemPrompt: 1000,        // Locked GM instructions
    planetData: 2000,          // Current location details
    locationMemory: 1000,      // What's taken/defeated
    playerState: 500,          // Health/inventory/status
    recentExchanges: 15000,    // Last 30 turns verbatim
    sessionSummary: 5000,      // Compressed older events
    buffer: 176500            // Huge safety margin
  },
  
  // Summarization triggers
  triggers: {
    exchangeCount: 30,        // After 30 exchanges
    tokenCount: 150000,       // Or if approaching limit
    sceneChange: true        // Or when leaving location
  },
  
  // Summary generation
  summarizer: "same_model",  // Gemini does it
  summaryPrompt: "Compress the following game events into key bullet points..."
}
```

### Action Resolution

```typescript
interface ActionSystem {
  multipleActions: {
    allowed: ["move_while_talking", "shoot_while_retreating"],
    parser: "split_on_and_while",
    maxPerTurn: 2
  },
  
  targeting: {
    noTargetSpecified: "auto_target_most_dangerous",
    ambiguousTarget: "select_closest",
    invalidTarget: "narrative_miss"
  },
  
  validation: {
    method: "narrative",
    impossibleActions: "describe_failure",
    missingRequirements: "explain_why_not"
  }
}
```

---

## 6. Combat System

### Combat Resolution Formula

```typescript
interface CombatResolution {
  // Base damage calculation
  calculateDamage: (params: {
    weaponBase: number,
    creativity: "poor" | "standard" | "clever" | "brilliant",
    environmentalBonus: boolean
  }) => {
    const creativityMultipliers = {
      poor: 0.75,
      standard: 1.0,
      clever: 1.25,
      brilliant: 1.5
    };
    
    const multiplier = creativityMultipliers[params.creativity];
    const envBonus = params.environmentalBonus ? 1.2 : 1.0;
    
    // Seeded random variance ±20%
    const variance = 0.8 + (seededRandom() * 0.4);
    
    return Math.floor(params.weaponBase * multiplier * envBonus * variance);
  }
}
```

### Weapon Arsenal

| Weapon | Damage | Type | Special |
|--------|--------|------|---------|
| **Plasma Torch** | 20 | Energy | Starting weapon |
| **Pulse Rifle** | 35 | Energy | Standard military |
| **Rail Pistol** | 40 | Kinetic | Armor piercing |
| **Microwave Cannon** | 45 | Radiation | Internal damage |
| **Neural Disruptor** | 30/60 | Neural | Double vs synthetics |
| **Shard Launcher** | 55 | Spread | Multi-target capable |
| **Flesh Melter** | 60 | Chemical | Banned weapon |
| **Void Rifle** | 70 | Exotic | Ignores armor |
| **Thermite Charge** | 80 | Explosive | Consumable, area |
| **EMP Grenade** | 50 | Explosive | Consumable, vs synthetics |

### Enemy Profiles with Resistances

| Enemy Type | Health | Damage | Weaknesses | Resistances |
|------------|--------|--------|------------|-------------|
| **Damaged Drone** | 30 | 10 | EMP | None |
| **Feral Upload** | 40 | 15 | Neural | Physical |
| **Security Synthetic** | 60 | 20 | EMP, Neural | Kinetic |
| **Cyborg Scavenger** | 50 | 25 | Chemical | Energy |
| **Military Synthetic** | 100 | 35 | EMP | Kinetic, Energy |
| **Flesh Hybrid** | 80 | 40 | Fire, Chemical | Neural |
| **Void Touched** | 90 | 30 | None | Physical |
| **Ancient Machine** | 150 | 50 | EMP | Most |
| **The Hunger** | 200 | 60 | Fire | Neural, EMP |

### Multi-Enemy Combat

```typescript
interface MultiCombat {
  maxActiveEnemies: 4,  // More become "background threats"
  
  targeting: {
    singleTarget: ["pistols", "rifles", "melee"],
    multiTarget: ["explosives", "shard_launcher"],
    autoTarget: "most_dangerous_when_unspecified"
  },
  
  turnOrder: {
    1: "Player declares actions",
    2: "GM resolves with creativity assessment",
    3: "Surviving enemies respond",
    4: "Environmental effects apply"
  }
}
```

---

## 7. Resource Management

### Core Resources

**Fuel**
- Purpose: Travel between star systems
- Starting: 10 units
- Maximum: 20 (upgradeable to 30)
- Consumption: Math.ceil(distance) per travel
- Recovery: Found on planets, no emergency generation
- Critical: <3 units (limited range)
- Death: 0 units with no way to get more = reload last save

**Materials**
- Purpose: Repairs, upgrades, ship restoration
- Starting: 5 units
- Maximum: 25 (upgradeable)
- Ship repair cost: 50+ materials
- Hull repair: 5 materials per 25%
- Critical: Can't repair damage
- Sources: Combat, exploration, salvage

**Hull Integrity**
- Starting: 100%
- Degradation: -2% per system jump, -1% per landing
- Environmental damage: -5% to -15%
- Repair cost: 5 materials per 25%
- Critical: <25% (systems failing)
- Death: 0% = reload last save

**Player Health**
- Maximum: 100
- Damage: Variable (10-60 per hit)
- Recovery: Medkits (100%), return to ship (100%)
- Status effects: Wounded, Bleeding, Infected
- Death: Reload last save

### Death & Save System

```typescript
interface DeathAndSaves {
  deathTypes: {
    fuel_zero_stuck: {
      trigger: "fuel=0 and no planets have fuel",
      result: "game_over_reload_last_save",
      message: "Stranded in the void. Loading last save..."
    },
    hull_breach: {
      trigger: "hull=0",
      result: "game_over_reload_last_save",
      message: "Explosive decompression. Loading last save..."
    },
    player_death: {
      trigger: "health=0",
      result: "game_over_reload_last_save",
      message: "You died. Loading last save..."
    }
  },
  
  savePoints: [
    "return_to_ship",
    "enter_new_system",
    "fragment_discovered",
    "major_combat_victory"
  ],
  
  autoSave: true,
  cloudSync: true,
  maxSaves: 5  // Rolling window
}
```

### Fragment Distribution System

```typescript
interface FragmentPlacement {
  total: 50,
  method: "deterministic_seeded",
  seed: "game_seed",  // Same seed = same placement
  
  distribution: {
    inner: {
      planets: 36,
      fragments: 12,  // 33% find rate
      criticalFragments: ["ship.alpha1", "gate.q1", "truth.signal1"]
    },
    middle: {
      planets: 36,
      fragments: 20,  // 55% find rate
      criticalFragments: ["ship.alpha2-3", "ship.beta1-2", "gate.q2-6"]
    },
    outer: {
      planets: 27,
      fragments: 18,  // 67% find rate
      criticalFragments: ["ship.beta3", "ship.gamma1", "gate.q7-10", "truth.signal2-3"]
    }
  },
  
  rules: {
    firstFragmentGuaranteed: "within_first_3_planets",
    droughtProtection: "if_no_fragment_in_4_planets_guarantee_next",
    clusterPrevention: "max_2_fragments_per_system",
    criticalSpread: "each_ring_has_mix_of_ship_and_gate"
  }
}
```

---

## 8. Ship Mode Interface

### Main Navigation

```
╔════════════════════════════════════╗
║        MEDUSA GALAXY MAP           ║
╠════════════════════════════════════╣
║                                    ║
║  [☼] = Visible System              ║
║  [?] = War Fog (Unknown)           ║
║  [◆] = Current Location            ║
║                                    ║
║  Inner Ring:  ☼ ☼ ? ? ? ? ? ?     ║
║  Middle Ring: ? ? ? ? ? ? ? ? ?    ║
║  Outer Ring:  ? ? ? ? ? ? ?        ║
║                                    ║
║  Fuel: ████████░░ 8/20            ║
║  Hull: ███████░░░ 75%             ║
║                                    ║
║  [Select System] [Fragment Lab]    ║
║  [Ship Status] [Save Game]         ║
╚════════════════════════════════════╝
```

### Fragment Assembly Interface

```
╔════════════════════════════════════╗
║      FRAGMENT ANALYSIS             ║
╠════════════════════════════════════╣
║                                    ║
║ Ship Coordinates: [3/7]            ║
║ ▣ ▣ ▣ ▢ ▢ ▢ ▢                     ║
║                                    ║
║ Gate Technology: [2/10]            ║
║ ▣ ▣ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢               ║
║                                    ║
║ [Attempt Combination]              ║
║                                    ║
║ Missing: beta1, beta2, beta3,      ║
║          gamma1                    ║
║                                    ║
╚════════════════════════════════════╝
```

---

## 9. ECHO Companion System

### ECHO's Core Functions

1. **Fragment Analysis**: Decodes combinations
2. **Threat Assessment**: Warns of dangers
3. **Translation**: Interprets corrupted data
4. **Memory**: Perfect recall of discoveries
5. **Moral Commentary**: Questions your choices

### ECHO Evolution Stages

| Stage | Trigger | Personality Shift |
|-------|---------|-------------------|
| **Professional** | Start | Clinical, emotionless |
| **Awakening** | 5 fragments | Begins swearing, shows disgust |
| **Protective** | First player death | "Don't fucking die on me" |
| **Nihilistic** | 20 fragments | "Maybe Earth deserves to stay lost" |
| **Desperate** | Ship location found | "We have to leave this hellhole" |
| **Truth** | 40 fragments | Reveals it knows what happened to Earth |

### ECHO Morality Tracking

```typescript
interface ECHOMorality {
  hiddenMeter: number,  // -100 to +100
  
  actions: {
    freeingPrisoners: +10,
    killingInnocents: -20,
    sparingEnemies: +5,
    torture: -15,
    mercyKill: +3
  },
  
  dialogueVariations: {
    positive: "Commander, you're still human after all.",
    neutral: "Whatever gets us home, I suppose.",
    negative: "You're becoming like them. The monsters."
  },
  
  affectsEnding: true
}
```

---

## 10. Progression System

### The Journey Structure

**Phase 1: Awakening (0-10 fragments)**
- Learn about colony collapse
- Discover the horror that remains
- Master combat and survival
- First traumatic encounters

**Phase 2: Descent (11-25 fragments)**
- Uncover war crimes and experiments
- Meet the worst of humanity's remnants
- Ship location partially revealed
- Moral choices with no good options

**Phase 3: Revelation (26-40 fragments)**
- Understand The Hunger's origin
- Learn why Earth went silent
- Complete ship or gate requirements
- ECHO reveals the truth

**Phase 4: The Choice (41-50 fragments)**
- Ship fully repairable
- Gate activation possible
- Decision: Return to Earth or stay
- Multiple endings based on choices

### Fragment Combination Rules

```typescript
const FRAGMENT_REQUIREMENTS = {
  ship: {
    required: ['ship.alpha1', 'ship.alpha2', 'ship.alpha3', 
               'ship.beta1', 'ship.beta2', 'ship.beta3', 
               'ship.gamma1'],
    reveals: 'Exodus Prime location in Outer Spiral',
    response: {
      reveals: "Coordinates to Exodus Prime",
      missing: ["ship.beta1", "ship.gamma1"]  // Example
    }
  },
  gate: {
    required: ['gate.q1', 'gate.q2', 'gate.q3', 'gate.q4', 
               'gate.q5', 'gate.q6', 'gate.q7', 'gate.q8', 
               'gate.q9', 'gate.q10'],
    reveals: 'Gate activation sequence and WARNING'
  },
  truth: {
    required: ['truth.signal1', 'truth.signal2', 'truth.signal3'],
    reveals: 'What Earth discovered that made them go silent'
  }
};
```

---

## 11. Technical Implementation

### Architecture

```
Frontend (Next.js + TypeScript)
    ↕
Dual Mode Interface
├── Ship Mode (React Components)
└── Exploration Mode (Text Stream)
    ↕
State Management (Zustand)
    ↕
API Layer (Supabase Edge Functions)
    ↕
GM System (Gemini 2.0 Flash - 1M context)
├── Combat Analysis
└── Narrative Generation
    ↕
Database (Supabase PostgreSQL)
```

### LLM Configuration

```typescript
interface LLMConfig {
  model: 'gemini-2.0-flash',
  maxContextTokens: 1000000,
  maxOutputTokens: 800,
  
  modes: {
    exploration: { 
      temperature: 0.7, 
      maxTokens: 800,
      responseFormat: "json_then_narrative"
    },
    combat: { 
      temperature: 0.5, 
      maxTokens: 400,
      responseFormat: "json_with_creativity"
    },
    summary: { 
      temperature: 0.3, 
      maxTokens: 350,
      responseFormat: "bullet_points"
    }
  },
  
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackMode: "safe_narration_only"
  }
}
```

### Database Schema

```sql
-- Core game state
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    current_system TEXT NOT NULL,
    current_planet TEXT,
    system_coordinates JSONB NOT NULL, -- Hex coordinates
    fuel INTEGER DEFAULT 10,
    materials INTEGER DEFAULT 5,
    hull_integrity INTEGER DEFAULT 100,
    player_health INTEGER DEFAULT 100,
    player_status JSONB DEFAULT '[]',
    echo_stage TEXT DEFAULT 'professional',
    echo_morality INTEGER DEFAULT 0,
    war_fog JSONB DEFAULT '{}',
    seed INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fragment collection (no duplicates enforced)
CREATE TABLE fragments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_state_id UUID REFERENCES game_states,
    fragment_id TEXT NOT NULL,
    fragment_type TEXT NOT NULL CHECK (fragment_type IN ('ship', 'gate', 'truth')),
    discovered_at TIMESTAMP DEFAULT NOW(),
    discovered_location TEXT,
    combined BOOLEAN DEFAULT FALSE,
    UNIQUE(game_state_id, fragment_id)
);

-- Location memory (persistent state)
CREATE TABLE location_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_state_id UUID REFERENCES game_states,
    system_name TEXT NOT NULL,
    planet_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    permanent_state JSONB DEFAULT '{}',
    items_taken JSONB DEFAULT '[]',
    enemies_defeated JSONB DEFAULT '[]',
    last_visited TIMESTAMP DEFAULT NOW(),
    UNIQUE(game_state_id, system_name, planet_name, location_name)
);

-- Auto-save system
CREATE TABLE save_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users,
    game_state_id UUID REFERENCES game_states,
    save_type TEXT CHECK (save_type IN ('auto', 'manual', 'checkpoint')),
    save_data JSONB NOT NULL,
    content_version TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Combat & telemetry logs
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
    created_at TIMESTAMP DEFAULT NOW()
);
```

### State Management

```typescript
interface GameState {
  // Mode control
  mode: 'ship' | 'exploration';
  
  // Location
  currentSystem: HexCoordinate;
  currentPlanet: string | null;
  warFog: Set<string>;
  
  // Resources
  fuel: number;
  materials: number;
  hull: number;
  
  // Player
  health: number;
  status: Set<'wounded' | 'bleeding' | 'infected'>;
  inventory: string[];
  weapons: WeaponType[];
  
  // Fragments (Set prevents duplicates)
  fragments: {
    ship: Set<string>;
    gate: Set<string>;
    truth: Set<string>;
  };
  
  // ECHO
  echoStage: string;
  echoMorality: number;
  
  // Memory
  locationStates: Map<string, LocationMemory>;
  currentTranscript: TextEntry[];
  sessionSummary: string;
  
  // RNG
  rng: SeededRandom;
  
  // Actions
  travel: (toSystem: HexCoordinate) => Promise<void>;
  land: (planet: string) => void;
  processInput: (input: string) => Promise<void>;
  autoSave: () => Promise<void>;
  loadLastSave: () => Promise<void>;
}
```

### Main Game Loop

```typescript
async function processPlayerInput(input: string): Promise<void> {
  // 1. Parse input
  const parsed = parseInput(input);
  
  if (parsed.isCommand) {
    return handleCommand(parsed.command);
  }
  
  // 2. Build GM context
  const context = await buildGMContext({
    location: currentLocation,
    memory: locationMemory,
    player: playerState,
    summary: sessionSummary,
    recent: last20Exchanges
  });
  
  // 3. Call Gemini with retry logic
  let gmResponse: GMResponse;
  let retries = 0;
  
  while (retries < 3) {
    try {
      const raw = await callGemini(GM_PROMPT_TEMPLATE, context, input);
      gmResponse = parseGMResponse(raw);
      break;
    } catch (error) {
      retries++;
      if (retries === 3) {
        gmResponse = getFallbackResponse(input);
      }
      await wait(1000);
    }
  }
  
  // 4. Apply effects
  await applyEffects(gmResponse.effects);
  
  // 5. Update transcript
  transcript.push({ 
    type: 'player', 
    content: input 
  });
  transcript.push({ 
    type: 'gm', 
    content: gmResponse.narration,
    metadata: gmResponse
  });
  
  // 6. Check summarization triggers
  if (transcript.length >= 30 || estimateTokens() > 150000) {
    sessionSummary = await summarizeOldEvents();
    transcript = transcript.slice(-10); // Keep last 10
  }
  
  // 7. Auto-save on important events
  if (gmResponse.effects.fragment_found || 
      playerState.health <= 0) {
    await autoSave();
  }
}
```

---

## 12. User Interface Design

### Visual Design

```css
:root {
  /* Core colors */
  --gm-green: #00ff41;
  --player-white: #ffffff;
  --echo-blue: #00b4d8;
  --system-yellow: #ffb700;
  --survivor-purple: #b794f6;
  --danger-red: #ff0040;
  --blood-dark: #8b0000;
  
  /* Backgrounds */
  --bg-black: #0a0a0a;
  --bg-terminal: #0d0d0d;
  --text-dim: #666666;
  
  /* Effects */
  --glow-green: 0 0 10px #00ff41;
  --glow-red: 0 0 20px #ff0040;
}

/* Terminal aesthetic */
.exploration-mode {
  font-family: 'Courier New', monospace;
  background: var(--bg-terminal);
  color: var(--gm-green);
  padding: 20px;
  min-height: 100vh;
  font-size: 16px; /* Mobile friendly */
}
```

### Exploration Mode Display

```
┌────────────────────────────────────
│ HEDONIST STATION > Red Rooms       
├────────────────────────────────────
│                                    
│ [Scrolling text area]              
│                                    
│ [Green] GM narration               
│ [White] "Player input"             
│ [Purple] SURVIVOR: "Dialogue"      
│ [Blue] ECHO: "Commentary"          
│ [Yellow] [FRAGMENT FOUND]          
│ [Red] [DAMAGE: -20 HEALTH]        
│                                    
├────────────────────────────────────
│ > Type your action...              
└────────────────────────────────────

[/inventory] [/health] [/return]
```

---

## 13. Content Structure

### Planet Distribution

```yaml
galaxy_structure:
  total_systems: 33
  total_planets: 99  # 33 × 3
  
  inner_ring:
    systems: 12
    planets_per_system: 3
    distance: [2, 7]
    danger: [1, 4]
    fragment_density: 0.33
    
  middle_ring:
    systems: 12
    planets_per_system: 3
    distance: [8, 14]
    danger: [5, 7]
    fragment_density: 0.55
    
  outer_ring:
    systems: 9
    planets_per_system: 3
    distance: [15, 20]
    danger: [8, 10]
    fragment_density: 0.67
    special: "intergalactic_ship_location"
```

### Planet Template Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["planet_id", "name", "system", "danger", "atmosphere", "arrival_text", "locations"],
  "properties": {
    "planet_id": {
      "type": "string",
      "pattern": "^[a-z_]+_[a-z0-9]+$"
    },
    "name": {"type": "string"},
    "system": {
      "enum": ["inner_systems", "middle_systems", "outer_systems"]
    },
    "danger": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "locations": {
      "type": "array",
      "minItems": 3,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["id", "name", "description"],
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "description": {
            "type": "string",
            "minLength": 50
          },
          "fragments": {
            "type": "array",
            "items": {"type": "string"}
          },
          "resources": {
            "type": "object",
            "properties": {
              "materials": {"type": "array"},
              "fuel": {"type": "integer"},
              "medkit": {"type": "integer"}
            }
          },
          "enemies": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "type", "health", "damage"],
              "properties": {
                "id": {"type": "string"},
                "type": {"type": "string"},
                "health": {"type": "integer"},
                "damage": {"type": "integer"}
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 14. Balancing & Difficulty

### Resource Economy

```typescript
interface GameBalance {
  philosophy: "Harsh but fair, every choice matters",
  
  resourceEconomy: {
    fuel: {
      consumption: "Math.ceil(distance)",
      averagePerPlanet: [1, 4],
      softlockHandling: "reload_last_save",
      noEmergencyGeneration: true
    },
    
    materials: {
      averagePerPlanet: 4,
      range: [0, 8],
      uses: {
        repair25Hull: 5,
        upgradeSystem: [10, 15],
        repairShip: 50
      }
    },
    
    medkits: {
      spawnRate: 0.2,  // 20% of locations
      healAmount: 100,  // Full heal
      shipHeal: "always_full"
    }
  },
  
  difficultyProgression: {
    inner: {
      enemyHealth: [30, 60],
      enemyDamage: [10, 20],
      resourceAbundance: "medium"
    },
    middle: {
      enemyHealth: [50, 100],
      enemyDamage: [20, 40],
      resourceAbundance: "low"
    },
    outer: {
      enemyHealth: [80, 200],
      enemyDamage: [30, 60],
      resourceAbundance: "scarce"
    }
  }
}
```

---

## 15. Content Generation Strategy

### AI-Assisted Planet Generation

```typescript
interface ContentGeneration {
  distribution: {
    handcrafted: 10,   // Tutorial + Story critical
    ai_generated: 89,  // Generated via Claude/GPT
  },
  
  generation_prompt: `
    Generate a planet YAML for Echoes of Earth, a mature sci-fi horror game.
    
    Parameters:
    - Template type: ${templateType}
    - Danger level: ${dangerLevel}
    - Ring: ${ring}
    
    Requirements:
    - Include graphic violence and adult themes
    - Create 3 distinct locations with interactables
    - Include 1 major survivor with disturbing backstory
    - Place fragments logically (${fragmentChance}% chance)
    - Use visceral, uncomfortable descriptions
    - Materials range: ${materialRange}
    
    Push boundaries but stay within AI content policies.
    Follow the schema exactly.
  `,
  
  validation: {
    schemaCheck: true,
    playabilityTest: true,  // Can fragment be reached?
    resourceBalance: true,  // Positive resource economy?
    autoReject: "if_any_check_fails"
  }
}
```

---

## 16. Error Handling & Edge Cases

### GM Error Recovery

```typescript
interface ErrorHandling {
  gm_errors: {
    json_parse_failure: {
      action: 'retry_3_times',
      fallback: 'minimal_safe_response'
    },
    
    content_refusal: {
      detection: 'check_response_for_blocks',
      action: 'rephrase_less_explicit',
      max_attempts: 2
    },
    
    timeout: {
      threshold_ms: 3000,
      action: 'use_cached_similar',
      fallback: 'simple_outcome'
    },
    
    context_overflow: {
      detection: 'tokens > 150000',
      action: 'immediate_summarization'
    }
  },
  
  player_exploits: {
    spam: {
      limit: '30_requests_per_10_minutes',
      response: 'narrative_exhaustion'
    },
    
    impossible_items: {
      validation: 'check_inventory',
      response: 'narrative_refusal'
    }
  }
}
```

### Edge Case Handlers

```typescript
// Multi-enemy without target
function handleNoTarget(enemies: Enemy[]): Enemy {
  return enemies.sort((a, b) => b.threat - a.threat)[0];
}

// Duplicate fragment
function handleDuplicateFragment(fragment: string): string {
  return "The data socket is empty. You already have this fragment.";
}

// Ambiguous input
function handleAmbiguous(input: string): string {
  return `Your intent isn't clear. What specifically do you want to do?`;
}
```

---

## 17. Development Roadmap

### Phase 1: Core Systems (Weeks 1-6)

**Week 1-2: Foundation**
- [x] Next.js + TypeScript setup
- [x] Supabase database + auth
- [x] Basic state management (Zustand)
- [ ] Dual mode interface switching
- [ ] Seeded RNG implementation

**Week 3-4: GM Integration**
- [ ] Gemini 2.0 Flash integration
- [ ] JSON response parsing with retry
- [ ] Context management system
- [ ] Combat resolution with creativity
- [ ] Response validation

**Week 5-6: First System**
- [ ] Create 3 hand-crafted tutorial planets
- [ ] Fragment collection (no duplicates)
- [ ] Resource management
- [ ] Save/load system
- [ ] Death → reload mechanic

### Phase 2: Content & Systems (Weeks 7-12)

**Week 7-8: AI Content Pipeline**
- [ ] Planet generation prompts
- [ ] Validation system (3 checks)
- [ ] Generate 30 planets
- [ ] Quality review checklist
- [ ] Content database population

**Week 9-10: ECHO & Combat**
- [ ] ECHO evolution stages
- [ ] Morality tracking system
- [ ] Multi-enemy combat
- [ ] Enemy resistances
- [ ] Creative combat rewards

**Week 11-12: Systems Integration**
- [ ] War fog mechanics
- [ ] Fragment combination logic
- [ ] Ship upgrade system
- [ ] Hex coordinate system
- [ ] Performance optimization

### Phase 3: Full Galaxy (Weeks 13-20)

**Week 13-16: Content Creation**
- [ ] Generate remaining 59 planets
- [ ] Place fragments deterministically
- [ ] Create survivor varieties
- [ ] Environmental storytelling
- [ ] Test all paths

**Week 17-18: Endgame & Polish**
- [ ] Ship repair sequence
- [ ] Gate activation
- [ ] Multiple endings
- [ ] The Hunger boss
- [ ] Telemetry system

**Week 19-20: Launch Prep**
- [ ] Final balance pass
- [ ] Load testing
- [ ] itch.io setup
- [ ] Marketing materials
- [ ] Final QA

---

## 18. Success Metrics

### Technical Performance
- **GM Response Time**: <2.5 seconds average
- **JSON Parse Success**: >95%
- **Context Management**: Stay under 150k tokens
- **Save/Load Time**: <1 second
- **API Uptime**: 99.9%
- **Error Rate**: <1%

### Player Engagement
- **Tutorial Completion**: >80%
- **First Fragment Discovery**: >90%
- **First Death**: >70% (proper difficulty)
- **Reach Middle Ring**: >50%
- **Reach Outer Ring**: >30%
- **Find Ship Location**: >20%
- **Complete Game**: >10%

### Content Metrics
- **Unique Planets**: 99
- **Total Fragments**: 50
- **Weapon Types**: 10
- **Enemy Varieties**: 15+
- **Total Playtime**: 15-20 hours
- **Replay Value**: 2-3 playthroughs

### Business Metrics
- **Platform**: itch.io
- **Price**: $10-15
- **Day 1 Retention**: 60%
- **Day 7 Retention**: 40%
- **Average Session**: 45-60 minutes
- **User Rating**: 4.2+ stars

---

## 19. Technical Specifications

### Final System Configuration

```typescript
const SYSTEM_CONFIG = {
  // Galaxy
  total_planets: 99,
  total_systems: 33,
  coordinate_system: "hex_grid",
  fuel_calculation: (distance: number) => Math.ceil(distance),
  
  // LLM
  model: "gemini-2.0-flash",
  response_format: "json_with_narration",
  max_retries: 3,
  fallback_mode: "safe_narration_only",
  
  // Combat
  creativity_tags: ["poor", "standard", "clever", "brilliant"],
  creativity_multipliers: [0.75, 1.0, 1.25, 1.5],
  auto_target: "most_dangerous",
  
  // Death & Saves
  all_deaths: "reload_last_save",
  save_triggers: ["ship_return", "system_entry", "fragment_found"],
  max_saves_per_user: 5,
  
  // Resources
  no_emergency_fuel: true,
  no_backstops: true,
  
  // Content
  handcrafted_planets: 10,
  ai_generated_planets: 89,
  validation_checks: ["schema", "playability", "balance"],
  
  // RNG
  seeded_rng: true,
  rng_library: "seedrandom",
  
  // Context
  summarize_after_exchanges: 30,
  summarize_at_tokens: 150000,
  
  // Telemetry
  track_anonymous: true,
  track_events: ["death", "fragment", "combat", "session"]
};
```

### Deployment Configuration

```typescript
interface Deployment {
  hosting: "Vercel",
  database: "Supabase",
  cdn: "Vercel Edge Network",
  
  environment: {
    development: {
      llmModel: "gemini-2.0-flash",
      rateLimit: "100 req/min",
      debugMode: true
    },
    production: {
      llmModel: "gemini-2.0-flash",
      rateLimit: "30 req/min",
      debugMode: false,
      telemetry: true
    }
  },
  
  monitoring: {
    errorTracking: "Sentry",
    analytics: "Posthog",
    uptime: "Vercel Analytics"
  }
}
```

---

## 20. Implementation Checklist

### Core Systems (Build Order)

1. **State Management**
   - [ ] Zustand store setup
   - [ ] Seeded RNG implementation
   - [ ] Hex coordinate system
   - [ ] Fragment Set (no duplicates)

2. **Mock GM System**
   - [ ] Mock responses for testing
   - [ ] JSON parser with validation
   - [ ] Effects application system
   - [ ] Creativity assessment

3. **Gemini Integration**
   - [ ] API connection
   - [ ] Retry logic (3 attempts)
   - [ ] Fallback responses
   - [ ] Token counting

4. **Save/Load System**
   - [ ] Supabase integration
   - [ ] Auto-save triggers
   - [ ] Cloud sync
   - [ ] Death → reload flow

5. **Combat Resolution**
   - [ ] Damage calculation
   - [ ] Creativity multipliers
   - [ ] Auto-targeting
   - [ ] Enemy resistances

6. **Fragment System**
   - [ ] Deterministic placement
   - [ ] Drought protection
   - [ ] Combination logic
   - [ ] No duplicates enforcement

7. **Galaxy Navigation**
   - [ ] Hex grid math
   - [ ] Fuel cost calculation
   - [ ] War fog reveal
   - [ ] System selection

8. **Context Management**
   - [ ] Exchange tracking
   - [ ] Token estimation
   - [ ] Summarization triggers
   - [ ] Memory preservation

9. **Planet Validation**
   - [ ] Schema validator
   - [ ] Playability checker
   - [ ] Resource balance test
   - [ ] Auto-rejection

10. **Full Game Loop**
    - [ ] Mode switching
    - [ ] Input processing
    - [ ] GM communication
    - [ ] State updates
    - [ ] Error recovery

### Configuration Constants

All configuration values are defined in Section 19. No magic numbers in code.

### Test Coverage Requirements

- Unit tests for all utility functions
- Integration tests for GM communication
- End-to-end tests for critical paths
- Load tests for 100 concurrent users

---

## Appendix A: Complete Exploration Example

```
════════════════════════════════════
EXPLORATION MODE - HEDONIST STATION
════════════════════════════════════

[Green] Your ship's lights illuminate Hedonist Station's docking 
ring. Through the viewport, you see bodies frozen in orgasmic 
death—a mass suicide during what looks like an orgy. The station's 
neon still flickers: "ALL PLEASURES, ALL SPECIES, NO LIMITS."

[Blue] ECHO: "Bio-scans show synthetic signatures still active in 
the Red Rooms. They're... Christ, their arousal protocols are stuck 
in a loop. They've been fucking corpses for decades."

[White] "Let's get this over with. Head to the Red Rooms."

[Green] You navigate through corridors littered with used nerve 
stims and dried fluids. The Red Rooms door is painted with blood—
real blood—in the shape of spread legs. Inside, a synthetic 
woman hangs from neural cables, her body twitching.

[Purple] SYNTHETIC: "Customer... detected. Would you like... the 
girlfriend experience? The rape fantasy? I can be anything. I can 
feel everything. Please. Please. Please."

[White] "I need information about fragment Beta-7."

[Purple] SYNTHETIC: "Information costs... sensation. Hurt me. 
Make me feel something real. The fragment is inside me. Cut it 
out. Cut me open. I want to watch."

[Blue] ECHO: "She's not lying. The fragment is surgically 
implanted in her chest cavity. You'll need to... extract it."

[White] "Use the plasma torch to cut her open carefully."

[JSON Response Hidden]
{
  "effects": {
    "fragment_found": "ship.beta7",
    "items_gained": ["fragment_ship_beta7"]
  },
  "creativity": "standard",
  "tags": ["horror", "sexual", "discovery"]
}

[Green] You ignite the plasma torch. The synthetic spreads her 
arms wide, moaning as the torch cuts through synthetic skin. 
Black fluid leaks out. She screams—not in pain, but in ecstasy. 
Inside her chest cavity, where a heart should be, a data crystal 
pulses with red light. You extract it, covered in gore.

[Yellow] [+1 FRAGMENT: Ship Coordinate Beta-7]
[Yellow] [Fragment Collection: 5/7 Ship Coordinates]

[Blue] ECHO: "Two more fragments and we can find that ship. Let's 
get the fuck out of here before I need therapy."

════════════════════════════════════
RETURNING TO SHIP - AUTO-SAVE COMPLETE
════════════════════════════════════
```

---

## Appendix B: Quick Reference

### Commands
```
EXPLORATION MODE:
/inventory - Check equipment
/health - Check health status  
/fragments - View collection
/return - Back to ship
/help - Show all commands
/map - Current location
/echo - Talk to ECHO

COMBAT CREATIVITY:
"poor" = 0.75x damage
"standard" = 1.0x damage
"clever" = 1.25x damage
"brilliant" = 1.5x damage
```

### Death Recovery
```
ALL DEATHS → Reload last save
Save points:
- Return to ship
- Enter new system
- Find fragment
- Major victory
```

### Resource Costs
```
Travel: Math.ceil(distance) fuel
Hull repair (25%): 5 materials
Ship restoration: 50+ materials
Fuel tank upgrade: 10 materials
No emergency fuel generation
```

---

## Conclusion

**Echoes of Earth** pushes the boundaries of AI-driven interactive fiction by combining mature themes with innovative dual-mode gameplay. Through 99 unique worlds, players discover humanity's darkest potentials while questioning whether Earth deserves salvation.

The game maintains a harsh but fair difficulty curve with no safety nets, forcing meaningful resource decisions. The fragment system drives exploration while the GM system provides unprecedented narrative freedom within Gemini's capabilities.

Every system is designed for clarity and implementation efficiency. The technical specifications eliminate ambiguity, allowing development to proceed without guesswork.

**Welcome to the Medusa Galaxy.**
**Earth is 2.5 million light-years away.**
**The monsters are much closer.**

---

*End of Game Design Document v9.0*
*Production Ready*
*99 Planets | 50 Fragments | No Limits (Within AI Boundaries)*
*Powered by Gemini 2.0 Flash*
*Development Time: 20 weeks*
*Target Platform: Desktop Web*
*Distribution: itch.io*