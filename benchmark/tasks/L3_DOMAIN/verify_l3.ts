import { describe, it, expect } from 'vitest';

/**
 * Verification Test for L3: YTSync Logic
 * The model's response must provide a 'calculateCorrection' function.
 */

export function runL3Test(calculateCorrection: Function) {
    describe('L3: YTSync Logic Verification', () => {
        it('should return ignore for drift < 250ms', () => {
            expect(calculateCorrection(100)).toBe('ignore');
            expect(calculateCorrection(249)).toBe('ignore');
        });

        it('should return adjust_rate for drift between 250ms and 800ms', () => {
            expect(calculateCorrection(250)).toBe('adjust_rate');
            expect(calculateCorrection(500)).toBe('adjust_rate');
            expect(calculateCorrection(800)).toBe('adjust_rate');
        });

        it('should return seek for drift > 800ms', () => {
            expect(calculateCorrection(801)).toBe('seek');
            expect(calculateCorrection(2000)).toBe('seek');
        });
    });
}
