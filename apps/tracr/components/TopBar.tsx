'use client'
import Link from 'next/link'
import { Plus, Bell } from 'lucide-react'

export default function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={18} />
        </button>
        <Link href="/deals/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Deal
        </Link>
      </div>
    </div>
  )
}
