'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '../primitives/button'
import { cn } from '@open-mercato/shared/lib/utils'

export type TagColor = 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface TagBadgeProps {
  id: string
  name: string
  color?: TagColor
  description?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'removable'
  onRemove?: (tagId: string) => void
  className?: string
}

const colorClasses: Record<TagColor, string> = {
  gray: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function TagBadge({
  id,
  name,
  color = 'gray',
  description,
  size = 'md',
  variant = 'default',
  onRemove,
  className,
}: TagBadgeProps) {
  const handleRemove = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onRemove?.(id)
    },
    [onRemove, id]
  )

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      title={description}
    >
      {name}
      {variant === 'removable' && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 h-auto w-auto p-0 hover:bg-transparent"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </span>
  )
}