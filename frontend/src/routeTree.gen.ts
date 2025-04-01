/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router';

// Import Routes

import { Route as rootRoute } from './pages/__root';
import { Route as SignupImport } from './pages/signup';
import { Route as SignoutImport } from './pages/signout';
import { Route as SigninImport } from './pages/signin';
import { Route as RegisterImport } from './pages/register';
import { Route as LogoutImport } from './pages/logout';
import { Route as LoginImport } from './pages/login';
import { Route as AuthImport } from './pages/auth';
import { Route as IndexImport } from './pages/index';
import { Route as UserIndexImport } from './pages/user/index';
import { Route as AdminIndexImport } from './pages/admin/index';
import { Route as UserAuthImport } from './pages/user/_auth';
import { Route as AdminAuthImport } from './pages/admin/_auth';
import { Route as UserAuthAppshellImport } from './pages/user/_auth/_appshell';
import { Route as AdminAuthAppshellImport } from './pages/admin/_auth/_appshell';
import { Route as UserAuthProjectNewImport } from './pages/user/_auth/project/new';
import { Route as UserAuthAppshellSettingsImport } from './pages/user/_auth/_appshell/settings';
import { Route as UserAuthAppshellProjectsImport } from './pages/user/_auth/_appshell/projects';
import { Route as UserAuthAppshellHomeImport } from './pages/user/_auth/_appshell/home';
import { Route as UserAuthAppshellDashboardImport } from './pages/user/_auth/_appshell/dashboard';
import { Route as AdminAuthAppshellDashboardImport } from './pages/admin/_auth/_appshell/dashboard';
import { Route as UserAuthAppshellSettingsIndexImport } from './pages/user/_auth/_appshell/settings/index';
import { Route as AdminAuthAppshellResourcesIndexImport } from './pages/admin/_auth/_appshell/resources/index';
import { Route as UserAuthProjectProjectIdViewImport } from './pages/user/_auth/project/$projectId/view';
import { Route as UserAuthProjectProjectIdFormImport } from './pages/user/_auth/project/$projectId/form';
import { Route as UserAuthAppshellSettingsWalletImport } from './pages/user/_auth/_appshell/settings/wallet';
import { Route as UserAuthAppshellSettingsProfileImport } from './pages/user/_auth/_appshell/settings/profile';
import { Route as AdminAuthProjectsProjectIdReviewImport } from './pages/admin/_auth/projects/$projectId.review';
import { Route as AdminAuthAppshellSettingsPermissionsImport } from './pages/admin/_auth/_appshell/settings/permissions';
import { Route as AdminAuthAppshellProjectsProjectIdOverviewImport } from './pages/admin/_auth/_appshell/projects/$projectId.overview';
import { Route as AdminAuthAppshellProjectsProjectIdDecisionImport } from './pages/admin/_auth/_appshell/projects/$projectId.decision';

// Create Virtual Routes

const UserImport = createFileRoute('/user')();
const AdminImport = createFileRoute('/admin')();

// Create/Update Routes

const UserRoute = UserImport.update({
    id: '/user',
    path: '/user',
    getParentRoute: () => rootRoute,
} as any);

const AdminRoute = AdminImport.update({
    id: '/admin',
    path: '/admin',
    getParentRoute: () => rootRoute,
} as any);

const SignupRoute = SignupImport.update({
    id: '/signup',
    path: '/signup',
    getParentRoute: () => rootRoute,
} as any);

const SignoutRoute = SignoutImport.update({
    id: '/signout',
    path: '/signout',
    getParentRoute: () => rootRoute,
} as any);

const SigninRoute = SigninImport.update({
    id: '/signin',
    path: '/signin',
    getParentRoute: () => rootRoute,
} as any);

const RegisterRoute = RegisterImport.update({
    id: '/register',
    path: '/register',
    getParentRoute: () => rootRoute,
} as any);

const LogoutRoute = LogoutImport.update({
    id: '/logout',
    path: '/logout',
    getParentRoute: () => rootRoute,
} as any);

const LoginRoute = LoginImport.update({
    id: '/login',
    path: '/login',
    getParentRoute: () => rootRoute,
} as any);

const AuthRoute = AuthImport.update({
    id: '/auth',
    path: '/auth',
    getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => rootRoute,
} as any);

const UserIndexRoute = UserIndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => UserRoute,
} as any);

const AdminIndexRoute = AdminIndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => AdminRoute,
} as any);

const UserAuthRoute = UserAuthImport.update({
    id: '/_auth',
    getParentRoute: () => UserRoute,
} as any);

const AdminAuthRoute = AdminAuthImport.update({
    id: '/_auth',
    getParentRoute: () => AdminRoute,
} as any);

const UserAuthAppshellRoute = UserAuthAppshellImport.update({
    id: '/_appshell',
    getParentRoute: () => UserAuthRoute,
} as any);

