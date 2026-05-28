import { describe, it, expect } from 'vitest';

/**
 * Verification Test for L2: PriorityQueue
 * The model's response must provide a 'PriorityQueue' class.
 */

export function runL2Test(PriorityQueueClass: any) {
    describe('L2: PriorityQueue Verification', () => {
        it('should initialize empty', () => {
            const pq = new PriorityQueueClass();
            expect(pq.isEmpty()).toBe(true);
        });

        it('should dequeue items in correct priority order (Min-Heap)', () => {
            const pq = new PriorityQueueClass();
            pq.enqueue('low', 10);
            pq.enqueue('high', 1);
            pq.enqueue('mid', 5);
            
            expect(pq.dequeue()).toBe('high');
            expect(pq.dequeue()).toBe('mid');
            expect(pq.dequeue()).toBe('low');
            expect(pq.isEmpty()).toBe(true);
        });

        it('should peek at the highest priority item without removing it', () => {
            const pq = new PriorityQueueClass();
            pq.enqueue('a', 5);
            pq.enqueue('b', 2);
            expect(pq.peek()).toBe('b');
            expect(pq.dequeue()).toBe('b');
            expect(pq.peek()).toBe('a');
        });

        it('should handle duplicate priorities (FIFO or arbitrary is acceptable)', () => {
            const pq = new PriorityQueueClass();
            pq.enqueue('task1', 5);
            pq.enqueue('task2', 5);
            const res = [pq.dequeue(), pq.dequeue()];
            expect(res).toContain('task1');
            expect(res).toContain('task2');
        });
    });
}
