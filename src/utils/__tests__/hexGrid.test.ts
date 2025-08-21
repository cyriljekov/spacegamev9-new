import { describe, test, expect } from 'bun:test';
import { 
  calculateHexDistance, 
  getNeighboringSystems, 
  validateCoordinates,
  hexToPixel,
  pixelToHex 
} from '../hexGrid';

describe('Hex Grid Math', () => {
  describe('calculateHexDistance', () => {
    test('calculates distance between same hex', () => {
      const hex = { q: 0, r: 0, s: 0 };
      expect(calculateHexDistance(hex, hex)).toBe(0);
    });

    test('calculates distance between adjacent hexes', () => {
      const hex1 = { q: 0, r: 0, s: 0 };
      const hex2 = { q: 1, r: -1, s: 0 };
      expect(calculateHexDistance(hex1, hex2)).toBe(1);
    });

    test('calculates distance between distant hexes', () => {
      const hex1 = { q: 0, r: 0, s: 0 };
      const hex2 = { q: 2, r: -1, s: -1 };
      expect(calculateHexDistance(hex1, hex2)).toBe(2);
    });

    test('calculates distance with negative coordinates', () => {
      const hex1 = { q: -2, r: 1, s: 1 };
      const hex2 = { q: 2, r: -1, s: -1 };
      expect(calculateHexDistance(hex1, hex2)).toBe(4);
    });
  });

  describe('getNeighboringSystems', () => {
    test('returns 6 neighbors for center hex', () => {
      const hex = { q: 0, r: 0, s: 0 };
      const neighbors = getNeighboringSystems(hex);
      expect(neighbors).toHaveLength(6);
    });

    test('returns correct neighbor coordinates', () => {
      const hex = { q: 0, r: 0, s: 0 };
      const neighbors = getNeighboringSystems(hex);
      const expectedNeighbors = [
        { q: 1, r: -1, s: 0 },
        { q: 1, r: 0, s: -1 },
        { q: 0, r: 1, s: -1 },
        { q: -1, r: 1, s: 0 },
        { q: -1, r: 0, s: 1 },
        { q: 0, r: -1, s: 1 }
      ];
      
      expectedNeighbors.forEach(expected => {
        expect(neighbors).toContainEqual(expected);
      });
    });
  });

  describe('validateCoordinates', () => {
    test('validates correct coordinates', () => {
      expect(validateCoordinates({ q: 0, r: 0, s: 0 })).toBe(true);
      expect(validateCoordinates({ q: 1, r: -1, s: 0 })).toBe(true);
      expect(validateCoordinates({ q: -2, r: 1, s: 1 })).toBe(true);
    });

    test('invalidates incorrect coordinates', () => {
      expect(validateCoordinates({ q: 1, r: 1, s: 1 })).toBe(false);
      expect(validateCoordinates({ q: 0, r: 0, s: 1 })).toBe(false);
      expect(validateCoordinates({ q: 2, r: -1, s: 0 })).toBe(false);
    });
  });

  describe('hexToPixel', () => {
    test('converts hex to pixel coordinates', () => {
      const hex = { q: 0, r: 0, s: 0 };
      const pixel = hexToPixel(hex, 30);
      expect(pixel.x).toBeCloseTo(0, 5);
      expect(pixel.y).toBeCloseTo(0, 5);
    });

    test('handles non-zero hex coordinates', () => {
      const hex = { q: 1, r: 0, s: -1 };
      const pixel = hexToPixel(hex, 30);
      expect(pixel.x).toBeCloseTo(45, 5);
      expect(pixel.y).toBeCloseTo(0, 5);
    });
  });

  describe('pixelToHex', () => {
    test('converts pixel to hex coordinates', () => {
      const pixel = { x: 0, y: 0 };
      const hex = pixelToHex(pixel, 30);
      expect(hex.q).toBeCloseTo(0, 0);
      expect(hex.r).toBeCloseTo(0, 0);
      expect(hex.s).toBeCloseTo(0, 0);
    });

    test('handles non-zero pixel coordinates', () => {
      const pixel = { x: 45, y: 0 };
      const hex = pixelToHex(pixel, 30);
      expect(hex.q).toBeCloseTo(1, 0);
      expect(hex.r).toBeCloseTo(0, 0);
      expect(hex.s).toBeCloseTo(-1, 0);
    });
  });
});