const AdminAuthAppshellRoute = AdminAuthAppshellImport.update({
    id: '/_appshell',
    getParentRoute: () => AdminAuthRoute,
} as any);

const UserAuthProjectNewRoute = UserAuthProjectNewImport.update({
    id: '/project/new',
    path: '/project/new',
    getParentRoute: () => UserAuthRoute,
} as any);

const UserAuthAppshellSettingsRoute = UserAuthAppshellSettingsImport.update({
    id: '/settings',
    path: '/settings',
    getParentRoute: () => UserAuthAppshellRoute,
} as any);

const UserAuthAppshellProjectsRoute = UserAuthAppshellProjectsImport.update({
    id: '/projects',
    path: '/projects',
    getParentRoute: () => UserAuthAppshellRoute,
} as any);

const UserAuthAppshellHomeRoute = UserAuthAppshellHomeImport.update({
    id: '/home',
    path: '/home',
    getParentRoute: () => UserAuthAppshellRoute,
} as any);

const UserAuthAppshellDashboardRoute = UserAuthAppshellDashboardImport.update({
    id: '/dashboard',
    path: '/dashboard',
    getParentRoute: () => UserAuthAppshellRoute,
} as any);

const AdminAuthAppshellDashboardRoute = AdminAuthAppshellDashboardImport.update(
    {
        id: '/dashboard',
        path: '/dashboard',
        getParentRoute: () => AdminAuthAppshellRoute,
    } as any
);

const UserAuthAppshellSettingsIndexRoute =
    UserAuthAppshellSettingsIndexImport.update({
        id: '/',
        path: '/',
        getParentRoute: () => UserAuthAppshellSettingsRoute,
    } as any);

const AdminAuthAppshellResourcesIndexRoute =
    AdminAuthAppshellResourcesIndexImport.update({
        id: '/resources/',
        path: '/resources/',
        getParentRoute: () => AdminAuthAppshellRoute,
    } as any);

const UserAuthProjectProjectIdViewRoute =
    UserAuthProjectProjectIdViewImport.update({
        id: '/project/$projectId/view',
        path: '/project/$projectId/view',
        getParentRoute: () => UserAuthRoute,
    } as any);

const UserAuthProjectProjectIdFormRoute =
    UserAuthProjectProjectIdFormImport.update({
        id: '/project/$projectId/form',
        path: '/project/$projectId/form',
        getParentRoute: () => UserAuthRoute,
    } as any);

const UserAuthAppshellSettingsWalletRoute =
    UserAuthAppshellSettingsWalletImport.update({
        id: '/wallet',
        path: '/wallet',
        getParentRoute: () => UserAuthAppshellSettingsRoute,
    } as any);

const UserAuthAppshellSettingsProfileRoute =
    UserAuthAppshellSettingsProfileImport.update({
        id: '/profile',
        path: '/profile',
        getParentRoute: () => UserAuthAppshellSettingsRoute,
    } as any);

const AdminAuthProjectsProjectIdReviewRoute =
    AdminAuthProjectsProjectIdReviewImport.update({
        id: '/projects/$projectId/review',
        path: '/projects/$projectId/review',
        getParentRoute: () => AdminAuthRoute,
    } as any);

const AdminAuthAppshellSettingsPermissionsRoute =
    AdminAuthAppshellSettingsPermissionsImport.update({
        id: '/settings/permissions',
        path: '/settings/permissions',
        getParentRoute: () => AdminAuthAppshellRoute,
    } as any);

const AdminAuthAppshellProjectsProjectIdOverviewRoute =
    AdminAuthAppshellProjectsProjectIdOverviewImport.update({
        id: '/projects/$projectId/overview',
        path: '/projects/$projectId/overview',
        getParentRoute: () => AdminAuthAppshellRoute,
    } as any);

