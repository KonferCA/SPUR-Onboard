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
    const isInView =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
            (window.innerWidth || document.documentElement.clientWidth);
    return isInView;
}
