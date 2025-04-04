/*
 *
 * @desc Central configuration for route availability across the application
 *
 */
export const AVAILABLE_ROUTES = {
    // main routes
    '/user/home': true,
    '/user/dashboard': true,
    '/user/browse': true,
    '/user/resources': false,

    // investor routes
    '/user/investor/investments': false,
    '/user/investor/statistics': false,

    // admin routes
    '/admin/dashboard': false,
    '/admin/settings/permissions': true,
    '/admin/projects': false,

    // settings and support
    '/user/settings/profile': true,
    '/user/settings/wallet': true,
    '/user/support': false,
};

/*
 *
 * @desc Check if a route is available for navigation
 *
 * @param path The path to check availability for
 *
 * @returns Boolean indicating if the path is available
 *
 */
export const isRouteAvailable = (path: string): boolean => {
    // check direct routes
    if (path in AVAILABLE_ROUTES) {
        return AVAILABLE_ROUTES[path as keyof typeof AVAILABLE_ROUTES];
    }

    // check parent routes for subroutes
    const parentRoute = Object.keys(AVAILABLE_ROUTES).find(
        (route) => path.startsWith(route) && path.charAt(route.length) === '/'
    );

    if (parentRoute) {
        return AVAILABLE_ROUTES[parentRoute as keyof typeof AVAILABLE_ROUTES];
    }

    // default to available if no match found
    return true;
};
