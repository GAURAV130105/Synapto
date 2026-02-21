import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/content/library - Fetch user's saved content library
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_content')
      .select(`
        id,
        user_id,
        content_id,
        created_at,
        content (
          id,
          title,
          description,
          youtube_url,
          thumbnail_url,
          transcript_status,
          duration_seconds,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ library: data || [] })
  } catch (error: any) {
    console.error('[API] Error fetching library:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch library' },
      { status: 500 }
    )
  }
}
