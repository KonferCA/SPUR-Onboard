import { describe, it, expect } from 'vitest';
import { randomId } from './random';

describe('Test randomId Utility Function', () => {
    it('should return a random id of length 8', () => {
        const id = randomId();
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');
        expect(id.length).toBe(8);
    });

    it('should return a random id with prefix', () => {
        const prefix = 'test-';
        const id = randomId(prefix);
        expect(id.startsWith(prefix)).toBeTruthy();
        expect(id.length).toBe(prefix.length + 8);
    });
});
