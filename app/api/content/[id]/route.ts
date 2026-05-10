import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/content/[id] - Fetch a single content item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Log view activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        content_id: id,
        activity_type: 'view',
      })

    return NextResponse.json({ content: data })
  } catch (error: any) {
    console.error('[API] Error fetching content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/content/[id] — update editable fields (e.g. manual transcript when auto-fetch fails)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const transcript =
      typeof body.transcript === 'string' ? body.transcript.trim() : null

    if (transcript === null || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Non-empty transcript text is required' },
        { status: 400 }
      )
    }

    const { data: row, error: fetchErr } = await supabase
      .from('content')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (row.created_by && row.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: updated, error: updateErr } = await supabase
      .from('content')
      .update({
        transcript,
        transcript_status: 'completed',
        transcript_segments: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      throw new Error(updateErr.message)
    }

    return NextResponse.json({ content: updated })
  } catch (error: any) {
    console.error('[API] Error updating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 }
    )
  }
}
