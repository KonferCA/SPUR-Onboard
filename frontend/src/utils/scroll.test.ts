import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    scrollToWithOffset,
    isElementInView,
    isAtEndOfPage,
} from '@/utils/scroll';

describe('Scroll Utilities', () => {
    describe('scrollToWithOffset', () => {
        beforeEach(() => {
            // Mock window.scrollTo
            window.scrollTo = vi.fn();

            // Mock Element.getBoundingClientRect
            Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
                top: 100,
                bottom: 200,
                left: 0,
                right: 100,
            });

            // Mock document.documentElement.scrollTop
            Object.defineProperty(document.documentElement, 'scrollTop', {
                configurable: true,
                get: vi.fn().mockReturnValue(50),
            });
        });

        it('should scroll with default offset type', () => {
            const mockElement = document.createElement('div');
            scrollToWithOffset(mockElement, 20);

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 130, // currentScrollPosition(50) + targetPosition(100) - offset(20)
                behavior: 'smooth',
            });
        });

        it('should scroll with "before" offset type', () => {
            const mockElement = document.createElement('div');
            scrollToWithOffset(mockElement, 20, 'before');

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 170, // currentScrollPosition(50) + targetPosition(100) + offset(20)
                behavior: 'smooth',
            });
        });

        it('should scroll with "after" offset type', () => {
            const mockElement = document.createElement('div');
            scrollToWithOffset(mockElement, 20, 'after');

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 130, // currentScrollPosition(50) + targetPosition(100) - offset(20)
                behavior: 'smooth',
            });
        });

        it('should handle zero offset', () => {
            const mockElement = document.createElement('div');
            scrollToWithOffset(mockElement, 0);

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 150, // currentScrollPosition(50) + targetPosition(100) - offset(0)
                behavior: 'smooth',
            });
        });
    });

    describe('isElementInView', () => {
        beforeEach(() => {
            // Mock window dimensions
            Object.defineProperty(window, 'innerHeight', {
                value: 800,
                configurable: true,
            });
            Object.defineProperty(window, 'innerWidth', {
                value: 1200,
                configurable: true,
            });
        });

        it('should return false for null element', () => {
            expect(isElementInView(null)).toBe(false);
        });

        it('should return true for element in view', () => {
            const mockElement = document.createElement('div');
            mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
                top: 100,
                bottom: 300,
                left: 100,
                right: 300,
            });

            expect(isElementInView(mockElement)).toBe(true);
        });

        it('should return false for element completely above viewport', () => {
            const mockElement = document.createElement('div');
            mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
                top: -200,
                bottom: -50,
                left: 100,
                right: 300,
            });

            expect(isElementInView(mockElement)).toBe(false);
        });
    });

    describe('isAtEndOfPage', () => {
        beforeEach(() => {
            // Mock document dimensions
            Object.defineProperty(document.documentElement, 'offsetHeight', {
                value: 1500,
                configurable: true,
            });

            // Mock window dimensions and scroll position
            Object.defineProperty(window, 'innerHeight', {
                value: 800,
                configurable: true,
            });
            Object.defineProperty(window, 'scrollY', {
                configurable: true,
                get: vi.fn(),
            });
        });

        it('should return true when at end of page', () => {
            vi.spyOn(window, 'scrollY', 'get').mockReturnValue(700);
            expect(isAtEndOfPage()).toBe(true);
        });

        it('should return false when not at end of page', () => {
            vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
            expect(isAtEndOfPage()).toBe(false);
        });
    });
});