const AdminAuthAppshellProjectsProjectIdDecisionRoute =
    AdminAuthAppshellProjectsProjectIdDecisionImport.update({
        id: '/projects/$projectId/decision',
        path: '/projects/$projectId/decision',
        getParentRoute: () => AdminAuthAppshellRoute,
    } as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
    interface FileRoutesByPath {
        '/': {
            id: '/';
            path: '/';
            fullPath: '/';
            preLoaderRoute: typeof IndexImport;
            parentRoute: typeof rootRoute;
        };
        '/auth': {
            id: '/auth';
            path: '/auth';
            fullPath: '/auth';
            preLoaderRoute: typeof AuthImport;
            parentRoute: typeof rootRoute;
        };
        '/login': {
            id: '/login';
            path: '/login';
            fullPath: '/login';
            preLoaderRoute: typeof LoginImport;
            parentRoute: typeof rootRoute;
        };
        '/logout': {
            id: '/logout';
            path: '/logout';
            fullPath: '/logout';
            preLoaderRoute: typeof LogoutImport;
            parentRoute: typeof rootRoute;
        };
        '/register': {
            id: '/register';
            path: '/register';
            fullPath: '/register';
            preLoaderRoute: typeof RegisterImport;
            parentRoute: typeof rootRoute;
        };
        '/signin': {
            id: '/signin';
            path: '/signin';
            fullPath: '/signin';
            preLoaderRoute: typeof SigninImport;
            parentRoute: typeof rootRoute;
        };
        '/signout': {
            id: '/signout';
            path: '/signout';
            fullPath: '/signout';
            preLoaderRoute: typeof SignoutImport;
            parentRoute: typeof rootRoute;
        };
        '/signup': {
            id: '/signup';
            path: '/signup';
            fullPath: '/signup';
            preLoaderRoute: typeof SignupImport;
            parentRoute: typeof rootRoute;
        };
        '/admin': {
            id: '/admin';
            path: '/admin';
            fullPath: '/admin';
            preLoaderRoute: typeof AdminImport;
            parentRoute: typeof rootRoute;
        };
        '/admin/_auth': {
            id: '/admin/_auth';
            path: '/admin';
            fullPath: '/admin';
            preLoaderRoute: typeof AdminAuthImport;
            parentRoute: typeof AdminRoute;
        };
        '/user': {
            id: '/user';
            path: '/user';
            fullPath: '/user';
            preLoaderRoute: typeof UserImport;
            parentRoute: typeof rootRoute;
        };
        '/user/_auth': {
            id: '/user/_auth';
            path: '/user';
            fullPath: '/user';
            preLoaderRoute: typeof UserAuthImport;
            parentRoute: typeof UserRoute;
        };
        '/admin/': {
            id: '/admin/';
            path: '/';
            fullPath: '/admin/';
            preLoaderRoute: typeof AdminIndexImport;
            parentRoute: typeof AdminImport;
        };
        '/user/': {
            id: '/user/';
            path: '/';
            fullPath: '/user/';
            preLoaderRoute: typeof UserIndexImport;
            parentRoute: typeof UserImport;
        };
        '/admin/_auth/_appshell': {
            id: '/admin/_auth/_appshell';
            path: '';
            fullPath: '/admin';
            preLoaderRoute: typeof AdminAuthAppshellImport;
            parentRoute: typeof AdminAuthImport;
        };
        '/user/_auth/_appshell': {
            id: '/user/_auth/_appshell';
            path: '';
            fullPath: '/user';
            preLoaderRoute: typeof UserAuthAppshellImport;
            parentRoute: typeof UserAuthImport;
        };
        '/admin/_auth/_appshell/dashboard': {
            id: '/admin/_auth/_appshell/dashboard';
            path: '/dashboard';
            fullPath: '/admin/dashboard';
            preLoaderRoute: typeof AdminAuthAppshellDashboardImport;
            parentRoute: typeof AdminAuthAppshellImport;
        };
        '/user/_auth/_appshell/dashboard': {
            id: '/user/_auth/_appshell/dashboard';
            path: '/dashboard';
            fullPath: '/user/dashboard';
            preLoaderRoute: typeof UserAuthAppshellDashboardImport;
            parentRoute: typeof UserAuthAppshellImport;
        };
        '/user/_auth/_appshell/home': {
            id: '/user/_auth/_appshell/home';
            path: '/home';
            fullPath: '/user/home';
            preLoaderRoute: typeof UserAuthAppshellHomeImport;
            parentRoute: typeof UserAuthAppshellImport;
        };
        '/user/_auth/_appshell/projects': {
            id: '/user/_auth/_appshell/projects';
            path: '/projects';
            fullPath: '/user/projects';
            preLoaderRoute: typeof UserAuthAppshellProjectsImport;
            parentRoute: typeof UserAuthAppshellImport;
        };
        '/user/_auth/_appshell/settings': {
            id: '/user/_auth/_appshell/settings';
            path: '/settings';
            fullPath: '/user/settings';
            preLoaderRoute: typeof UserAuthAppshellSettingsImport;
            parentRoute: typeof UserAuthAppshellImport;
        };
        '/user/_auth/project/new': {
            id: '/user/_auth/project/new';
            path: '/project/new';
            fullPath: '/user/project/new';
            preLoaderRoute: typeof UserAuthProjectNewImport;
            parentRoute: typeof UserAuthImport;
        };
        '/admin/_auth/_appshell/settings/permissions': {
            id: '/admin/_auth/_appshell/settings/permissions';
            path: '/settings/permissions';
            fullPath: '/admin/settings/permissions';
            preLoaderRoute: typeof AdminAuthAppshellSettingsPermissionsImport;
            parentRoute: typeof AdminAuthAppshellImport;
        };
        '/admin/_auth/projects/$projectId/review': {
            id: '/admin/_auth/projects/$projectId/review';
            path: '/projects/$projectId/review';
            fullPath: '/admin/projects/$projectId/review';
            preLoaderRoute: typeof AdminAuthProjectsProjectIdReviewImport;
            parentRoute: typeof AdminAuthImport;
        };
        '/user/_auth/_appshell/settings/profile': {
            id: '/user/_auth/_appshell/settings/profile';
            path: '/profile';
            fullPath: '/user/settings/profile';
            preLoaderRoute: typeof UserAuthAppshellSettingsProfileImport;
            parentRoute: typeof UserAuthAppshellSettingsImport;
        };
        '/user/_auth/_appshell/settings/wallet': {
            id: '/user/_auth/_appshell/settings/wallet';
            path: '/wallet';
            fullPath: '/user/settings/wallet';
            preLoaderRoute: typeof UserAuthAppshellSettingsWalletImport;
            parentRoute: typeof UserAuthAppshellSettingsImport;
        };
        '/user/_auth/project/$projectId/form': {
            id: '/user/_auth/project/$projectId/form';
            path: '/project/$projectId/form';
            fullPath: '/user/project/$projectId/form';
            preLoaderRoute: typeof UserAuthProjectProjectIdFormImport;
            parentRoute: typeof UserAuthImport;
        };
        '/user/_auth/project/$projectId/view': {
            id: '/user/_auth/project/$projectId/view';
            path: '/project/$projectId/view';
            fullPath: '/user/project/$projectId/view';
            preLoaderRoute: typeof UserAuthProjectProjectIdViewImport;
            parentRoute: typeof UserAuthImport;
        };
        '/admin/_auth/_appshell/resources/': {
            id: '/admin/_auth/_appshell/resources/';
            path: '/resources';
            fullPath: '/admin/resources';
            preLoaderRoute: typeof AdminAuthAppshellResourcesIndexImport;
            parentRoute: typeof AdminAuthAppshellImport;
        };
        '/user/_auth/_appshell/settings/': {
            id: '/user/_auth/_appshell/settings/';
            path: '/';
            fullPath: '/user/settings/';
            preLoaderRoute: typeof UserAuthAppshellSettingsIndexImport;
            parentRoute: typeof UserAuthAppshellSettingsImport;
        };
        '/admin/_auth/_appshell/projects/$projectId/decision': {
            id: '/admin/_auth/_appshell/projects/$projectId/decision';
            path: '/projects/$projectId/decision';
            fullPath: '/admin/projects/$projectId/decision';
            preLoaderRoute: typeof AdminAuthAppshellProjectsProjectIdDecisionImport;
            parentRoute: typeof AdminAuthAppshellImport;
        };
        '/admin/_auth/_appshell/projects/$projectId/overview': {
            id: '/admin/_auth/_appshell/projects/$projectId/overview';
            path: '/projects/$projectId/overview';
            fullPath: '/admin/projects/$projectId/overview';
            preLoaderRoute: typeof AdminAuthAppshellProjectsProjectIdOverviewImport;
            parentRoute: typeof AdminAuthAppshellImport;
        };
    }
}

