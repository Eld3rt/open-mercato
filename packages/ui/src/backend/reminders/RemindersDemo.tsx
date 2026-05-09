'use client'

import * as React from 'react'
import { RemindersList } from './RemindersList'

interface RemindersDemoProps {
  entityType?: string
  entityId?: string
}

export function RemindersDemo({ entityType, entityId }: RemindersDemoProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <RemindersList
        entityType={entityType}
        entityId={entityId}
        showCreateButton={true}
        showFilters={true}
      />
    </div>
  )
}