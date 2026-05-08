'use client'

import * as React from 'react'
import { TagSelector, TagBadge, useTags, useEntityTags } from '@open-mercato/ui'

interface TagsDemoProps {
  entityType: string
  entityId: string
}

export function TagsDemo({ entityType, entityId }: TagsDemoProps) {
  const { tags: availableTags, createTag } = useTags()
  const { tags: entityTags, assignTags, unassignTags, loading } = useEntityTags(entityType, entityId)

  const selectedTagIds = entityTags.map(tag => tag.id)

  const handleSelectionChange = React.useCallback(async (tagIds: string[]) => {
    const currentIds = new Set(selectedTagIds)
    const newIds = new Set(tagIds)

    // Tags to assign
    const toAssign = tagIds.filter(id => !currentIds.has(id))
    // Tags to unassign
    const toUnassign = selectedTagIds.filter(id => !newIds.has(id))

    if (toAssign.length > 0) {
      await assignTags(toAssign)
    }
    if (toUnassign.length > 0) {
      await unassignTags(toUnassign)
    }
  }, [selectedTagIds, assignTags, unassignTags])

  const handleCreateTag = React.useCallback(async (name: string) => {
    return await createTag(name)
  }, [createTag])

  if (loading) {
    return <div>Loading tags...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Entity Tags</h3>
        <div className="flex flex-wrap gap-2">
          {entityTags.length > 0 ? (
            entityTags.map(tag => (
              <TagBadge
                key={tag.id}
                id={tag.id}
                name={tag.name}
                color={tag.color}
                description={tag.description}
              />
            ))
          ) : (
            <span className="text-muted-foreground">No tags assigned</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Tags</h3>
        <TagSelector
          availableTags={availableTags}
          selectedTagIds={selectedTagIds}
          onSelectionChange={handleSelectionChange}
          onCreateTag={handleCreateTag}
          placeholder="Add tags to this entity..."
        />
      </div>
    </div>
  )
}