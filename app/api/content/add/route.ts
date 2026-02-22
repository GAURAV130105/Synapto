import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { youtube_url, title, description, video_id } = await request.json()

    if (!youtube_url || !video_id) {
      return NextResponse.json(
        { error: 'YouTube URL and video ID are required' },
        { status: 400 }
      )
    }

    // Extract video metadata (thumbnail URL)
    const thumbnailUrl = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`

    // Check if content already exists
    const { data: existingContent } = await supabase
      .from('content')
      .select('id')
      .eq('youtube_url', youtube_url)
      .single()

    let contentId = existingContent?.id

    // Create new content record if it doesn't exist
    if (!contentId) {
      const { data: newContent, error: insertError } = await supabase
        .from('content')
        .insert({
          youtube_url,
          title: title || `Video - ${new Date().toLocaleDateString()}`,
          description,
          thumbnail_url: thumbnailUrl,
          transcript_status: 'pending',
          created_by: user.id,
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(`Failed to create content: ${insertError.message}`)
      }

      contentId = newContent.id
    }

    // Save to user's collection
    const { error: saveError } = await supabase.from('saved_content').insert({
      user_id: user.id,
      content_id: contentId,
    })

    if (saveError && !saveError.message.includes('duplicate')) {
      throw new Error(`Failed to save content: ${saveError.message}`)
    }

    return NextResponse.json({
      success: true,
      contentId,
      message: 'Content added successfully',
    })
  } catch (error: any) {
    console.error('[API] Error adding content:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
