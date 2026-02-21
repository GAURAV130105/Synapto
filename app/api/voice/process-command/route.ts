import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface CommandResult {
  action: string
  params: Record<string, string>
  response: string
  youtubeQuery?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transcript, context } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Voice transcript is required' },
        { status: 400 }
      )
    }

    const userName = user.user_metadata?.first_name || 'friend'

    // Fast local pattern matching
    const localResult = matchLocalCommand(transcript.toLowerCase().trim(), userName)
    if (localResult) {
      try {
        await supabase.from('user_activity').insert({
          user_id: user.id,
          activity_type: 'voice_command',
          metadata: { transcript, action: localResult.action, matched: 'local' },
        })
      } catch {}

      return NextResponse.json(localResult)
    }

    // Fallback to Groq LLM for complex queries
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        action: 'search_youtube',
        params: {},
        response: `Let me search for videos about "${transcript}".`,
        youtubeQuery: transcript,
      })
    }

    const systemPrompt = `You are a friendly, conversational voice assistant for Synapto, an inclusive education platform.
You chat naturally with the user and help them with tasks. Keep responses SHORT (1-2 sentences max) since they'll be spoken aloud.

Available actions:
- "navigate": Go to a page. params: { "path": "/dashboard" | "/dashboard/add-content" | "/dashboard/library" | "/dashboard/preferences" }
- "search_youtube": Search YouTube. Set youtubeQuery field. params: {}
- "play_video": Play a video from search results. params: {}
- "next_video": Play next video. params: {}
- "previous_video": Play previous video. params: {}
- "stop_video": Stop current video. params: {}
- "add_to_library": Save current/specified video to library. params: {}
- "read_aloud": Read page content aloud. params: {}
- "toggle_theme": Switch dark/light mode. params: {}
- "logout": Sign out. params: {}
- "stop_listening": Stop the assistant. params: {}
- "help": List what you can do. params: {}
- "greeting": Respond to greeting. params: {}

User: ${userName}
Page: ${context || 'dashboard'}

RESPOND ONLY with JSON:
{"action":"...","params":{},"response":"short spoken response","youtubeQuery":"optional"}`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const data = await response.json()
    const result: CommandResult = JSON.parse(data.choices[0].message.content)

    try {
      await supabase.from('user_activity').insert({
        user_id: user.id,
        activity_type: 'voice_command',
        metadata: { transcript, action: result.action, matched: 'llm' },
      })
    } catch {}

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Voice API] Command processing error:', error)
    return NextResponse.json({
      action: 'error',
      params: {},
      response: "Sorry, I didn't catch that. Could you say it again?",
    })
  }
}

