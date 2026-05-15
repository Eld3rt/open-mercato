import { lazy } from 'react'
import type { PageMetadata } from '@open-mercato/shared/lib/pages'

const ProjectCommentsPage = lazy(() => import('./page.client'))

export const metadata: PageMetadata = {
  title: 'Project Comments',
  features: ['project_comments.view'],
  layout: 'backend',
}

export default function Page({ params }: { params: { projectId: string } }) {
  return <ProjectCommentsPage projectId={params.projectId} />
}