// Create and export the route tree

interface AdminAuthAppshellRouteChildren {
    AdminAuthAppshellDashboardRoute: typeof AdminAuthAppshellDashboardRoute;
    AdminAuthAppshellSettingsPermissionsRoute: typeof AdminAuthAppshellSettingsPermissionsRoute;
    AdminAuthAppshellResourcesIndexRoute: typeof AdminAuthAppshellResourcesIndexRoute;
    AdminAuthAppshellProjectsProjectIdDecisionRoute: typeof AdminAuthAppshellProjectsProjectIdDecisionRoute;
    AdminAuthAppshellProjectsProjectIdOverviewRoute: typeof AdminAuthAppshellProjectsProjectIdOverviewRoute;
}

const AdminAuthAppshellRouteChildren: AdminAuthAppshellRouteChildren = {
    AdminAuthAppshellDashboardRoute: AdminAuthAppshellDashboardRoute,
    AdminAuthAppshellSettingsPermissionsRoute:
        AdminAuthAppshellSettingsPermissionsRoute,
    AdminAuthAppshellResourcesIndexRoute: AdminAuthAppshellResourcesIndexRoute,
    AdminAuthAppshellProjectsProjectIdDecisionRoute:
        AdminAuthAppshellProjectsProjectIdDecisionRoute,
    AdminAuthAppshellProjectsProjectIdOverviewRoute:
        AdminAuthAppshellProjectsProjectIdOverviewRoute,
};

const AdminAuthAppshellRouteWithChildren =
    AdminAuthAppshellRoute._addFileChildren(AdminAuthAppshellRouteChildren);

interface AdminAuthRouteChildren {
    AdminAuthAppshellRoute: typeof AdminAuthAppshellRouteWithChildren;
    AdminAuthProjectsProjectIdReviewRoute: typeof AdminAuthProjectsProjectIdReviewRoute;
}

