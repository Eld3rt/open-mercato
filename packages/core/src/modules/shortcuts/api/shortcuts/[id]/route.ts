import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { EntityManager } from '@mikro-orm/postgresql'
import type { OpenApiRouteDoc } from '@open-mercato/shared/lib/openapi'
import { CrudHttpError } from '@open-mercato/shared/lib/crud/errors'
import { Shortcut } from '../../data/entities'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

export const metadata = {
  GET: { requireAuth: true, requireFeatures: ['shortcuts.view'] },
  POST: { requireAuth: true, requireFeatures: ['shortcuts.manage'] },
}

export const openApi: OpenApiRouteDoc = {
  tags: ['Shortcuts'],
  summary: 'Get shortcut by ID',
  description: 'Retrieve a specific shortcut',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Success',
    },
    404: {
      description: 'Shortcut not found',
    },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const em = request.em as EntityManager
    const auth = request.auth
    const organizationId = auth.organizationId
    const tenantId = auth.tenantId

    const { id } = paramsSchema.parse(params)

    const shortcut = await em.findOne(Shortcut, {
      id,
      organizationId,
      tenantId,
      deletedAt: null,
    })

    if (!shortcut) {
      throw new CrudHttpError(404, 'Shortcut not found')
    }

    return NextResponse.json(shortcut)
  } catch (error) {
    if (error instanceof CrudHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error fetching shortcut:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST to track access - increments access count and updates lastAccessedAt
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const em = request.em as EntityManager
    const auth = request.auth
    const organizationId = auth.organizationId
    const tenantId = auth.tenantId

    const { id } = paramsSchema.parse(params)

    const shortcut = await em.findOne(Shortcut, {
      id,
      organizationId,
      tenantId,
      deletedAt: null,
    })

    if (!shortcut) {
      throw new CrudHttpError(404, 'Shortcut not found')
    }

    // Update access tracking
    shortcut.accessCount += 1
    shortcut.lastAccessedAt = new Date()
    await em.flush()

    return NextResponse.json({
      success: true,
      accessCount: shortcut.accessCount,
      lastAccessedAt: shortcut.lastAccessedAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof CrudHttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    console.error('Error tracking shortcut access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}