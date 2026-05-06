import type { NotificationAction } from '@open-mercato/shared/modules/notifications/types'

export function isSafeNotificationHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

export function assertSafeNotificationHref(href: string | undefined | null): string | undefined {
  if (href == null) {
    return undefined
  }

  if (!isSafeNotificationHref(href)) {
    throw new Error('Notification href must be a same-origin relative path starting with /')
  }

  return href
}

export type NotificationHrefContext = {
  sourceEntityId?: string | null
  sourceEntityType?: string | null
  sourceModule?: string | null
}

export function renderNotificationHref(href: string | undefined, context: NotificationHrefContext): string | undefined {
  if (!href) return undefined

  const placeholderMap: Array<[keyof NotificationHrefContext, string]> = [
    ['sourceEntityId', context.sourceEntityId ?? ''],
    ['sourceEntityType', context.sourceEntityType ?? ''],
    ['sourceModule', context.sourceModule ?? ''],
  ]

  let renderedHref = href

  for (const [key, value] of placeholderMap) {
    const placeholder = `{${key}}`
    if (renderedHref.includes(placeholder) && !value) {
      return undefined
    }
    renderedHref = renderedHref.split(placeholder).join(value)
  }

  return renderedHref
}

export function sanitizeNotificationActions(
  actions: NotificationAction[] | undefined,
): NotificationAction[] | undefined {
  if (!actions) {
    return undefined
  }

  return actions.map(action => (action.href ? { ...action, href: assertSafeNotificationHref(action.href) } : action))
}
