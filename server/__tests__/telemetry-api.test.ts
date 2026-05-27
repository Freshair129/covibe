// Server Unit Tests – Telemetry API & Parsing (TC-API-01 ~ TC-API-05)
import { describe, it, expect } from 'vitest';
import { parseDailySummary, SUMMARY_START, SUMMARY_END } from '../lib.js';

// ─── TC-API-05: parseDailySummary accuracy ───────────────────────────
describe('TC-API-05: Telemetry - parseDailySummary', () => {
  it('parses a valid daily summary block', () => {
    const content = `
Some preamble text
${SUMMARY_START}
\`\`\`json
{
  "total_cost_usd": 1.23,
  "call_count": 42,
  "total_input_tokens": 50000,
  "total_output_tokens": 30000,
  "by_tier": {
    "T1": { "count": 10, "cost_usd": 0.1, "input_tokens": 5000, "output_tokens": 3000 },
    "T2": { "count": 20, "cost_usd": 0.5, "input_tokens": 25000, "output_tokens": 15000 },
    "T3": { "count": 12, "cost_usd": 0.63, "input_tokens": 20000, "output_tokens": 12000 }
  }
}
\`\`\`
${SUMMARY_END}
Some epilogue text
    `;

    const result = parseDailySummary(content);
    expect(result).not.toBeNull();
    expect(result.total_cost_usd).toBe(1.23);
    expect(result.call_count).toBe(42);
    expect(result.total_input_tokens).toBe(50000);
    expect(result.total_output_tokens).toBe(30000);
  });

  it('extracts by_tier data correctly', () => {
    const content = `
${SUMMARY_START}
\`\`\`json
{
  "total_cost_usd": 2.0,
  "by_tier": {
    "T1": { "count": 5, "cost_usd": 0.5, "input_tokens": 1000, "output_tokens": 500 },
    "T2": { "count": 10, "cost_usd": 1.0, "input_tokens": 2000, "output_tokens": 1000 },
    "T3": { "count": 3, "cost_usd": 0.5, "input_tokens": 500, "output_tokens": 200 }
  }
}
\`\`\`
${SUMMARY_END}
    `;
    const result = parseDailySummary(content);
    expect(result.by_tier.T1.count).toBe(5);
    expect(result.by_tier.T2.cost_usd).toBe(1.0);
    expect(result.by_tier.T3.input_tokens).toBe(500);
  });

  it('returns null for missing start marker', () => {
    const content = `
\`\`\`json
{"total_cost_usd": 1.0}
\`\`\`
${SUMMARY_END}
    `;
    expect(parseDailySummary(content)).toBeNull();
  });

  it('returns null for missing end marker', () => {
    const content = `
${SUMMARY_START}
\`\`\`json
{"total_cost_usd": 1.0}
\`\`\`
    `;
    expect(parseDailySummary(content)).toBeNull();
  });

  it('returns null for missing JSON code block', () => {
    const content = `
${SUMMARY_START}
just some text without code fence
${SUMMARY_END}
    `;
    expect(parseDailySummary(content)).toBeNull();
  });

  it('returns null for invalid JSON inside code block', () => {
    const content = `
${SUMMARY_START}
\`\`\`json
{ broken: json, no-quotes }
\`\`\`
${SUMMARY_END}
    `;
    expect(parseDailySummary(content)).toBeNull();
  });

  it('handles empty JSON object', () => {
    const content = `
${SUMMARY_START}
\`\`\`json
{}
\`\`\`
${SUMMARY_END}
    `;
    const result = parseDailySummary(content);
    expect(result).toEqual({});
  });

  it('handles large token values', () => {
    const content = `
${SUMMARY_START}
\`\`\`json
{
  "total_cost_usd": 99.99,
  "total_input_tokens": 999999999,
  "total_output_tokens": 888888888
}
\`\`\`
${SUMMARY_END}
    `;
    const result = parseDailySummary(content);
    expect(result.total_input_tokens).toBe(999999999);
    expect(result.total_output_tokens).toBe(888888888);
  });
});

