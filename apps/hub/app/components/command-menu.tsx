'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface CommandMenuProps {
  isOpen: boolean
  onClose: () => void
}

const COMMANDS = [
  { id: 'home', label: 'Home', shortcut: 'H', href: '/' },
  { id: 'pricing', label: 'Pricing', shortcut: 'P', href: '/pricing' },
  { id: 'blog', label: 'Blog', shortcut: 'B', href: '/blog' },
  { id: 'tools', label: 'Compliance Tools', shortcut: 'T', href: '/tools' },
  { id: 'tracr', label: 'TRACR', shortcut: 'R', href: 'https://tracr.bizlegal-ai.com' },
  { id: 'regulations', label: 'Regulations', shortcut: 'G', href: '/regulations' },
  { id: 'dashboard', label: 'Dashboard', shortcut: 'D', href: '/dashboard' },
  { id: 'quiz', label: 'Risk Quiz', shortcut: 'Q', href: '/#risk-quiz' },
]

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = search
    ? COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
      )
    : COMMANDS

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      window.location.href = filteredCommands[selectedIndex].href
      onClose()
    }
  }, [filteredCommands, selectedIndex, onClose])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      setSelectedIndex(0)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-low)] border border-[var(--outline-var)] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[var(--outline-var)] px-4">
          <span className="text-[var(--outline)] mr-3 text-lg">⌘</span>
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent py-4 text-[var(--on-surface)] placeholder-[var(--outline)] outline-none text-sm"
            autoFocus
          />
          <kbd className="text-xs text-[var(--outline)] bg-[var(--bg-mid)] px-2 py-1">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--outline)]">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <Link
                key={cmd.id}
                href={cmd.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 mx-2 transition-colors ${
                  index === selectedIndex
                    ? 'bg-[var(--primary-container)] text-white'
                    : 'hover:bg-[var(--bg-mid)] text-[var(--on-surface)]'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="font-medium">{cmd.label}</span>
                <kbd
                  className={`text-xs px-2 py-0.5 ${
                    index === selectedIndex
                      ? 'bg-white/20'
                      : 'bg-[var(--bg-mid)] text-[var(--outline)]'
                  }`}
                >
                  ⌘{cmd.shortcut}
                </kbd>
              </Link>
            ))
          )}
        </div>

        <div className="border-t border-[var(--outline-var)] px-4 py-2 flex items-center gap-4 text-xs text-[var(--outline)]">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  )
}
