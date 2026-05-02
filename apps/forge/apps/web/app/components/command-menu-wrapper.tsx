'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommandMenu } from './command-menu'

export function CommandMenuWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {children}
      <CommandMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
