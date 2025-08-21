import { describe, test, expect, beforeEach } from 'bun:test';
import { 
  generateGalaxy, 
  generatePlanet, 
  distributeFragments,
  ensureFragmentDroughtProtection,
  validatePlanetSchema 
} from '../galaxyGenerator';
import seedrandom from 'seedrandom';

describe('Galaxy Generator', () => {
  describe('generateGalaxy', () => {
    test('generates correct number of systems', () => {
      const galaxy = generateGalaxy('test-seed');
      expect(galaxy.systems).toHaveLength(33);
    });

    test('generates correct total number of planets', () => {
      const galaxy = generateGalaxy('test-seed');
      const totalPlanets = galaxy.systems.reduce((sum, system) => 
        sum + system.planets.length, 0
      );
      expect(totalPlanets).toBe(99);
    });

    test('produces deterministic results with same seed', () => {
      const galaxy1 = generateGalaxy('fixed-seed');
      const galaxy2 = generateGalaxy('fixed-seed');
      
      expect(galaxy1.systems.length).toBe(galaxy2.systems.length);
      expect(galaxy1.systems[0].id).toBe(galaxy2.systems[0].id);
      expect(galaxy1.systems[0].planets[0].id).toBe(galaxy2.systems[0].planets[0].id);
    });

    test('produces different results with different seeds', () => {
      const galaxy1 = generateGalaxy('seed-1');
      const galaxy2 = generateGalaxy('seed-2');
      
      expect(galaxy1.systems[0].coordinates).not.toEqual(galaxy2.systems[0].coordinates);
    });

    test('all systems have valid hex coordinates', () => {
      const galaxy = generateGalaxy('test-seed');
      galaxy.systems.forEach(system => {
        const { q, r, s } = system.coordinates;
        expect(q + r + s).toBe(0);
      });
    });
  });

  describe('generatePlanet', () => {
    let rng: seedrandom.PRNG;

    beforeEach(() => {
      rng = seedrandom('test-seed');
    });

    test('generates planet with required fields', () => {
      const planet = generatePlanet('system-1', 0, rng);
      
      expect(planet).toHaveProperty('id');
      expect(planet).toHaveProperty('name');
      expect(planet).toHaveProperty('type');
      expect(planet).toHaveProperty('atmosphere');
      expect(planet).toHaveProperty('description');
      expect(planet).toHaveProperty('resources');
      expect(planet).toHaveProperty('threats');
      expect(planet).toHaveProperty('explored');
    });

    test('generates unique planet IDs', () => {
      const planet1 = generatePlanet('system-1', 0, rng);
      const planet2 = generatePlanet('system-1', 1, rng);
      
      expect(planet1.id).not.toBe(planet2.id);
    });

    test('initializes planets as unexplored', () => {
      const planet = generatePlanet('system-1', 0, rng);
      expect(planet.explored).toBe(false);
    });

    test('generates valid resource values', () => {
      const planet = generatePlanet('system-1', 0, rng);
      
      expect(planet.resources.materials).toBeGreaterThanOrEqual(0);
      expect(planet.resources.materials).toBeLessThanOrEqual(50);
      expect(planet.resources.fuel).toBeGreaterThanOrEqual(0);
      expect(planet.resources.fuel).toBeLessThanOrEqual(30);
    });
  });

  describe('distributeFragments', () => {
    test('distributes exactly 50 fragments', () => {
      const galaxy = generateGalaxy('test-seed');
      const withFragments = distributeFragments(galaxy, 'fragment-seed');
      
      let fragmentCount = 0;
      withFragments.systems.forEach(system => {
        system.planets.forEach(planet => {
          if (planet.fragment) fragmentCount++;
        });
      });
      
      expect(fragmentCount).toBe(50);
    });

    test('no duplicate fragment IDs', () => {
      const galaxy = generateGalaxy('test-seed');
      const withFragments = distributeFragments(galaxy, 'fragment-seed');
      
      const fragmentIds = new Set<string>();
      withFragments.systems.forEach(system => {
        system.planets.forEach(planet => {
          if (planet.fragment) {
            expect(fragmentIds.has(planet.fragment.id)).toBe(false);
            fragmentIds.add(planet.fragment.id);
          }
        });
      });
      
      expect(fragmentIds.size).toBe(50);
    });

    test('fragments distributed across all rings', () => {
      const galaxy = generateGalaxy('test-seed');
      const withFragments = distributeFragments(galaxy, 'fragment-seed');
      
      const ringFragments = { inner: 0, middle: 0, outer: 0 };
      
      withFragments.systems.forEach(system => {
        system.planets.forEach(planet => {
          if (planet.fragment) {
            const distance = Math.sqrt(
              system.coordinates.q ** 2 + 
              system.coordinates.r ** 2 + 
              system.coordinates.s ** 2
            );
            
            if (distance <= 2) ringFragments.inner++;
            else if (distance <= 4) ringFragments.middle++;
            else ringFragments.outer++;
          }
        });
      });
      
      expect(ringFragments.inner).toBeGreaterThan(0);
      expect(ringFragments.middle).toBeGreaterThan(0);
      expect(ringFragments.outer).toBeGreaterThan(0);
    });
  });

  describe('ensureFragmentDroughtProtection', () => {
    test('adds fragment after drought threshold', () => {
      const planets = [
        { id: 'p1', explored: true, fragment: null },
        { id: 'p2', explored: true, fragment: null },
        { id: 'p3', explored: true, fragment: null },
        { id: 'p4', explored: true, fragment: null },
        { id: 'p5', explored: false, fragment: null }
      ];
      
      const result = ensureFragmentDroughtProtection(planets as any, 'drought-seed');
      
      const hasNewFragment = result.some(p => p.fragment !== null);
      expect(hasNewFragment).toBe(true);
    });

    test('does not add fragment if recently found', () => {
      const planets = [
        { id: 'p1', explored: true, fragment: null },
        { id: 'p2', explored: true, fragment: { id: 'f1', type: 'ship' } },
        { id: 'p3', explored: true, fragment: null },
        { id: 'p4', explored: false, fragment: null }
      ];
      
      const result = ensureFragmentDroughtProtection(planets as any, 'drought-seed');
      
      const fragmentCount = result.filter(p => p.fragment !== null).length;
      expect(fragmentCount).toBe(1); // Only the original fragment
    });
  });

  describe('validatePlanetSchema', () => {
    test('validates correct planet schema', () => {
      const validPlanet = {
        id: 'planet-1',
        name: 'Test Planet',
        type: 'terrestrial',
        atmosphere: 'toxic',
        description: 'A test planet',
        resources: { materials: 10, fuel: 5 },
        threats: ['radiation'],
        explored: false
      };
      
      expect(validatePlanetSchema(validPlanet)).toBe(true);
    });

    test('invalidates missing required fields', () => {
      const invalidPlanet = {
        id: 'planet-1',
        name: 'Test Planet'
        // Missing other required fields
      };
      
      expect(validatePlanetSchema(invalidPlanet)).toBe(false);
    });

    test('invalidates incorrect field types', () => {
      const invalidPlanet = {
        id: 'planet-1',
        name: 'Test Planet',
        type: 'terrestrial',
        atmosphere: 'toxic',
        description: 'A test planet',
        resources: { materials: 'ten', fuel: 5 }, // Invalid type
        threats: ['radiation'],
        explored: false
      };
      
      expect(validatePlanetSchema(invalidPlanet as any)).toBe(false);
    });
  });
});