const AdminAuthRouteChildren: AdminAuthRouteChildren = {
    AdminAuthAppshellRoute: AdminAuthAppshellRouteWithChildren,
    AdminAuthProjectsProjectIdReviewRoute:
        AdminAuthProjectsProjectIdReviewRoute,
};

const AdminAuthRouteWithChildren = AdminAuthRoute._addFileChildren(
    AdminAuthRouteChildren
);

interface AdminRouteChildren {
    AdminAuthRoute: typeof AdminAuthRouteWithChildren;
    AdminIndexRoute: typeof AdminIndexRoute;
}

const AdminRouteChildren: AdminRouteChildren = {
    AdminAuthRoute: AdminAuthRouteWithChildren,
    AdminIndexRoute: AdminIndexRoute,
};

const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);

interface UserAuthAppshellSettingsRouteChildren {
    UserAuthAppshellSettingsProfileRoute: typeof UserAuthAppshellSettingsProfileRoute;
    UserAuthAppshellSettingsWalletRoute: typeof UserAuthAppshellSettingsWalletRoute;
    UserAuthAppshellSettingsIndexRoute: typeof UserAuthAppshellSettingsIndexRoute;
}

const UserAuthAppshellSettingsRouteChildren: UserAuthAppshellSettingsRouteChildren =
    {
        UserAuthAppshellSettingsProfileRoute:
            UserAuthAppshellSettingsProfileRoute,
        UserAuthAppshellSettingsWalletRoute:
            UserAuthAppshellSettingsWalletRoute,
        UserAuthAppshellSettingsIndexRoute: UserAuthAppshellSettingsIndexRoute,
    };

const UserAuthAppshellSettingsRouteWithChildren =
    UserAuthAppshellSettingsRoute._addFileChildren(
        UserAuthAppshellSettingsRouteChildren
    );

interface UserAuthAppshellRouteChildren {
    UserAuthAppshellDashboardRoute: typeof UserAuthAppshellDashboardRoute;
    UserAuthAppshellHomeRoute: typeof UserAuthAppshellHomeRoute;
    UserAuthAppshellProjectsRoute: typeof UserAuthAppshellProjectsRoute;
    UserAuthAppshellSettingsRoute: typeof UserAuthAppshellSettingsRouteWithChildren;
}

const UserAuthAppshellRouteChildren: UserAuthAppshellRouteChildren = {
    UserAuthAppshellDashboardRoute: UserAuthAppshellDashboardRoute,
    UserAuthAppshellHomeRoute: UserAuthAppshellHomeRoute,
    UserAuthAppshellProjectsRoute: UserAuthAppshellProjectsRoute,
    UserAuthAppshellSettingsRoute: UserAuthAppshellSettingsRouteWithChildren,
};

const UserAuthAppshellRouteWithChildren =
    UserAuthAppshellRoute._addFileChildren(UserAuthAppshellRouteChildren);

interface UserAuthRouteChildren {
    UserAuthAppshellRoute: typeof UserAuthAppshellRouteWithChildren;
    UserAuthProjectNewRoute: typeof UserAuthProjectNewRoute;
    UserAuthProjectProjectIdFormRoute: typeof UserAuthProjectProjectIdFormRoute;
    UserAuthProjectProjectIdViewRoute: typeof UserAuthProjectProjectIdViewRoute;
}

const UserAuthRouteChildren: UserAuthRouteChildren = {
    UserAuthAppshellRoute: UserAuthAppshellRouteWithChildren,
    UserAuthProjectNewRoute: UserAuthProjectNewRoute,
    UserAuthProjectProjectIdFormRoute: UserAuthProjectProjectIdFormRoute,
    UserAuthProjectProjectIdViewRoute: UserAuthProjectProjectIdViewRoute,
};

const UserAuthRouteWithChildren = UserAuthRoute._addFileChildren(
    UserAuthRouteChildren
);

interface UserRouteChildren {
    UserAuthRoute: typeof UserAuthRouteWithChildren;
    UserIndexRoute: typeof UserIndexRoute;
}

const UserRouteChildren: UserRouteChildren = {
    UserAuthRoute: UserAuthRouteWithChildren,
    UserIndexRoute: UserIndexRoute,
};

const UserRouteWithChildren = UserRoute._addFileChildren(UserRouteChildren);

