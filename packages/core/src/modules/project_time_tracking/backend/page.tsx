import { lazy } from 'react'
import type { PageMetadata } from '@open-mercato/shared/lib/pages'

const ProjectTimeTrackingBackendPage = lazy(() => import('./page.client'))

export const metadata: PageMetadata = {
  title: 'Project Time Tracking',
  features: ['project_time_tracking.view'],
  layout: 'backend',
}

export default function Page() {
  return <ProjectTimeTrackingBackendPage />
}
