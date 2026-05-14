import { lazy } from 'react'
import type { PageMetadata } from '@open-mercato/shared/lib/pages'

const ProjectCommentsBackendPage = lazy(() => import('./page.client'))

export const metadata: PageMetadata = {
  title: 'Project Comments Management',
  features: ['project_comments.view'],
  layout: 'backend',
}

export default function Page() {
  return <ProjectCommentsBackendPage />
}