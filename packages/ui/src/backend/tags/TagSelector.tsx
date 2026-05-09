'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../primitives/command'
import { cn } from '@open-mercato/shared/lib/utils'
import { TagBadge, type TagColor } from './TagBadge'

export interface Tag {
  id: string
  name: string
  color: TagColor
  description?: string
  isActive: boolean
}

export interface TagSelectorProps {
  availableTags: Tag[]
  selectedTagIds: string[]
  onSelectionChange: (tagIds: string[]) => void
  onCreateTag?: (name: string, color?: TagColor) => Promise<Tag | null>
  placeholder?: string
  maxSelection?: number
  disabled?: boolean
  className?: string
}

export function TagSelector({
  availableTags,
  selectedTagIds,
  onSelectionChange,
  onCreateTag,
  placeholder = 'Select tags...',
  maxSelection,
  disabled = false,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id))
  const availableTagOptions = availableTags.filter(tag => tag.isActive)

  const handleSelect = React.useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        onSelectionChange(selectedTagIds.filter(id => id !== tagId))
      } else {
        if (maxSelection && selectedTagIds.length >= maxSelection) {
          return
        }
        onSelectionChange([...selectedTagIds, tagId])
      }
    },
    [selectedTagIds, onSelectionChange, maxSelection]
  )

  const handleRemove = React.useCallback(
    (tagId: string) => {
      onSelectionChange(selectedTagIds.filter(id => id !== tagId))
    },
    [selectedTagIds, onSelectionChange]
  )

  const handleCreateTag = React.useCallback(async () => {
    if (!onCreateTag || !searchValue.trim()) return

    setIsCreating(true)
    try {
      const newTag = await onCreateTag(searchValue.trim())
      if (newTag) {
        handleSelect(newTag.id)
        setSearchValue('')
      }
    } finally {
      setIsCreating(false)
    }
  }, [onCreateTag, searchValue, handleSelect])

  const canCreateTag = onCreateTag &&
    searchValue.trim() &&
    !availableTagOptions.some(tag => tag.name.toLowerCase() === searchValue.trim().toLowerCase())

  return (
    <div className={cn('space-y-2', className)}>
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              id={tag.id}
              name={tag.name}
              color={tag.color}
              description={tag.description}
              variant="removable"
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Tag selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
              : placeholder
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {canCreateTag ? (
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={isCreating}
                      className="w-full justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isCreating ? 'Creating...' : `Create "${searchValue.trim()}"`}
                    </Button>
                  </div>
                ) : (
                  'No tags found.'
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableTagOptions.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  const isMaxReached = maxSelection && selectedTagIds.length >= maxSelection && !isSelected

                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => !isMaxReached && handleSelect(tag.id)}
                      className={cn(
                        'cursor-pointer',
                        isMaxReached && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <TagBadge
                        id={tag.id}
                        name={tag.name}
                        color={tag.color}
                        description={tag.description}
                        size="sm"
                        className="pointer-events-none"
                      />
                      {isMaxReached && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Max reached
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}