'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  FileText,
  Shield,
  Search,
  DollarSign,
  Megaphone,
  HelpCircle,
  CreditCard,
  Moon,
  Sun,
  ArrowRight,
  Clock,
  X,
} from 'lucide-react'

interface CommandMenuProps {
  isOpen: boolean
  onClose: () => void
}

type RecentItem = {
  id: string
  label: string
  href: string
  accessedAt: number
}

const COMMANDS = [
  {
    group: 'Navigation',
    items: [
      { id: 'home', label: 'Home', icon: Home, href: '/', shortcut: ['H'] },
      { id: 'boi', label: 'BOI Report', icon: FileText, href: '/boi', shortcut: ['B'] },
      { id: 'passport', label: 'Regulatory Passport', icon: Shield, href: '/passport', shortcut: ['P'] },
      { id: 'audit', label: 'Web Scanner', icon: Search, href: '/audit', shortcut: ['S'] },
      { id: 'pricing', label: 'Pricing', icon: DollarSign, href: '/pricing', shortcut: ['$'] },
      { id: 'faq', label: 'FAQ', icon: HelpCircle, href: '/faq', shortcut: ['?'] },
    ],
  },
  {
    group: 'Quick Actions',
    items: [
      { id: 'file-boi', label: 'File BOI Report', icon: ArrowRight, href: '/boi', shortcut: ['⌘', 'B'] },
      { id: 'buy-passport', label: 'Buy Regulatory Passport', icon: CreditCard, href: '/passport', shortcut: ['⌘', 'P'] },
      { id: 'run-scan', label: 'Run Compliance Scan', icon: Search, href: '/audit', shortcut: ['⌘', 'S'] },
      { id: 'boi-campaign', label: 'View BOI Campaign', icon: Megaphone, href: '/campaign/boi', shortcut: ['C'] },
    ],
  },
]

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [isDark, setIsDark] = useState(true)

  // Load recent items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('forge-recent-pages')
    if (stored) {
      setRecentItems(JSON.parse(stored))
    }
  }, [])

  // Track navigation
  const trackNavigation = useCallback((item: { id: string; label: string; href: string }) => {
    const newRecent = [
      { id: item.id, label: item.label, href: item.href, accessedAt: Date.now() },
      ...recentItems.filter((r: RecentItem) => r.id !== item.id),
    ].slice(0, 5)
    
    setRecentItems(newRecent)
    localStorage.setItem('forge-recent-pages', JSON.stringify(newRecent))
  }, [recentItems])

  const handleSelect = useCallback((href: string) => {
    const allItems = COMMANDS.flatMap(g => g.items)
    const selectedItem = allItems.find(item => item.href === href)
    if (selectedItem) {
      trackNavigation(selectedItem)
    }
    router.push(href)
    onClose()
  }, [router, onClose, trackNavigation])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Direct shortcuts when menu is closed
      if (!isOpen) {
        const shortcutMap: Record<string, string> = {
          'h': '/',
          'b': '/boi',
          'p': '/passport',
          's': '/audit',
          '?': '/faq',
        }
        
        if (!e.metaKey && !e.ctrlKey && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
          const href = shortcutMap[e.key.toLowerCase()]
          if (href) {
            e.preventDefault()
            handleSelect(href)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleSelect])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-xl bg-forge-card border border-forge-border rounded-xl shadow-2xl overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Command
              className="outline-none"
              value=""
              onValueChange={setSearch}
              loop
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-forge-border px-4">
                <Search className="w-4 h-4 text-forge-text-secondary mr-3" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent py-4 text-forge-text placeholder-forge-text-secondary outline-none text-sm"
                />
                <button
                  onClick={onClose}
                  className="ml-2 p-1 hover:bg-forge-border rounded transition-colors"
                >
                  <X className="w-4 h-4 text-forge-text-secondary" />
                </button>
              </div>

              {/* Command List */}
              <Command.List className="max-h-[400px] overflow-y-auto py-2">
                <Command.Empty className="px-4 py-8 text-center text-forge-text-secondary text-sm">
                  No results found.
                </Command.Empty>

                {/* Recent Items */}
                {recentItems.length > 0 && !search && (
                  <Command.Group heading="Recent" className="px-2 mb-2">
                    {/* Command.Group `heading` prop already renders the label;
                        Command.GroupHeading does not exist in this cmdk version. */}
                    {recentItems.map(item => (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleSelect(item.href)}
                        className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-forge-accent/10 data-[selected=true]:text-forge-accent text-forge-text hover:bg-forge-card/50"
                      >
                        <Clock className="w-4 h-4 text-forge-text-secondary" />
                        <span className="text-sm flex-1">{item.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Command Groups */}
                {COMMANDS.map(group => (
                  <Command.Group
                    key={group.group}
                    value={group.group}
                    heading={group.group}
                  >
                    {group.items.map(item => {
                      const Icon = item.icon
                      return (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => handleSelect(item.href)}
                          className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors data-[selected=true]:bg-forge-accent/10 data-[selected=true]:text-forge-accent text-forge-text hover:bg-forge-card/50"
                        >
                          <Icon className="w-4 h-4 text-forge-text-secondary" />
                          <span className="text-sm flex-1">{item.label}</span>
                          <div className="flex items-center gap-1">
                            {item.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="text-xs px-1.5 py-0.5 rounded bg-forge-border text-forge-text-secondary font-mono"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="border-t border-forge-border px-4 py-2.5 flex items-center gap-4 text-xs text-forge-text-secondary">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-forge-border font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-forge-border font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-forge-border font-mono">esc</kbd>
                  Close
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
