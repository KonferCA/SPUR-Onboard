/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './pages/__root'
import { Route as AuthImport } from './pages/auth'
import { Route as IndexImport } from './pages/index'
import { Route as UserIndexImport } from './pages/user/index'
import { Route as AdminIndexImport } from './pages/admin/index'
import { Route as UserAuthImport } from './pages/user/_auth'
import { Route as AdminAuthImport } from './pages/admin/_auth'
import { Route as UserAuthAppshellImport } from './pages/user/_auth/_appshell'
import { Route as AdminAuthAppshellImport } from './pages/admin/_auth/_appshell'
import { Route as UserAuthProjectNewImport } from './pages/user/_auth/project/new'
import { Route as UserAuthAppshellSettingsImport } from './pages/user/_auth/_appshell/settings'
import { Route as UserAuthAppshellProjectsImport } from './pages/user/_auth/_appshell/projects'
import { Route as UserAuthAppshellDashboardImport } from './pages/user/_auth/_appshell/dashboard'
import { Route as AdminAuthAppshellDashboardImport } from './pages/admin/_auth/_appshell/dashboard'
import { Route as UserAuthAppshellSettingsWalletImport } from './pages/user/_auth/_appshell/settings.wallet'
import { Route as UserAuthAppshellSettingsProfileImport } from './pages/user/_auth/_appshell/settings.profile'
import { Route as UserAuthAppshellSettingsCompanyImport } from './pages/user/_auth/_appshell/settings.company'
import { Route as AdminAuthAppshellProjectsProjectIdOverviewImport } from './pages/admin/_auth/_appshell/projects/$projectId.overview'

// Create Virtual Routes

const UserImport = createFileRoute('/user')()
const AdminImport = createFileRoute('/admin')()

// Create/Update Routes

const UserRoute = UserImport.update({
  id: '/user',
  path: '/user',
  getParentRoute: () => rootRoute,
} as any)

const AdminRoute = AdminImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const UserIndexRoute = UserIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => UserRoute,
} as any)

const AdminIndexRoute = AdminIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AdminRoute,
} as any)

const UserAuthRoute = UserAuthImport.update({
  id: '/_auth',
  getParentRoute: () => UserRoute,
} as any)

const AdminAuthRoute = AdminAuthImport.update({
  id: '/_auth',
  getParentRoute: () => AdminRoute,
} as any)

const UserAuthAppshellRoute = UserAuthAppshellImport.update({
  id: '/_appshell',
  getParentRoute: () => UserAuthRoute,
} as any)

const AdminAuthAppshellRoute = AdminAuthAppshellImport.update({
  id: '/_appshell',
  getParentRoute: () => AdminAuthRoute,
} as any)

const UserAuthProjectNewRoute = UserAuthProjectNewImport.update({
  id: '/project/new',
  path: '/project/new',
  getParentRoute: () => UserAuthRoute,
} as any)

const UserAuthAppshellSettingsRoute = UserAuthAppshellSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => UserAuthAppshellRoute,
} as any)

const UserAuthAppshellProjectsRoute = UserAuthAppshellProjectsImport.update({
  id: '/projects',
  path: '/projects',
  getParentRoute: () => UserAuthAppshellRoute,
} as any)

const UserAuthAppshellDashboardRoute = UserAuthAppshellDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => UserAuthAppshellRoute,
} as any)

const AdminAuthAppshellDashboardRoute = AdminAuthAppshellDashboardImport.update(
  {
    id: '/dashboard',
    path: '/dashboard',
    getParentRoute: () => AdminAuthAppshellRoute,
  } as any,
)

const UserAuthAppshellSettingsWalletRoute =
  UserAuthAppshellSettingsWalletImport.update({
    id: '/wallet',
    path: '/wallet',
    getParentRoute: () => UserAuthAppshellSettingsRoute,
  } as any)

