'use client'

import * as React from 'react'
import { ShortcutsList } from './ShortcutsList'

interface ShortcutsPageProps {
  showPinned?: boolean
}

export function ShortcutsPage({ showPinned = true }: ShortcutsPageProps) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <ShortcutsList showPinned={showPinned} />
    </div>
  )
}