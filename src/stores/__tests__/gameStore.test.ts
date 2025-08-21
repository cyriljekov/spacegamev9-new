import { describe, test, expect, beforeEach } from 'bun:test';
import { useGameStore } from '../gameStore';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      gameState: 'menu',
      currentMode: 'ship',
      player: {
        health: 100,
        maxHealth: 100,
        fuel: 100,
        materials: 0,
        hullIntegrity: 100,
        inventory: [],
        fragments: new Set(),
        currentSystemId: 'system-1',
        currentPlanetId: null,
        visitedPlanets: new Set()
      },
      galaxy: null,
      currentSaveSlot: null,
      settings: {
        textSpeed: 'normal',
        fontSize: 'medium',
        soundEnabled: false,
        autoSave: true
      }
    });
  });

  describe('Fragment Collection', () => {
    test('adds fragments without duplicates', () => {
      const store = useGameStore.getState();
      
      store.collectFragment({ id: 'fragment-1', type: 'ship' });
      expect(store.player.fragments.size).toBe(1);
      
      // Try to add same fragment again
      store.collectFragment({ id: 'fragment-1', type: 'ship' });
      expect(store.player.fragments.size).toBe(1); // Should still be 1
    });

    test('tracks different fragment types', () => {
      const store = useGameStore.getState();
      
      store.collectFragment({ id: 'ship-1', type: 'ship' });
      store.collectFragment({ id: 'gate-1', type: 'gate' });
      store.collectFragment({ id: 'truth-1', type: 'truth' });
      
      expect(store.player.fragments.size).toBe(3);
      
      const fragments = Array.from(store.player.fragments);
      expect(fragments).toContain('ship-1');
      expect(fragments).toContain('gate-1');
      expect(fragments).toContain('truth-1');
    });

    test('prevents collecting more than 50 fragments', () => {
      const store = useGameStore.getState();
      
      // Add 50 fragments
      for (let i = 1; i <= 50; i++) {
        store.collectFragment({ id: `fragment-${i}`, type: 'ship' });
      }
      
      expect(store.player.fragments.size).toBe(50);
      
      // Try to add 51st fragment
      store.collectFragment({ id: 'fragment-51', type: 'ship' });
      expect(store.player.fragments.size).toBe(50); // Should still be 50
    });
  });

  describe('Resource Management', () => {
    test('consumes fuel correctly', () => {
      const store = useGameStore.getState();
      
      store.consumeFuel(10);
      expect(store.player.fuel).toBe(90);
      
      store.consumeFuel(50);
      expect(store.player.fuel).toBe(40);
    });

    test('prevents negative fuel', () => {
      const store = useGameStore.getState();
      
      store.consumeFuel(150); // Try to consume more than available
      expect(store.player.fuel).toBe(0);
    });

    test('adds resources correctly', () => {
      const store = useGameStore.getState();
      
      store.addResources({ fuel: 20, materials: 15 });
      expect(store.player.fuel).toBe(100); // Capped at max
      expect(store.player.materials).toBe(15);
    });

    test('repairs hull with materials', () => {
      const store = useGameStore.getState();
      store.player.hullIntegrity = 50;
      store.player.materials = 10;
      
      store.repairHull();
      expect(store.player.hullIntegrity).toBe(75); // +25%
      expect(store.player.materials).toBe(5); // -5 materials
    });

    test('prevents repair without materials', () => {
      const store = useGameStore.getState();
      store.player.hullIntegrity = 50;
      store.player.materials = 3; // Not enough
      
      store.repairHull();
      expect(store.player.hullIntegrity).toBe(50); // No change
      expect(store.player.materials).toBe(3); // No change
    });
  });

  describe('Combat System', () => {
    test('applies damage correctly', () => {
      const store = useGameStore.getState();
      
      store.takeDamage(20);
      expect(store.player.health).toBe(80);
      
      store.takeDamage(30);
      expect(store.player.health).toBe(50);
    });

    test('triggers death at 0 health', () => {
      const store = useGameStore.getState();
      
      store.takeDamage(100);
      expect(store.player.health).toBe(0);
      expect(store.gameState).toBe('dead');
    });

    test('prevents negative health', () => {
      const store = useGameStore.getState();
      
      store.takeDamage(150);
      expect(store.player.health).toBe(0);
    });

    test('heals correctly', () => {
      const store = useGameStore.getState();
      store.player.health = 50;
      
      store.heal(30);
      expect(store.player.health).toBe(80);
      
      store.heal(50);
      expect(store.player.health).toBe(100); // Capped at max
    });
  });

  describe('Navigation', () => {
    test('moves to new system', () => {
      const store = useGameStore.getState();
      
      store.moveToSystem('system-2', 5);
      expect(store.player.currentSystemId).toBe('system-2');
      expect(store.player.fuel).toBe(95); // Consumed 5 fuel
      expect(store.player.hullIntegrity).toBe(98); // 2% degradation
    });

    test('prevents movement without fuel', () => {
      const store = useGameStore.getState();
      store.player.fuel = 3;
      
      store.moveToSystem('system-2', 5);
      expect(store.player.currentSystemId).toBe('system-1'); // No movement
      expect(store.player.fuel).toBe(3); // No consumption
    });

    test('lands on planet', () => {
      const store = useGameStore.getState();
      
      store.landOnPlanet('planet-1');
      expect(store.player.currentPlanetId).toBe('planet-1');
      expect(store.player.hullIntegrity).toBe(99); // 1% degradation
      expect(store.currentMode).toBe('exploration');
    });

    test('tracks visited planets', () => {
      const store = useGameStore.getState();
      
      store.landOnPlanet('planet-1');
      store.landOnPlanet('planet-2');
      store.landOnPlanet('planet-1'); // Visit again
      
      expect(store.player.visitedPlanets.size).toBe(2);
      expect(store.player.visitedPlanets.has('planet-1')).toBe(true);
      expect(store.player.visitedPlanets.has('planet-2')).toBe(true);
    });
  });

  describe('Victory Conditions', () => {
    test('detects ship route victory', () => {
      const store = useGameStore.getState();
      
      // Add 7 ship fragments
      for (let i = 1; i <= 7; i++) {
        store.collectFragment({ id: `ship-${i}`, type: 'ship' });
      }
      
      const canWin = store.checkVictoryCondition('ship');
      expect(canWin).toBe(true);
    });

    test('detects gate route victory', () => {
      const store = useGameStore.getState();
      
      // Add 10 gate fragments
      for (let i = 1; i <= 10; i++) {
        store.collectFragment({ id: `gate-${i}`, type: 'gate' });
      }
      
      const canWin = store.checkVictoryCondition('gate');
      expect(canWin).toBe(true);
    });

    test('detects truth route victory', () => {
      const store = useGameStore.getState();
      
      // Add 3 truth fragments
      for (let i = 1; i <= 3; i++) {
        store.collectFragment({ id: `truth-${i}`, type: 'truth' });
      }
      
      const canWin = store.checkVictoryCondition('truth');
      expect(canWin).toBe(true);
    });

    test('fails victory with insufficient fragments', () => {
      const store = useGameStore.getState();
      
      // Add only 5 ship fragments (need 7)
      for (let i = 1; i <= 5; i++) {
        store.collectFragment({ id: `ship-${i}`, type: 'ship' });
      }
      
      const canWin = store.checkVictoryCondition('ship');
      expect(canWin).toBe(false);
    });
  });

  describe('Death Conditions', () => {
    test('dies from hull breach', () => {
      const store = useGameStore.getState();
      store.player.hullIntegrity = 1;
      
      store.moveToSystem('system-2', 5); // Will reduce hull to 0
      expect(store.player.hullIntegrity).toBe(0);
      expect(store.gameState).toBe('dead');
    });

    test('dies from fuel exhaustion in space', () => {
      const store = useGameStore.getState();
      store.player.fuel = 0;
      store.player.currentPlanetId = null; // In space
      
      store.checkDeathConditions();
      expect(store.gameState).toBe('dead');
    });

    test('survives fuel exhaustion on planet', () => {
      const store = useGameStore.getState();
      store.player.fuel = 0;
      store.player.currentPlanetId = 'planet-1'; // On planet
      
      store.checkDeathConditions();
      expect(store.gameState).not.toBe('dead');
    });
  });
});