const UserAuthAppshellSettingsProfileRoute =
  UserAuthAppshellSettingsProfileImport.update({
    id: '/profile',
    path: '/profile',
    getParentRoute: () => UserAuthAppshellSettingsRoute,
  } as any)

const UserAuthAppshellSettingsCompanyRoute =
  UserAuthAppshellSettingsCompanyImport.update({
    id: '/company',
    path: '/company',
    getParentRoute: () => UserAuthAppshellSettingsRoute,
  } as any)

const AdminAuthAppshellProjectsProjectIdOverviewRoute =
  AdminAuthAppshellProjectsProjectIdOverviewImport.update({
    id: '/projects/$projectId/overview',
    path: '/projects/$projectId/overview',
    getParentRoute: () => AdminAuthAppshellRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/admin/_auth': {
      id: '/admin/_auth'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminAuthImport
      parentRoute: typeof AdminRoute
    }
    '/user': {
      id: '/user'
      path: '/user'
      fullPath: '/user'
      preLoaderRoute: typeof UserImport
      parentRoute: typeof rootRoute
    }
    '/user/_auth': {
      id: '/user/_auth'
      path: '/user'
      fullPath: '/user'
      preLoaderRoute: typeof UserAuthImport
      parentRoute: typeof UserRoute
    }
    '/admin/': {
      id: '/admin/'
      path: '/'
      fullPath: '/admin/'
      preLoaderRoute: typeof AdminIndexImport
      parentRoute: typeof AdminImport
    }
    '/user/': {
      id: '/user/'
      path: '/'
      fullPath: '/user/'
      preLoaderRoute: typeof UserIndexImport
      parentRoute: typeof UserImport
    }
    '/admin/_auth/_appshell': {
      id: '/admin/_auth/_appshell'
      path: ''
      fullPath: '/admin'
      preLoaderRoute: typeof AdminAuthAppshellImport
      parentRoute: typeof AdminAuthImport
    }
    '/user/_auth/_appshell': {
      id: '/user/_auth/_appshell'
      path: ''
      fullPath: '/user'
      preLoaderRoute: typeof UserAuthAppshellImport
      parentRoute: typeof UserAuthImport
    }
    '/admin/_auth/_appshell/dashboard': {
      id: '/admin/_auth/_appshell/dashboard'
      path: '/dashboard'
      fullPath: '/admin/dashboard'
      preLoaderRoute: typeof AdminAuthAppshellDashboardImport
      parentRoute: typeof AdminAuthAppshellImport
    }
    '/user/_auth/_appshell/dashboard': {
      id: '/user/_auth/_appshell/dashboard'
      path: '/dashboard'
      fullPath: '/user/dashboard'
      preLoaderRoute: typeof UserAuthAppshellDashboardImport
      parentRoute: typeof UserAuthAppshellImport
    }
    '/user/_auth/_appshell/projects': {
      id: '/user/_auth/_appshell/projects'
      path: '/projects'
      fullPath: '/user/projects'
      preLoaderRoute: typeof UserAuthAppshellProjectsImport
      parentRoute: typeof UserAuthAppshellImport
    }
    '/user/_auth/_appshell/settings': {
      id: '/user/_auth/_appshell/settings'
      path: '/settings'
      fullPath: '/user/settings'
      preLoaderRoute: typeof UserAuthAppshellSettingsImport
      parentRoute: typeof UserAuthAppshellImport
    }
    '/user/_auth/project/new': {
      id: '/user/_auth/project/new'
      path: '/project/new'
      fullPath: '/user/project/new'
      preLoaderRoute: typeof UserAuthProjectNewImport
      parentRoute: typeof UserAuthImport
    }
    '/user/_auth/_appshell/settings/company': {
      id: '/user/_auth/_appshell/settings/company'
      path: '/company'
      fullPath: '/user/settings/company'
      preLoaderRoute: typeof UserAuthAppshellSettingsCompanyImport
      parentRoute: typeof UserAuthAppshellSettingsImport
    }
    '/user/_auth/_appshell/settings/profile': {
      id: '/user/_auth/_appshell/settings/profile'
      path: '/profile'
      fullPath: '/user/settings/profile'
      preLoaderRoute: typeof UserAuthAppshellSettingsProfileImport
      parentRoute: typeof UserAuthAppshellSettingsImport
    }
    '/user/_auth/_appshell/settings/wallet': {
      id: '/user/_auth/_appshell/settings/wallet'
      path: '/wallet'
      fullPath: '/user/settings/wallet'
      preLoaderRoute: typeof UserAuthAppshellSettingsWalletImport
      parentRoute: typeof UserAuthAppshellSettingsImport
    }
    '/admin/_auth/_appshell/projects/$projectId/overview': {
      id: '/admin/_auth/_appshell/projects/$projectId/overview'
      path: '/projects/$projectId/overview'
      fullPath: '/admin/projects/$projectId/overview'
      preLoaderRoute: typeof AdminAuthAppshellProjectsProjectIdOverviewImport
      parentRoute: typeof AdminAuthAppshellImport
    }
  }
}

