// utility library for smooth scrolling

export function scrollTo(target: HTMLElement) {
    target.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

export function scrollToWithOffset(target: HTMLElement, offset: number) {
    const targetPos = target.getBoundingClientRect().top;
    const offsetPosition = targetPos + window.screenY - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
    });
}

export function isElementInView(el: Element | null): boolean {
    if (!el) return false;
    const rect = el.getBoundingClientRect();

    const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
        window.innerWidth || document.documentElement.clientWidth;

    // element is considered in view as long as it's not completely outside the viewport
    const isNotCompletelyOutOfView =
        rect.bottom > 0 && // not completely above viewport
        rect.top < windowHeight && // not completely below viewport
        rect.right > 0 && // not completely to left of viewport
        rect.left < windowWidth; // not completely to right of viewport

    return isNotCompletelyOutOfView;
}

/*
 * Checks whether the current scroll position is at the bottom of the page.
 */
export function isAtEndOfPage(): boolean {
    const totalHeight = document.documentElement.offsetHeight;
    // Must round scrollY because it gives an small inaccurate decimal answer.
    const scrollPostition = window.innerHeight + Math.round(window.scrollY);
    return scrollPostition >= totalHeight;
}