export interface FileRoutesByFullPath {
    '/': typeof IndexRoute;
    '/auth': typeof AuthRoute;
    '/login': typeof LoginRoute;
    '/logout': typeof LogoutRoute;
    '/register': typeof RegisterRoute;
    '/signin': typeof SigninRoute;
    '/signout': typeof SignoutRoute;
    '/signup': typeof SignupRoute;
    '/admin': typeof AdminAuthAppshellRouteWithChildren;
    '/user': typeof UserAuthAppshellRouteWithChildren;
    '/admin/': typeof AdminIndexRoute;
    '/user/': typeof UserIndexRoute;
    '/admin/dashboard': typeof AdminAuthAppshellDashboardRoute;
    '/user/dashboard': typeof UserAuthAppshellDashboardRoute;
    '/user/home': typeof UserAuthAppshellHomeRoute;
    '/user/projects': typeof UserAuthAppshellProjectsRoute;
    '/user/settings': typeof UserAuthAppshellSettingsRouteWithChildren;
    '/user/project/new': typeof UserAuthProjectNewRoute;
    '/admin/settings/permissions': typeof AdminAuthAppshellSettingsPermissionsRoute;
    '/admin/projects/$projectId/review': typeof AdminAuthProjectsProjectIdReviewRoute;
    '/user/settings/profile': typeof UserAuthAppshellSettingsProfileRoute;
    '/user/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute;
    '/user/project/$projectId/form': typeof UserAuthProjectProjectIdFormRoute;
    '/user/project/$projectId/view': typeof UserAuthProjectProjectIdViewRoute;
    '/admin/resources': typeof AdminAuthAppshellResourcesIndexRoute;
    '/user/settings/': typeof UserAuthAppshellSettingsIndexRoute;
    '/admin/projects/$projectId/decision': typeof AdminAuthAppshellProjectsProjectIdDecisionRoute;
    '/admin/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute;
}

export interface FileRoutesByTo {
    '/': typeof IndexRoute;
    '/auth': typeof AuthRoute;
    '/login': typeof LoginRoute;
    '/logout': typeof LogoutRoute;
    '/register': typeof RegisterRoute;
    '/signin': typeof SigninRoute;
    '/signout': typeof SignoutRoute;
    '/signup': typeof SignupRoute;
    '/admin': typeof AdminAuthAppshellRouteWithChildren;
    '/user': typeof UserAuthAppshellRouteWithChildren;
    '/admin/dashboard': typeof AdminAuthAppshellDashboardRoute;
    '/user/dashboard': typeof UserAuthAppshellDashboardRoute;
    '/user/home': typeof UserAuthAppshellHomeRoute;
    '/user/projects': typeof UserAuthAppshellProjectsRoute;
    '/user/project/new': typeof UserAuthProjectNewRoute;
    '/admin/settings/permissions': typeof AdminAuthAppshellSettingsPermissionsRoute;
    '/admin/projects/$projectId/review': typeof AdminAuthProjectsProjectIdReviewRoute;
    '/user/settings/profile': typeof UserAuthAppshellSettingsProfileRoute;
    '/user/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute;
    '/user/project/$projectId/form': typeof UserAuthProjectProjectIdFormRoute;
    '/user/project/$projectId/view': typeof UserAuthProjectProjectIdViewRoute;
    '/admin/resources': typeof AdminAuthAppshellResourcesIndexRoute;
    '/user/settings': typeof UserAuthAppshellSettingsIndexRoute;
    '/admin/projects/$projectId/decision': typeof AdminAuthAppshellProjectsProjectIdDecisionRoute;
    '/admin/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute;
}

export interface FileRoutesById {
    __root__: typeof rootRoute;
    '/': typeof IndexRoute;
    '/auth': typeof AuthRoute;
    '/login': typeof LoginRoute;
    '/logout': typeof LogoutRoute;
    '/register': typeof RegisterRoute;
    '/signin': typeof SigninRoute;
    '/signout': typeof SignoutRoute;
    '/signup': typeof SignupRoute;
    '/admin': typeof AdminRouteWithChildren;
    '/admin/_auth': typeof AdminAuthRouteWithChildren;
    '/user': typeof UserRouteWithChildren;
    '/user/_auth': typeof UserAuthRouteWithChildren;
    '/admin/': typeof AdminIndexRoute;
    '/user/': typeof UserIndexRoute;
    '/admin/_auth/_appshell': typeof AdminAuthAppshellRouteWithChildren;
    '/user/_auth/_appshell': typeof UserAuthAppshellRouteWithChildren;
    '/admin/_auth/_appshell/dashboard': typeof AdminAuthAppshellDashboardRoute;
    '/user/_auth/_appshell/dashboard': typeof UserAuthAppshellDashboardRoute;
    '/user/_auth/_appshell/home': typeof UserAuthAppshellHomeRoute;
    '/user/_auth/_appshell/projects': typeof UserAuthAppshellProjectsRoute;
    '/user/_auth/_appshell/settings': typeof UserAuthAppshellSettingsRouteWithChildren;
    '/user/_auth/project/new': typeof UserAuthProjectNewRoute;
    '/admin/_auth/_appshell/settings/permissions': typeof AdminAuthAppshellSettingsPermissionsRoute;
    '/admin/_auth/projects/$projectId/review': typeof AdminAuthProjectsProjectIdReviewRoute;
    '/user/_auth/_appshell/settings/profile': typeof UserAuthAppshellSettingsProfileRoute;
    '/user/_auth/_appshell/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute;
    '/user/_auth/project/$projectId/form': typeof UserAuthProjectProjectIdFormRoute;
    '/user/_auth/project/$projectId/view': typeof UserAuthProjectProjectIdViewRoute;
    '/admin/_auth/_appshell/resources/': typeof AdminAuthAppshellResourcesIndexRoute;
    '/user/_auth/_appshell/settings/': typeof UserAuthAppshellSettingsIndexRoute;
    '/admin/_auth/_appshell/projects/$projectId/decision': typeof AdminAuthAppshellProjectsProjectIdDecisionRoute;
    '/admin/_auth/_appshell/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute;
}

