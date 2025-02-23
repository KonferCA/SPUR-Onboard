import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRandomId } from '../useRandomId';

describe('Test useRandomId Hook', () => {
    it('should generate a random id', () => {
        const { result } = renderHook(() => useRandomId());
        expect(result.current).toBeTruthy();
        expect(typeof result.current).toBe('string');
        expect(result.current.length).toBe(8);
    });

    it('should prepend the prefix to the id', () => {
        const prefix = 'test-';
        const { result } = renderHook(() => useRandomId(prefix));
        expect(result.current.startsWith(prefix)).toBeTruthy();
        expect(result.current.length).toBe(prefix.length + 8);
    });

    it('should maintain the id between re-renders', () => {
        const { result, rerender } = renderHook(() => useRandomId());
        const first = result.current;
        rerender();
        expect(first).toEqual(result.current);
    });

    it('should generate different ids for different hook instances', () => {
        const { result: result1 } = renderHook(() => useRandomId());
        const { result: result2 } = renderHook(() => useRandomId());

        expect(result1.current).not.toBe(result2.current);
    });

    it('should generate new id when prefix changes', () => {
        const { result, rerender } = renderHook(
            (props) => useRandomId(props.prefix),
            { initialProps: { prefix: 'test1-' } }
        );
        const firstId = result.current;
        rerender({ prefix: 'test2-' });
        expect(result.current).not.toBe(firstId);
        expect(result.current.startsWith('test2-')).toBe(true);
    });
});
