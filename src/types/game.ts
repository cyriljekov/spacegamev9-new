// Core game types
export interface HexCoordinate {
  q: number;
  r: number;
}

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
  seed: number;
}

export interface Inventory {
  weapons: WeaponType[];
  currentWeapon: WeaponType;
  items: string[];
  maxSlots: number;
}

export interface WeaponType {
  name: string;
  damage: number;
  type: string;
  special?: string;
}

export interface GMResponse {
  narration: string;
  effects: {
    player_health_delta?: number;
    enemy_damage?: { id: string; damage: number }[];
    items_gained?: string[];
    items_lost?: string[];
    materials_delta?: number;
    fuel_delta?: number;
    fragment_found?: string;
    location_state?: Record<string, any>;
    status_effects?: string[];
  };
  creativity?: 'poor' | 'standard' | 'clever' | 'brilliant';
  tags?: string[];
}