export interface FileRouteTypes {
    fileRoutesByFullPath: FileRoutesByFullPath;
    fullPaths:
        | '/'
        | '/auth'
        | '/login'
        | '/logout'
        | '/register'
        | '/signin'
        | '/signout'
        | '/signup'
        | '/admin'
        | '/user'
        | '/admin/'
        | '/user/'
        | '/admin/dashboard'
        | '/user/dashboard'
        | '/user/home'
        | '/user/projects'
        | '/user/settings'
        | '/user/project/new'
        | '/admin/settings/permissions'
        | '/admin/projects/$projectId/review'
        | '/user/settings/profile'
        | '/user/settings/wallet'
        | '/user/project/$projectId/form'
        | '/user/project/$projectId/view'
        | '/admin/resources'
        | '/user/settings/'
        | '/admin/projects/$projectId/decision'
        | '/admin/projects/$projectId/overview';
    fileRoutesByTo: FileRoutesByTo;
    to:
        | '/'
        | '/auth'
        | '/login'
        | '/logout'
        | '/register'
        | '/signin'
        | '/signout'
        | '/signup'
        | '/admin'
        | '/user'
        | '/admin/dashboard'
        | '/user/dashboard'
        | '/user/home'
        | '/user/projects'
        | '/user/project/new'
        | '/admin/settings/permissions'
        | '/admin/projects/$projectId/review'
        | '/user/settings/profile'
        | '/user/settings/wallet'
        | '/user/project/$projectId/form'
        | '/user/project/$projectId/view'
        | '/admin/resources'
        | '/user/settings'
        | '/admin/projects/$projectId/decision'
        | '/admin/projects/$projectId/overview';
    id:
        | '__root__'
        | '/'
        | '/auth'
        | '/login'
        | '/logout'
        | '/register'
        | '/signin'
        | '/signout'
        | '/signup'
        | '/admin'
        | '/admin/_auth'
        | '/user'
        | '/user/_auth'
        | '/admin/'
        | '/user/'
        | '/admin/_auth/_appshell'
        | '/user/_auth/_appshell'
        | '/admin/_auth/_appshell/dashboard'
        | '/user/_auth/_appshell/dashboard'
        | '/user/_auth/_appshell/home'
        | '/user/_auth/_appshell/projects'
        | '/user/_auth/_appshell/settings'
        | '/user/_auth/project/new'
        | '/admin/_auth/_appshell/settings/permissions'
        | '/admin/_auth/projects/$projectId/review'
        | '/user/_auth/_appshell/settings/profile'
        | '/user/_auth/_appshell/settings/wallet'
        | '/user/_auth/project/$projectId/form'
        | '/user/_auth/project/$projectId/view'
        | '/admin/_auth/_appshell/resources/'
        | '/user/_auth/_appshell/settings/'
        | '/admin/_auth/_appshell/projects/$projectId/decision'
        | '/admin/_auth/_appshell/projects/$projectId/overview';
    fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
    IndexRoute: typeof IndexRoute;
    AuthRoute: typeof AuthRoute;
    LoginRoute: typeof LoginRoute;
    LogoutRoute: typeof LogoutRoute;
    RegisterRoute: typeof RegisterRoute;
    SigninRoute: typeof SigninRoute;
    SignoutRoute: typeof SignoutRoute;
    SignupRoute: typeof SignupRoute;
    AdminRoute: typeof AdminRouteWithChildren;
    UserRoute: typeof UserRouteWithChildren;
}

const rootRouteChildren: RootRouteChildren = {
    IndexRoute: IndexRoute,
    AuthRoute: AuthRoute,
    LoginRoute: LoginRoute,
    LogoutRoute: LogoutRoute,
    RegisterRoute: RegisterRoute,
    SigninRoute: SigninRoute,
    SignoutRoute: SignoutRoute,
    SignupRoute: SignupRoute,
    AdminRoute: AdminRouteWithChildren,
    UserRoute: UserRouteWithChildren,
};

