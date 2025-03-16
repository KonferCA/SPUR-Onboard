import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollButton } from './ScrollButton';
import * as utils from '@/utils/scroll';

// mock scroll utilities
vi.mock('@/utils/scroll', () => ({
    scrollToTop: vi.fn(),
}));

describe('ScrollButton', () => {
    beforeEach(() => {
        // mock window.scrollto
        window.scrollTo = vi.fn();
        
        // reset state between tests
        vi.clearAllMocks();
        
        // mock window dimensions and scroll position
        Object.defineProperty(window, 'innerHeight', {
            value: 800,
            configurable: true,
            writable: true,
        });
        
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 2000,
            configurable: true,
            writable: true,
        });
        
        // default: not at top or bottom
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
    });
    
    it('should render the button when not at top or bottom', () => {
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // check button is rendered
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();
    });
    
    it('should not render the button when at the top', () => {
        // mock top of page
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // button should be hidden
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
    
    it('should not render the button when at the bottom', () => {
        // mock bottom of page
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1200);
        Object.defineProperty(window, 'innerHeight', { value: 800 });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000 });
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // button should be hidden
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
    
    it('should show scroll-to-bottom button when in top half of page', () => {
        // mock top half
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // should show bottom arrow
        expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();
    });
    
    it('should show scroll-to-top button when in bottom half of page', () => {
        // mock bottom half
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1100);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // should show top arrow
        expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument();
    });
    
    it('should call scrollToTop when scroll-to-top button is clicked', () => {
        // mock bottom half
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1100);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // click button
        fireEvent.click(screen.getByRole('button'));
        
        // should call scrolltotop
        expect(utils.scrollToTop).toHaveBeenCalled();
    });
    
    it('should call window.scrollTo when scroll-to-bottom button is clicked', () => {
        // mock top half
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // click button
        fireEvent.click(screen.getByRole('button'));
        
        // should call scrollto
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: expect.any(Number),
            behavior: 'smooth',
        });
    });
    
    it('should not flip direction during programmatic scrolling', async () => {
        // start in top half
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
        
        render(<ScrollButton />);
        
        // force scroll event
        fireEvent.scroll(window);
        
        // should be bottom arrow
        expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();
        
        // click button
        fireEvent.click(screen.getByRole('button'));
        
        // simulate scrolling past midpoint
        vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1100);
        fireEvent.scroll(window);
        
        // should still be bottom arrow during programmatic scroll
        expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();
    });
}); 