/**
 * @jest-environment jsdom
 */

import * as React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@open-mercato/shared/lib/testing/renderWithProviders'
import { usePortalInjectedMenuItems } from '../usePortalInjectedMenuItems'

jest.mock('../../backend/injection/useInjectionDataWidgets', () => ({
  useInjectionDataWidgets: jest.fn(),
}))
jest.mock('../../backend/utils/apiCall', () => ({
  apiCall: jest.fn(),
}))
jest.mock('../PortalContext', () => ({
  usePortalContext: jest.fn(),
}))

const mockUseInjectionDataWidgets = require('../../backend/injection/useInjectionDataWidgets')
  .useInjectionDataWidgets as jest.Mock
const mockApiCall = require('../../backend/utils/apiCall').apiCall as jest.Mock
const mockUsePortalContext = require('../PortalContext').usePortalContext as jest.Mock

function TestComponent() {
  const { items, isLoading } = usePortalInjectedMenuItems('menu:portal:sidebar:main')
  return (
    <div>
      <div data-testid="items">{JSON.stringify(items)}</div>
      <div data-testid="loading">{String(isLoading)}</div>
    </div>
  )
}

describe('usePortalInjectedMenuItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePortalContext.mockReturnValue({ orgSlug: 'acme-corp' })
    mockUseInjectionDataWidgets.mockReturnValue({
      widgets: [
        {
          menuItems: [
            { id: 'root', label: 'Portal Home', href: '/portal' },
            { id: 'dashboard', label: 'Dashboard', href: '/portal/dashboard' },
            { id: 'search', label: 'Search', href: '/portal?tab=search' },
            { id: 'anchor', label: 'Anchor', href: '/portal#top' },
          ],
        },
      ],
      isLoading: false,
    })
    mockApiCall.mockResolvedValue({ ok: true, result: { ok: true, granted: [] } })
  })

  it('prefixes portal-relative hrefs with orgSlug', async () => {
    renderWithProviders(<TestComponent />)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    const items = JSON.parse(screen.getByTestId('items').textContent ?? '[]')

    expect(items).toEqual([
      { id: 'root', label: 'Portal Home', href: '/acme-corp/portal', features: [] },
      { id: 'dashboard', label: 'Dashboard', href: '/acme-corp/portal/dashboard', features: [] },
      { id: 'search', label: 'Search', href: '/acme-corp/portal?tab=search', features: [] },
      { id: 'anchor', label: 'Anchor', href: '/acme-corp/portal#top', features: [] },
    ])
  })
})