// Create and export the route tree

interface AdminAuthAppshellRouteChildren {
  AdminAuthAppshellDashboardRoute: typeof AdminAuthAppshellDashboardRoute
  AdminAuthAppshellProjectsProjectIdOverviewRoute: typeof AdminAuthAppshellProjectsProjectIdOverviewRoute
}

const AdminAuthAppshellRouteChildren: AdminAuthAppshellRouteChildren = {
  AdminAuthAppshellDashboardRoute: AdminAuthAppshellDashboardRoute,
  AdminAuthAppshellProjectsProjectIdOverviewRoute:
    AdminAuthAppshellProjectsProjectIdOverviewRoute,
}

const AdminAuthAppshellRouteWithChildren =
  AdminAuthAppshellRoute._addFileChildren(AdminAuthAppshellRouteChildren)

interface AdminAuthRouteChildren {
  AdminAuthAppshellRoute: typeof AdminAuthAppshellRouteWithChildren
}

const AdminAuthRouteChildren: AdminAuthRouteChildren = {
  AdminAuthAppshellRoute: AdminAuthAppshellRouteWithChildren,
}

const AdminAuthRouteWithChildren = AdminAuthRoute._addFileChildren(
  AdminAuthRouteChildren,
)

interface AdminRouteChildren {
  AdminAuthRoute: typeof AdminAuthRouteWithChildren
  AdminIndexRoute: typeof AdminIndexRoute
}

const AdminRouteChildren: AdminRouteChildren = {
  AdminAuthRoute: AdminAuthRouteWithChildren,
  AdminIndexRoute: AdminIndexRoute,
}

const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren)

interface UserAuthAppshellSettingsRouteChildren {
  UserAuthAppshellSettingsCompanyRoute: typeof UserAuthAppshellSettingsCompanyRoute
  UserAuthAppshellSettingsProfileRoute: typeof UserAuthAppshellSettingsProfileRoute
  UserAuthAppshellSettingsWalletRoute: typeof UserAuthAppshellSettingsWalletRoute
}

const UserAuthAppshellSettingsRouteChildren: UserAuthAppshellSettingsRouteChildren =
  {
    UserAuthAppshellSettingsCompanyRoute: UserAuthAppshellSettingsCompanyRoute,
    UserAuthAppshellSettingsProfileRoute: UserAuthAppshellSettingsProfileRoute,
    UserAuthAppshellSettingsWalletRoute: UserAuthAppshellSettingsWalletRoute,
  }

const UserAuthAppshellSettingsRouteWithChildren =
  UserAuthAppshellSettingsRoute._addFileChildren(
    UserAuthAppshellSettingsRouteChildren,
  )

