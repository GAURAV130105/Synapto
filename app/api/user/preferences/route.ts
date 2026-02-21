import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/preferences - Fetch user preferences
 * POST /api/user/preferences - Save user preferences
 */

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ preferences: data?.preferences || {} })
  } catch (error: any) {
    console.error('[API] Error fetching preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preferences } = await request.json()

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferences object is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('id', user.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error: any) {
    console.error('[API] Error saving preferences:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save preferences' },
      { status: 500 }
    )
  }
}
