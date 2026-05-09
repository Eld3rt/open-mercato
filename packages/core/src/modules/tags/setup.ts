import type { ModuleSetupConfig } from '@open-mercato/core'

export const setup: ModuleSetupConfig = {
  entities: () => [
    import('./data/entities'),
  ],
}