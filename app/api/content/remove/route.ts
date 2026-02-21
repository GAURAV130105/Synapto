import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/content/remove - Remove content from user's library
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content_id } = await request.json()

    if (!content_id) {
      return NextResponse.json(
        { error: 'content_id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('saved_content')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', content_id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Error removing content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove content' },
      { status: 500 }
    )
  }
}
