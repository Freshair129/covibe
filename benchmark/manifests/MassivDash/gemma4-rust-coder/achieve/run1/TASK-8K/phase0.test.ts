// Phase0 test for TASK-8K benchmark metrics
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read and parse JSON manually to avoid Vite's strict JSON import
const metricsPath = resolve(__dirname, 'metrics.json');
const metrics = JSON.parse(readFileSync(metricsPath, 'utf-8'));

// Helper to parse ISO timestamp or HH:MM:SS into seconds
const parseTime = (t: string): number => {
  // ISO format: 2026-05-27T00:46:53.739Z
  if (t.includes('T')) {
    return new Date(t).getTime() / 1000;
  }
  // HH:MM:SS format
  const parts = t.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

test('metrics.json is valid JSON and parseable', () => {
  expect(metrics).toBeDefined();
  expect(typeof metrics).toBe('object');
});

test('metrics.json has required performance fields', () => {
  const requiredKeys = [
    'tokens_per_second', 'start_time', 'end_time', 'total_time',
    'quality_metrics', 'quality_score'
  ];
  requiredKeys.forEach(k => expect(metrics).toHaveProperty(k));
});

test('tokens_per_second is positive', () => {
  expect(metrics.tokens_per_second).toBeGreaterThan(0);
});

test('quality_score is between 0 and 1', () => {
  expect(metrics.quality_score).toBeGreaterThanOrEqual(0);
  expect(metrics.quality_score).toBeLessThanOrEqual(1);
});

test('quality_metrics equals PASS', () => {
  expect(metrics.quality_metrics).toBe('PASS');
});

test('total_time matches start/end timestamps (±2s tolerance)', () => {
  const startSec = parseTime(metrics.start_time);
  const endSec = parseTime(metrics.end_time);
  const elapsed = endSec - startSec;
  expect(Math.abs(elapsed - metrics.total_time)).toBeLessThanOrEqual(2);
});

test('context_length is a positive integer', () => {
  expect(metrics.context_length).toBeGreaterThan(0);
  expect(Number.isInteger(metrics.context_length)).toBe(true);
});

test('token counts are non-negative integers', () => {
  for (const key of ['input_tokens', 'output_tokens', 'total_tokens']) {
    if (metrics[key] !== undefined) {
      expect(metrics[key]).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(metrics[key])).toBe(true);
    }
  }
});

test('benchmark metadata is present if benchmark object exists', () => {
  if (metrics.benchmark) {
    expect(metrics.benchmark).toHaveProperty('model');
    expect(metrics.benchmark).toHaveProperty('task');
    expect(typeof metrics.benchmark.model).toBe('string');
  }
});
