import type { InjectionWidget } from '@open-mercato/shared/lib/widgets/injection'

export const projectCommentsWidget: InjectionWidget = {
  id: 'project_comments.project.comments',
  position: InjectionPosition.AFTER,
  target: 'projects.show.comments',
  component: lazy(() => import('./project-comments.client')),
  metadata: {
    title: 'Project Comments',
    description: 'View and add comments to this project',
    features: ['project_comments.view'],
  },
}