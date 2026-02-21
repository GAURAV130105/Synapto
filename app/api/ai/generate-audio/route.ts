import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // For now, generate a mock audio URL
    // In production, integrate with text-to-speech service (e.g., ElevenLabs, Google Cloud TTS)
    const mockAudioUrl = `data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==`

    // TODO: Integrate with actual TTS service
    // Example with ElevenLabs:
    // const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...', {
    //   method: 'POST',
    //   headers: {
    //     'xi-api-key': process.env.ELEVENLABS_API_KEY,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ text, voice_id: '...' }),
    // })

    return NextResponse.json({
      audioUrl: mockAudioUrl,
      message:
        'Audio generation available with API key configuration (ElevenLabs, Google Cloud TTS, etc.)',
    })
  } catch (error: any) {
    console.error('[API] Error generating audio:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}