function matchLocalCommand(text: string, userName: string): CommandResult | null {

  // ── Play / Video Controls (MUST be before search) ──

  if (
    text.includes('stop video') ||
    text.includes('close video') ||
    text.includes('stop playing') ||
    text.includes('close player')
  ) {
    return {
      action: 'stop_video',
      params: {},
      response: "Video stopped. What's next?",
    }
  }

  if (
    text.includes('next video') ||
    text.includes('next one') ||
    text.includes('skip') ||
    text === 'next'
  ) {
    return {
      action: 'next_video',
      params: {},
      response: 'Playing next video.',
    }
  }

  if (
    text.includes('previous video') ||
    text.includes('previous one') ||
    text.includes('go back') ||
    text === 'previous' ||
    text === 'back'
  ) {
    return {
      action: 'previous_video',
      params: {},
      response: 'Playing previous video.',
    }
  }

  if (
    text.match(/^play\b/) ||
    text.includes('play video') ||
    text.includes('play the') ||
    text.includes('play first') ||
    text.includes('play second') ||
    text.includes('play third') ||
    text.includes('play fourth') ||
    text.includes('play fifth') ||
    text.includes('play number') ||
    text.includes('play it') ||
    text.includes('watch it') ||
    text.includes('open video') ||
    text.includes('watch video') ||
    text.includes('watch first') ||
    text.includes('watch second') ||
    text.includes('watch third')
  ) {
    return {
      action: 'play_video',
      params: {},
      response: 'Playing the video now.',
    }
  }

  // ── Add to Library ──

  if (
    text.includes('add to library') ||
    text.includes('save video') ||
    text.includes('save this') ||
    text.includes('save it') ||
    text.includes('add this') ||
    text.includes('add first') ||
    text.includes('add second') ||
    text.includes('add third') ||
    text.includes('bookmark')
  ) {
    return {
      action: 'add_to_library',
      params: {},
      response: 'Adding it to your library.',
    }
  }

  // ── Stop / Sleep ──

  if (
    text.includes('stop listening') ||
    text.includes('go to sleep') ||
    text.includes('sleep') ||
    text.includes('shut up') ||
    text.includes('be quiet') ||
    text.includes('stop talking') ||
    text === 'stop' ||
    text === 'enough' ||
    text === 'bye' ||
    text === 'goodbye'
  ) {
    return {
      action: 'stop_listening',
      params: {},
      response: `Okay ${userName}, going to sleep. Tap my icon when you need me!`,
    }
  }

  // ── Navigation ──

  if (
    text.includes('go to dashboard') ||
    text.includes('show dashboard') ||
    text.includes('open dashboard') ||
    text === 'dashboard' ||
    text === 'home' ||
    text.includes('go home') ||
    text.includes('main page')
  ) {
    return {
      action: 'navigate',
      params: { path: '/dashboard' },
      response: 'Taking you to the dashboard.',
    }
  }

  if (
    text.includes('add content') ||
    text.includes('new content') ||
    text.includes('upload video') ||
    text.includes('add youtube')
  ) {
    return {
      action: 'navigate',
      params: { path: '/dashboard/add-content' },
      response: 'Opening the add content page.',
    }
  }

  if (
    text.includes('library') ||
    text.includes('my content') ||
    text.includes('saved content') ||
    text.includes('my videos') ||
    text.includes('my saves')
  ) {
    return {
      action: 'navigate',
      params: { path: '/dashboard/library' },
      response: 'Opening your library.',
    }
  }

  if (
    text.includes('preferences') ||
    text.includes('settings') ||
    text.includes('accessibility')
  ) {
    return {
      action: 'navigate',
      params: { path: '/dashboard/preferences' },
      response: 'Opening your settings.',
    }
  }

  // ── Logout ──

  if (
    text.includes('log out') ||
    text.includes('logout') ||
    text.includes('sign out') ||
    text.includes('sign off')
  ) {
    return {
      action: 'logout',
      params: {},
      response: `Signing you out, ${userName}. See you next time!`,
    }
  }

  // ── Theme ──

  if (
    text.includes('dark mode') ||
    text.includes('light mode') ||
    text.includes('toggle theme') ||
    text.includes('switch theme') ||
    text.includes('change theme')
  ) {
    return {
      action: 'toggle_theme',
      params: {},
      response: 'Theme switched!',
    }
  }

  // ── Read Aloud ──

  if (
    text.includes('read aloud') ||
    text.includes('read page') ||
    text.includes('read content') ||
    text.includes('read this') ||
    text.includes('read out') ||
    text.includes('read it')
  ) {
    return {
      action: 'read_aloud',
      params: {},
      response: "Reading the page for you.",
    }
  }

  // ── Simplify ──

  if (text.includes('simplify')) {
    let level = 'intermediate'
    if (text.includes('easy') || text.includes('simple') || text.includes('beginner')) {
      level = 'beginner'
    } else if (text.includes('advanced')) {
      level = 'advanced'
    }
    return {
      action: 'simplify_text',
      params: { level },
      response: `Simplifying to ${level} level.`,
    }
  }

  // ── Help ──

  if (
    text.includes('help') ||
    text.includes('what can you do') ||
    text.includes('commands') ||
    text.includes('what commands')
  ) {
    return {
      action: 'help',
      params: {},
      response: `Here's what I can do: Search for YouTube videos and play them. Navigate to any page. Add videos to your library. Read content aloud. Switch themes. And sign you out. Just talk to me naturally, ${userName}!`,
    }
  }

  // ── Greeting ──

  if (
    text === 'hello' ||
    text === 'hey' ||
    text === 'hi' ||
    text.startsWith('hi ') ||
    text.startsWith('hey ') ||
    text.startsWith('hello ') ||
    text === 'good morning' ||
    text === 'good evening' ||
    text === 'good afternoon' ||
    text.includes('how are you')
  ) {
    return {
      action: 'greeting',
      params: {},
      response: `Hey ${userName}! I'm here and ready. What would you like to do?`,
    }
  }

  // ── YouTube Search (catch-all) ──

  if (
    text.includes('search') ||
    text.includes('find') ||
    text.includes('look for') ||
    text.includes('show me') ||
    text.includes('find me') ||
    text.includes('youtube') ||
    text.includes('video about') ||
    text.includes('videos about') ||
    text.includes('tutorial') ||
    text.includes('learn about') ||
    text.includes('teach me') ||
    text.includes('explain') ||
    text.includes('how to') ||
    text.includes('what is') ||
    text.includes('tell me about')
  ) {
    let searchQuery = text
      .replace(
        /^(search|find|look for|show me|find me|search for|search youtube for|search youtube|find videos about|find video about|videos about|video about|learn about|teach me about|teach me|explain|how to|what is|tell me about)/i,
        ''
      )
      .trim()

    if (!searchQuery || searchQuery.length < 2) {
      searchQuery = text
    }

    return {
      action: 'search_youtube',
      params: {},
      response: `Searching for "${searchQuery}".`,
      youtubeQuery: searchQuery,
    }
  }

  return null
}
