import { lazy } from 'react'
import type { PageMetadata } from '@open-mercato/shared/lib/pages'

const ProjectsBackendPage = lazy(() => import('./page.client'))

export const metadata: PageMetadata = {
  title: 'Projects',
  features: ['projects.view'],
  layout: 'backend',
}

export default function Page() {
  return <ProjectsBackendPage />
}