interface UserAuthAppshellRouteChildren {
  UserAuthAppshellDashboardRoute: typeof UserAuthAppshellDashboardRoute
  UserAuthAppshellProjectsRoute: typeof UserAuthAppshellProjectsRoute
  UserAuthAppshellSettingsRoute: typeof UserAuthAppshellSettingsRouteWithChildren
}

const UserAuthAppshellRouteChildren: UserAuthAppshellRouteChildren = {
  UserAuthAppshellDashboardRoute: UserAuthAppshellDashboardRoute,
  UserAuthAppshellProjectsRoute: UserAuthAppshellProjectsRoute,
  UserAuthAppshellSettingsRoute: UserAuthAppshellSettingsRouteWithChildren,
}

const UserAuthAppshellRouteWithChildren =
  UserAuthAppshellRoute._addFileChildren(UserAuthAppshellRouteChildren)

interface UserAuthRouteChildren {
  UserAuthAppshellRoute: typeof UserAuthAppshellRouteWithChildren
  UserAuthProjectNewRoute: typeof UserAuthProjectNewRoute
}

const UserAuthRouteChildren: UserAuthRouteChildren = {
  UserAuthAppshellRoute: UserAuthAppshellRouteWithChildren,
  UserAuthProjectNewRoute: UserAuthProjectNewRoute,
}

const UserAuthRouteWithChildren = UserAuthRoute._addFileChildren(
  UserAuthRouteChildren,
)

interface UserRouteChildren {
  UserAuthRoute: typeof UserAuthRouteWithChildren
  UserIndexRoute: typeof UserIndexRoute
}

const UserRouteChildren: UserRouteChildren = {
  UserAuthRoute: UserAuthRouteWithChildren,
  UserIndexRoute: UserIndexRoute,
}

