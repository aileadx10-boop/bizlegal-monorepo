'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Kanban, FileText, Users, Settings, Zap } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/',         label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline',   icon: Kanban },
  { href: '/deals',    label: 'Deals',      icon: FileText },
  { href: '/clients',  label: 'Clients',    icon: Users },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">TRCR</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Deal & Contract Tracker</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-700/50 pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings size={16} />
          Settings
        </Link>
        <div className="mt-3 px-3">
          <div className="text-xs text-slate-500">Powered by</div>
          <div className="text-xs text-slate-400 font-medium">BizLegal AI</div>
        </div>
      </div>
    </aside>
  )
}
