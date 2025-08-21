import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { GeminiService } from '../geminiService';
import { ContextManager } from '../contextManager';

// Mock the Gemini API
global.fetch = mock((url: string, options: any) => {
  if (url.includes('gemini')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                effects: {
                  damage_taken: 10,
                  resources_gained: { materials: 5 },
                  fragment_found: null,
                  combat_resolved: true
                },
                narration: "You successfully defeat the creature."
              })
            }]
          }
        }]
      })
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

describe('Gemini Service Integration', () => {
  let geminiService: GeminiService;
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
    geminiService = new GeminiService();
  });

  describe('processPlayerAction', () => {
    test('processes combat action successfully', async () => {
      const planetContext = {
        name: 'Test Planet',
        type: 'hostile',
        atmosphere: 'toxic',
        threats: ['alien creatures']
      };

      const result = await geminiService.processPlayerAction(
        'attack the creature',
        planetContext,
        contextManager
      );

      expect(result).toHaveProperty('effects');
      expect(result).toHaveProperty('narration');
      expect(result.effects.damage_taken).toBe(10);
      expect(result.effects.combat_resolved).toBe(true);
    });

    test('handles API errors gracefully', async () => {
      // Mock API failure
      global.fetch = mock(() => Promise.reject(new Error('API Error')));

      const result = await geminiService.processPlayerAction(
        'explore',
        { name: 'Test Planet' },
        contextManager
      );

      // Should return fallback response
      expect(result.narration).toContain('continue your exploration');
      expect(result.effects).toEqual({});
    });

    test('retries on failure', async () => {
      let attempts = 0;
      global.fetch = mock(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    effects: {},
                    narration: "Success after retries"
                  })
                }]
              }
            }]
          })
        });
      });

      const result = await geminiService.processPlayerAction(
        'test',
        { name: 'Test Planet' },
        contextManager
      );

      expect(attempts).toBe(3);
      expect(result.narration).toBe("Success after retries");
    });

    test('validates response schema', async () => {
      // Mock invalid response
      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: "Invalid JSON"
              }]
            }
          }]
        })
      }));

      const result = await geminiService.processPlayerAction(
        'test',
        { name: 'Test Planet' },
        contextManager
      );

      // Should return fallback for invalid response
      expect(result.effects).toEqual({});
      expect(result.narration).toBeTruthy();
    });
  });

  describe('API Key Rotation', () => {
    test('rotates through API keys on rate limit', async () => {
      let keyIndex = 0;
      const apiKeys = [
        'key1', 'key2', 'key3', 'key4',
        'key5', 'key6', 'key7', 'key8'
      ];

      global.fetch = mock((url: string) => {
        if (url.includes(apiKeys[keyIndex])) {
          keyIndex = (keyIndex + 1) % apiKeys.length;
          return Promise.resolve({
            ok: false,
            status: 429, // Rate limit
            json: () => Promise.resolve({})
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    effects: {},
                    narration: `Used key ${keyIndex}`
                  })
                }]
              }
            }]
          })
        });
      });

      // Should rotate through keys on rate limit
      await geminiService.processPlayerAction(
        'test',
        { name: 'Test Planet' },
        contextManager
      );

      expect(keyIndex).toBeGreaterThan(0);
    });
  });

  describe('Context Management Integration', () => {
    test('adds action to context', async () => {
      const initialCount = contextManager.getRecentContext(5).length;

      await geminiService.processPlayerAction(
        'explore the ruins',
        { name: 'Ancient Planet' },
        contextManager
      );

      const newCount = contextManager.getRecentContext(5).length;
      expect(newCount).toBe(initialCount + 1);
    });

    test('includes context in API request', async () => {
      // Add some context
      contextManager.addEntry('Previous action', 'Previous result');

      let requestBody: any;
      global.fetch = mock((url: string, options: any) => {
        requestBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    effects: {},
                    narration: "Response with context"
                  })
                }]
              }
            }]
          })
        });
      });

      await geminiService.processPlayerAction(
        'continue exploring',
        { name: 'Test Planet' },
        contextManager
      );

      // Check that context was included in request
      expect(requestBody.contents).toBeTruthy();
      expect(requestBody.contents.length).toBeGreaterThan(1);
    });

    test('handles context overflow', async () => {
      // Fill context to near limit
      for (let i = 0; i < 1000; i++) {
        contextManager.addEntry(
          `Action ${i}`,
          `Very long result that contains a lot of text to fill up the context window quickly...`.repeat(100)
        );
      }

      // Should trigger summarization
      const shouldSummarize = contextManager.shouldSummarize();
      expect(shouldSummarize).toBe(true);

      // Should still process action despite full context
      const result = await geminiService.processPlayerAction(
        'test',
        { name: 'Test Planet' },
        contextManager
      );

      expect(result).toHaveProperty('narration');
    });
  });

  describe('Combat Quality Assessment', () => {
    test('assesses combat action quality', async () => {
      const qualities = ['poor', 'standard', 'clever', 'brilliant'];
      
      for (const quality of qualities) {
        global.fetch = mock(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    effects: {
                      combat_quality: quality,
                      damage_multiplier: quality === 'brilliant' ? 2.0 : 1.0
                    },
                    narration: `A ${quality} combat action`
                  })
                }]
              }
            }]
          })
        }));

        const result = await geminiService.processPlayerAction(
          'creative combat action',
          { name: 'Combat Planet' },
          contextManager
        );

        expect(result.effects.combat_quality).toBe(quality);
      }
    });
  });
});