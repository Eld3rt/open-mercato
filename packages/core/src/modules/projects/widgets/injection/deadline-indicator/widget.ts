import { lazy } from 'react'
import type { InjectionDataWidgetModule } from '@open-mercato/shared/modules/widgets'
import { InjectionPosition } from '@open-mercato/shared/modules/widgets/injection-position'

const DeadlineIndicatorWidget = lazy(() => import('./widget.client'))

const widget: InjectionDataWidgetModule = {
  metadata: {
    id: 'projects.injection.deadline_indicator',
    title: 'Project Deadline Indicator',
    description: 'Shows deadline status icon in project list/detail.',
    features: ['projects.view'],
    position: InjectionPosition.DATA_TABLE_COLUMN_HEADER,
  },
  Widget: DeadlineIndicatorWidget,
}

export default widget
