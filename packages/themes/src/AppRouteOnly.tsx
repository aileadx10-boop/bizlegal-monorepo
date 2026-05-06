'use client'

/**
 * AppRouteOnly — render children only on app-internal routes.
 *
 * Inverse of SiteShell's chromeSuppressPaths. The legacy "Back to
 * BizLegal AI" + bl-theme ThemeToggle bar that lexaudit/docai/tracr
 * mount in <body> is redundant on marketing routes (SiteShell already
 * provides nav + theme toggle there) but still needed on /login,
 * /dashboard, /admin etc. where SiteShell renders raw children.
 *
 * Wrap the legacy bar in this component so it disappears on marketing
 * routes without server-side path checks in the layout.
 *
 * a11y A11Y-034 fix — closes the duplicate-ThemeToggle finding from
 * the Phase AA a11y audit.
 */

import * as React from 'react'
import { usePathname } from 'next/navigation'

const DEFAULT_APP_ROUTE_PREFIXES: ReadonlyArray<string> = [
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/account',
  '/certificate',
  '/api',
]

function normalize(pathname: string): string {
  let p = pathname
  const qIdx = p.indexOf('?')
  if (qIdx >= 0) p = p.slice(0, qIdx)
  const hIdx = p.indexOf('#')
  if (hIdx >= 0) p = p.slice(0, hIdx)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

export interface AppRouteOnlyProps {
  readonly children: React.ReactNode
  /** Override the default app-route prefix list. Children render only
   *  when the current path matches one of these. */
  readonly prefixes?: ReadonlyArray<string>
}

export function AppRouteOnly(props: AppRouteOnlyProps): React.ReactElement | null {
  const { children, prefixes = DEFAULT_APP_ROUTE_PREFIXES } = props
  const raw = usePathname() ?? '/'
  const path = normalize(raw)
  const isAppRoute = prefixes.some((p) => path === p || path.startsWith(p + '/'))
  if (!isAppRoute) return null
  return <>{children}</>
}

export default AppRouteOnly
