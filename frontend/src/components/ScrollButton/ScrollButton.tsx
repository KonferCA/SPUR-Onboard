import { useState, useEffect, useRef } from 'react';
import { BiChevronUp } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from '@/utils';

// scroll button component that toggles between scrolling to the top and bottom
export const ScrollButton = () => {
    const [isTopButton, setIsTopButton] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    // track if we're currently in a programmatic scroll
    const isProgrammaticScrolling = useRef(false);
    // store the target direction during programmatic scrolling
    const scrollingToDirection = useRef<'top' | 'bottom' | null>(null);

    // track scroll position to determine which way the button should point
    useEffect(() => {
        const handleScroll = () => {
            // get current scroll position and page dimensions
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const midway = documentHeight / 2;

            // determine if we're at the top, bottom, or somewhere in between
            const isAtTop = scrollY < 20; // small threshold for "at top"
            const isAtBottom = scrollY + viewportHeight >= documentHeight - 20; // small threshold for "at bottom"

            // only show the button if we're not at the top or bottom
            setIsVisible(!isAtTop && !isAtBottom);

            // only update the button direction if we're not in a programmatic scroll
            // (its weird to have it flip direction when scrolling programmatically)
            if (!isProgrammaticScrolling.current) {
                const isHalfwayDown = scrollY > midway;
                setIsTopButton(isHalfwayDown);
            } else {
                // if we've reached our destination, end the programmatic scrolling state
                if (
                    (scrollingToDirection.current === 'top' && isAtTop) ||
                    (scrollingToDirection.current === 'bottom' && isAtBottom)
                ) {
                    isProgrammaticScrolling.current = false;
                    scrollingToDirection.current = null;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // scroll to the top or bottom of the page
    const handleClick = () => {
        // set the programmatic scrolling flag
        isProgrammaticScrolling.current = true;

        if (isTopButton) {
            // scroll to top
            scrollingToDirection.current = 'top';
            scrollToTop();
        } else {
            // scroll to bottom
            scrollingToDirection.current = 'bottom';
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    type="button"
                    className="fixed bottom-8 right-8 z-40 p-3 w-16 h-16 rounded-full bg-gray-700 text-white opacity-70 hover:opacity-90 shadow-lg transition-opacity flex items-center justify-center"
                    onClick={handleClick}
                    aria-label={
                        isTopButton ? 'Scroll to top' : 'Scroll to bottom'
                    }
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: isTopButton ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BiChevronUp className="w-10 h-10" />
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