const UserRouteWithChildren = UserRoute._addFileChildren(UserRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/admin': typeof AdminAuthAppshellRouteWithChildren
  '/user': typeof UserAuthAppshellRouteWithChildren
  '/admin/': typeof AdminIndexRoute
  '/user/': typeof UserIndexRoute
  '/admin/dashboard': typeof AdminAuthAppshellDashboardRoute
  '/user/dashboard': typeof UserAuthAppshellDashboardRoute
  '/user/projects': typeof UserAuthAppshellProjectsRoute
  '/user/settings': typeof UserAuthAppshellSettingsRouteWithChildren
  '/user/project/new': typeof UserAuthProjectNewRoute
  '/user/settings/company': typeof UserAuthAppshellSettingsCompanyRoute
  '/user/settings/profile': typeof UserAuthAppshellSettingsProfileRoute
  '/user/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute
  '/admin/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/admin': typeof AdminAuthAppshellRouteWithChildren
  '/user': typeof UserAuthAppshellRouteWithChildren
  '/admin/dashboard': typeof AdminAuthAppshellDashboardRoute
  '/user/dashboard': typeof UserAuthAppshellDashboardRoute
  '/user/projects': typeof UserAuthAppshellProjectsRoute
  '/user/settings': typeof UserAuthAppshellSettingsRouteWithChildren
  '/user/project/new': typeof UserAuthProjectNewRoute
  '/user/settings/company': typeof UserAuthAppshellSettingsCompanyRoute
  '/user/settings/profile': typeof UserAuthAppshellSettingsProfileRoute
  '/user/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute
  '/admin/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/admin': typeof AdminRouteWithChildren
  '/admin/_auth': typeof AdminAuthRouteWithChildren
  '/user': typeof UserRouteWithChildren
  '/user/_auth': typeof UserAuthRouteWithChildren
  '/admin/': typeof AdminIndexRoute
  '/user/': typeof UserIndexRoute
  '/admin/_auth/_appshell': typeof AdminAuthAppshellRouteWithChildren
  '/user/_auth/_appshell': typeof UserAuthAppshellRouteWithChildren
  '/admin/_auth/_appshell/dashboard': typeof AdminAuthAppshellDashboardRoute
  '/user/_auth/_appshell/dashboard': typeof UserAuthAppshellDashboardRoute
  '/user/_auth/_appshell/projects': typeof UserAuthAppshellProjectsRoute
  '/user/_auth/_appshell/settings': typeof UserAuthAppshellSettingsRouteWithChildren
  '/user/_auth/project/new': typeof UserAuthProjectNewRoute
  '/user/_auth/_appshell/settings/company': typeof UserAuthAppshellSettingsCompanyRoute
  '/user/_auth/_appshell/settings/profile': typeof UserAuthAppshellSettingsProfileRoute
  '/user/_auth/_appshell/settings/wallet': typeof UserAuthAppshellSettingsWalletRoute
  '/admin/_auth/_appshell/projects/$projectId/overview': typeof AdminAuthAppshellProjectsProjectIdOverviewRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/auth'
    | '/admin'
    | '/user'
    | '/admin/'
    | '/user/'
    | '/admin/dashboard'
    | '/user/dashboard'
    | '/user/projects'
    | '/user/settings'
    | '/user/project/new'
    | '/user/settings/company'
    | '/user/settings/profile'
    | '/user/settings/wallet'
    | '/admin/projects/$projectId/overview'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/auth'
    | '/admin'
    | '/user'
    | '/admin/dashboard'
    | '/user/dashboard'
    | '/user/projects'
    | '/user/settings'
    | '/user/project/new'
    | '/user/settings/company'
    | '/user/settings/profile'
    | '/user/settings/wallet'
    | '/admin/projects/$projectId/overview'
  id:
    | '__root__'
    | '/'
    | '/auth'
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
    | '/user/_auth/_appshell/projects'
    | '/user/_auth/_appshell/settings'
    | '/user/_auth/project/new'
    | '/user/_auth/_appshell/settings/company'
    | '/user/_auth/_appshell/settings/profile'
    | '/user/_auth/_appshell/settings/wallet'
    | '/admin/_auth/_appshell/projects/$projectId/overview'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthRoute: typeof AuthRoute
  AdminRoute: typeof AdminRouteWithChildren
  UserRoute: typeof UserRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthRoute: AuthRoute,
  AdminRoute: AdminRouteWithChildren,
  UserRoute: UserRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/auth",
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
        "/admin/_auth/_appshell"
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
        "/user/_auth/project/new"
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
        "/admin/_auth/_appshell/projects/$projectId/overview"
      ]
    },
    "/user/_auth/_appshell": {
      "filePath": "user/_auth/_appshell.tsx",
      "parent": "/user/_auth",
      "children": [
        "/user/_auth/_appshell/dashboard",
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
    "/user/_auth/_appshell/projects": {
      "filePath": "user/_auth/_appshell/projects.tsx",
      "parent": "/user/_auth/_appshell"
    },
    "/user/_auth/_appshell/settings": {
      "filePath": "user/_auth/_appshell/settings.tsx",
      "parent": "/user/_auth/_appshell",
      "children": [
        "/user/_auth/_appshell/settings/company",
        "/user/_auth/_appshell/settings/profile",
        "/user/_auth/_appshell/settings/wallet"
      ]
    },
    "/user/_auth/project/new": {
      "filePath": "user/_auth/project/new.tsx",
      "parent": "/user/_auth"
    },
    "/user/_auth/_appshell/settings/company": {
      "filePath": "user/_auth/_appshell/settings.company.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/user/_auth/_appshell/settings/profile": {
      "filePath": "user/_auth/_appshell/settings.profile.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/user/_auth/_appshell/settings/wallet": {
      "filePath": "user/_auth/_appshell/settings.wallet.tsx",
      "parent": "/user/_auth/_appshell/settings"
    },
    "/admin/_auth/_appshell/projects/$projectId/overview": {
      "filePath": "admin/_auth/_appshell/projects/$projectId.overview.tsx",
      "parent": "/admin/_auth/_appshell"
    }
  }
}
ROUTE_MANIFEST_END */
