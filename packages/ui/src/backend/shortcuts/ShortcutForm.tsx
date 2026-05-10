'use client'

import * as React from 'react'
import { Button } from '@open-mercato/ui/primitives/button'
import { Input } from '@open-mercato/ui/primitives/input'
import { Label } from '@open-mercato/ui/primitives/label'
import { Textarea } from '@open-mercato/ui/primitives/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@open-mercato/ui/primitives/dialog'
import type { Shortcut } from './useShortcuts'

interface ShortcutFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; url: string; description?: string; icon?: string }) => Promise<void>
  shortcut?: Shortcut | null
  title?: string
}

const commonIcons = ['🔗', '📊', '👥', '💼', '📦', '📈', '⚙️', '🔍', '🔔', '📅', '✉️', '❤️', '⭐']

export function ShortcutForm({
  isOpen,
  onClose,
  onSubmit,
  shortcut,
  title = shortcut ? 'Edit Shortcut' : 'Add Shortcut',
}: ShortcutFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    url: '',
    description: '',
    icon: '',
  })
  const [loading, setLoading] = React.useState(false)
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (shortcut) {
      setFormData({
        name: shortcut.name,
        url: shortcut.url,
        description: shortcut.description || '',
        icon: shortcut.icon || '',
      })
      setSelectedEmoji(shortcut.icon || null)
    } else {
      setFormData({
        name: '',
        url: '',
        description: '',
        icon: '',
      })
      setSelectedEmoji(null)
    }
  }, [shortcut, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        name: formData.name,
        url: formData.url,
        description: formData.description || undefined,
        icon: selectedEmoji || undefined,
      }

      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Failed to submit shortcut:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Customer Dashboard"
              required
            />
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/dashboard"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <Label>Icon (optional)</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg mb-2">
              {commonIcons.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`text-2xl p-2 rounded transition-all ${
                    selectedEmoji === emoji ? 'bg-blue-200 scale-110' : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                className={`text-2xl p-2 rounded transition-all ${
                  selectedEmoji === null ? 'bg-blue-200 scale-110' : 'hover:bg-gray-200'
                }`}
                onClick={() => setSelectedEmoji(null)}
              >
                None
              </button>
            </div>
            <Input
              value={selectedEmoji || ''}
              onChange={(e) => setSelectedEmoji(e.target.value || null)}
              placeholder="Or paste an emoji"
              className="text-center text-2xl"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.url}>
              {loading ? 'Saving...' : shortcut ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}