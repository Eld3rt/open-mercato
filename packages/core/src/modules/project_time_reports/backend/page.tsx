import { lazy } from 'react'
import type { PageMetadata } from '@open-mercato/shared/lib/pages'

const TimeReportsPage = lazy(() => import('./page.client'))

export const metadata: PageMetadata = {
  title: 'Time Tracking Reports',
  features: ['project_time_reports.view'],
  layout: 'backend',
}

export default function Page() {
  return <TimeReportsPage />
}
