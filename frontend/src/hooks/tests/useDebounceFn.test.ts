import { renderHook, act } from '@testing-library/react';
import { vi, expect, beforeEach, afterEach, describe, it } from 'vitest';
import { useDebounceFn } from '@/hooks';

describe('useDebounceFn', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should debounce the callback function', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounceFn(callback, 500));
        const debouncedFn = result.current;

        // call the debounced function multiple times
        act(() => {
            debouncedFn('test1');
            debouncedFn('test2');
            debouncedFn('test3');
        });

        // callback should not have been called yet
        expect(callback).not.toHaveBeenCalled();

        // fast forward time by 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // callback should have been called once with the last value
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('test3');
    });

    it('should respect the delay parameter', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounceFn(callback, 1000));
        const debouncedFn = result.current;

        act(() => {
            debouncedFn('test');
        });

        // advance time by 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // callback should not have been called yet
        expect(callback).not.toHaveBeenCalled();

        // advance time by another 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // callback should have been called
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple parameters correctly', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebounceFn(callback, 500));
        const debouncedFn = result.current;

        act(() => {
            debouncedFn('test', 123, { foo: 'bar' });
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith('test', 123, { foo: 'bar' });
    });

    it('should clear timeout on unmount', () => {
        const callback = vi.fn();
        const { result, unmount } = renderHook(() =>
            useDebounceFn(callback, 500)
        );
        const debouncedFn = result.current;

        act(() => {
            debouncedFn('test');
        });

        // unmount before the delay
        unmount();

        // advance time
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // callback should not have been called
        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle dependencies changes correctly', () => {
        const callback = vi.fn();
        const deps = ['dep1'];
        const { result, rerender } = renderHook(
            ({ cb, dependencies }) => useDebounceFn(cb, 500, dependencies),
            {
                initialProps: { cb: callback, dependencies: deps },
            }
        );

        const firstDebouncedFn = result.current;

        // change dependencies
        deps[0] = 'dep2';
        rerender({ cb: callback, dependencies: deps });

        const secondDebouncedFn = result.current;

        // should be different functions due to dependency change
        expect(firstDebouncedFn).not.toBe(secondDebouncedFn);
    });

    it('should preserve the latest callback reference', () => {
        let capturedCallback;
        const TestComponent = () => {
            const callback = vi.fn();
            const debouncedFn = useDebounceFn(callback, 500);
            capturedCallback = callback;
            return debouncedFn;
        };

        const { result } = renderHook(() => TestComponent());
        const debouncedFn = result.current;

        act(() => {
            debouncedFn('test');
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(capturedCallback).toHaveBeenCalledWith('test');
    });
});