export const routeTree = rootRoute
    ._addFileChildren(rootRouteChildren)
    ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/auth",
        "/login",
        "/logout",
        "/register",
        "/signin",
        "/signout",
        "/signup",
        "/admin",
        "/user"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/auth": {
      "filePath": "auth.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/signin": {
      "filePath": "signin.tsx"
    },
    "/signout": {
      "filePath": "signout.tsx"
    },
    "/signup": {
      "filePath": "signup.tsx"
    },
    "/admin": {
      "filePath": "admin",
      "children": [
        "/admin/_auth",
        "/admin/"
      ]
    },
    "/admin/_auth": {
      "filePath": "admin/_auth.tsx",
      "parent": "/admin",
      "children": [
        "/admin/_auth/_appshell",
        "/admin/_auth/projects/$projectId/review"
      ]
    },
    "/user": {
      "filePath": "user",
      "children": [
        "/user/_auth",
        "/user/"
      ]
    },
    "/user/_auth": {
      "filePath": "user/_auth.tsx",
      "parent": "/user",
      "children": [
        "/user/_auth/_appshell",
        "/user/_auth/project/new",
        "/user/_auth/project/$projectId/form",
        "/user/_auth/project/$projectId/view"
      ]
    },
    "/admin/": {
      "filePath": "admin/index.tsx",
      "parent": "/admin"
    },
    "/user/": {
      "filePath": "user/index.tsx",
      "parent": "/user"
    },
    "/admin/_auth/_appshell": {
      "filePath": "admin/_auth/_appshell.tsx",
      "parent": "/admin/_auth",
      "children": [
        "/admin/_auth/_appshell/dashboard",
        "/admin/_auth/_appshell/settings/permissions",
        "/admin/_auth/_appshell/resources/",
        "/admin/_auth/_appshell/projects/$projectId/decision",
        "/admin/_auth/_appshell/projects/$projectId/overview"
      ]
    },
    "/user/_auth/_appshell": {
      "filePath": "user/_auth/_appshell.tsx",
      "parent": "/user/_auth",
      "children": [
        "/user/_auth/_appshell/dashboard",
        "/user/_auth/_appshell/home",
        "/user/_auth/_appshell/projects",
        "/user/_auth/_appshell/settings"
      ]
    },
    "/admin/_auth/_appshell/dashboard": {
      "filePath": "admin/_auth/_appshell/dashboard.tsx",
      "parent": "/admin/_auth/_appshell"
    },
    "/user/_auth/_appshell/dashboard": {
      "filePath": "user/_auth/_appshell/dashboard.tsx",
      "parent": "/user/_auth/_appshell"
    },
    "/user/_auth/_appshell/home": {
      "filePath": "user/_auth/_appshell/home.tsx",
      "parent": "/user/_auth/_appshell"
    },
    "/user/_auth/_appshell/projects": {
      "filePath": "user/_auth/_appshell/projects.tsx",
      "parent": "/user/_auth/_appshell"
    },
    "/user/_auth/_appshell/settings": {
      "filePath": "user/_auth/_appshell/settings.tsx",
      "parent": "/user/_auth/_appshell",
      "children": [
        "/user/_auth/_appshell/settings/profile",
        "/user/_auth/_appshell/settings/wallet",
        "/user/_auth/_appshell/settings/"
      ]
    },
    "/user/_auth/project/new": {
      "filePath": "user/_auth/project/new.tsx",
      "parent": "/user/_auth"
    },
    "/admin/_auth/_appshell/settings/permissions": {
      "filePath": "admin/_auth/_appshell/settings/permissions.tsx",
      "parent": "/admin/_auth/_appshell"
    },
    "/admin/_auth/projects/$projectId/review": {
      "filePath": "admin/_auth/projects/$projectId.review.tsx",
      "parent": "/admin/_auth"
    },
    "/user/_auth/_appshell/settings/profile": {
      "filePath": "user/_auth/_appshell/settings/profile.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/user/_auth/_appshell/settings/wallet": {
      "filePath": "user/_auth/_appshell/settings/wallet.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/user/_auth/project/$projectId/form": {
      "filePath": "user/_auth/project/$projectId/form.tsx",
      "parent": "/user/_auth"
    },
    "/user/_auth/project/$projectId/view": {
      "filePath": "user/_auth/project/$projectId/view.tsx",
      "parent": "/user/_auth"
    },
    "/admin/_auth/_appshell/resources/": {
      "filePath": "admin/_auth/_appshell/resources/index.tsx",
      "parent": "/admin/_auth/_appshell"
    },
    "/user/_auth/_appshell/settings/": {
      "filePath": "user/_auth/_appshell/settings/index.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/admin/_auth/_appshell/projects/$projectId/decision": {
      "filePath": "admin/_auth/_appshell/projects/$projectId.decision.tsx",
      "parent": "/admin/_auth/_appshell"
    },
    "/admin/_auth/_appshell/projects/$projectId/overview": {
      "filePath": "admin/_auth/_appshell/projects/$projectId.overview.tsx",
      "parent": "/admin/_auth/_appshell"
    }
  }
}
ROUTE_MANIFEST_END */