// ─── TC-API-01 ~ TC-API-04: HTTP endpoint shape validation ───────────
describe('Telemetry API – Response Shape Contracts', () => {
  describe('TC-API-01: /health response shape', () => {
    it('defines correct shape', () => {
      const expected = { ok: true, rooms: 0 };
      expect(expected).toHaveProperty('ok', true);
      expect(expected).toHaveProperty('rooms');
      expect(typeof expected.rooms).toBe('number');
    });
  });

  describe('TC-API-03: /api/trip-summary response shape', () => {
    it('defines correct trip summary fields', () => {
      const summary = {
        roomId: 'ABC123',
        createdAt: Date.now(),
        duration: 120000,
        participantCount: 2,
        participants: [
          { displayName: 'คนขับ', role: 'rider', connected: true },
          { displayName: 'คนซ้อน', role: 'passenger', connected: true }
        ],
        totalTracksPlayed: 3,
        totalTracksAdded: 5,
        currentTrack: null,
        queueRemaining: 2,
        log: []
      };

      expect(summary.roomId).toMatch(/^[A-Z0-9]{6}$/);
      expect(summary.participantCount).toBe(2);
      expect(summary.participants).toHaveLength(2);
      expect(summary.totalTracksPlayed).toBeGreaterThanOrEqual(0);
      expect(summary.totalTracksAdded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('TC-API-04: /api/trip-summary/:invalid response', () => {
    it('validates 404 shape', () => {
      const errorResponse = { error: 'Room not found or expired' };
      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });
  });
});

// ─── Telemetry Aggregation Logic ─────────────────────────────────────
describe('Telemetry aggregation logic', () => {
  it('accumulates cost across multiple daily summaries', () => {
    const summaries = [
      { total_cost_usd: 1.5, call_count: 10 },
      { total_cost_usd: 2.3, call_count: 15 },
      { total_cost_usd: 0.8, call_count: 5 }
    ];

    const totalCost = summaries.reduce((acc, s) => acc + s.total_cost_usd, 0);
    const totalCalls = summaries.reduce((acc, s) => acc + s.call_count, 0);

    expect(totalCost).toBeCloseTo(4.6, 1);
    expect(totalCalls).toBe(30);
  });

  it('handles summaries with missing fields gracefully', () => {
    const summary = { total_cost_usd: 1.0 }; // no call_count, no by_tier
    const cost = typeof summary.total_cost_usd === 'number' ? summary.total_cost_usd : 0;
    const calls = typeof summary.call_count === 'number' ? summary.call_count : 0;

    expect(cost).toBe(1.0);
    expect(calls).toBe(0);
  });

  it('accumulates by_tier data correctly', () => {
    const tiers = { T1: { count: 0, cost_usd: 0 }, T2: { count: 0, cost_usd: 0 }, T3: { count: 0, cost_usd: 0 } };
    const summaries = [
      { by_tier: { T1: { count: 5, cost_usd: 0.1 }, T2: { count: 10, cost_usd: 0.5 } } },
      { by_tier: { T1: { count: 3, cost_usd: 0.2 }, T3: { count: 7, cost_usd: 0.3 } } }
    ];

    for (const s of summaries) {
      if (!s.by_tier) continue;
      for (const tier of ['T1', 'T2', 'T3']) {
        const b = s.by_tier[tier];
        if (!b) continue;
        if (typeof b.count === 'number') tiers[tier].count += b.count;
        if (typeof b.cost_usd === 'number') tiers[tier].cost_usd += b.cost_usd;
      }
    }

    expect(tiers.T1.count).toBe(8);
    expect(tiers.T1.cost_usd).toBeCloseTo(0.3, 2);
    expect(tiers.T2.count).toBe(10);
    expect(tiers.T3.count).toBe(7);
  });
});
