'use client'

import { ProjectComments } from '../widgets/injection/project-comments.client'

export default function ProjectCommentsPage({ projectId }: { projectId: string }) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Project Comments</h1>
      <ProjectComments projectId={projectId} />
    </div>
  )
}