import { describe, it, expect } from 'vitest';

/**
 * Verification Test for L1: DeepMerge
 * The model's response must provide a 'deepMerge' function.
 */

// Placeholder for model's code - will be injected during verification
// import { deepMerge } from './solution'; 

export function runL1Test(deepMerge: Function) {
    describe('L1: DeepMerge Verification', () => {
        it('should merge simple flat objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            const result = deepMerge(obj1, obj2);
            expect(result).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('should merge nested objects recursively', () => {
            const obj1 = { a: 1, b: { x: 10, z: 30 } };
            const obj2 = { b: { y: 20, z: 40 }, c: 3 };
            const result = deepMerge(obj1, obj2);
            expect(result).toEqual({ a: 1, b: { x: 10, y: 20, z: 40 }, c: 3 });
        });

        it('should replace arrays instead of merging them (Per Requirement)', () => {
            const obj1 = { list: [1, 2], a: 1 };
            const obj2 = { list: [3, 4], b: 2 };
            const result = deepMerge(obj1, obj2);
            expect(result.list).toEqual([3, 4]);
            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
        });

        it('should handle merging with an empty object', () => {
            const obj1 = { a: 1 };
            const obj2 = {};
            expect(deepMerge(obj1, obj2)).toEqual({ a: 1 });
            expect(deepMerge(obj2, obj1)).toEqual({ a: 1 });
        });
    });
}
