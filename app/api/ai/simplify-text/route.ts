import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SIMPLIFICATION_PROMPTS: Record<string, string> = {
  /** UI sends `basic` */
  basic: `Rewrite this text in the simplest possible way. Use short sentences, common words, and explain any difficult concepts. Aim for a 6-8 grade reading level.`,
  beginner: `Rewrite this text in the simplest possible way. Use short sentences, common words, and explain any difficult concepts. Aim for a 6-8 grade reading level.`,
  intermediate: `Simplify this text while keeping most of the original meaning. Use clearer language and shorter sentences where possible. Aim for a 9-11 grade reading level.`,
  advanced: `Keep the text as is, maintaining the original academic language and meaning.`,
}

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

    const { text, level = 'intermediate' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Use Groq for text simplification
    if (!GROQ_API_KEY) {
      // Deterministic fallbacks so Basic / Intermediate / Advanced still differ without Groq
      const len = text.length
      const basicFallback =
        text
          .split(/[.!?]+/)
          .filter((s: string) => s.trim())
          .slice(0, 2)
          .map((s: string) => s.trim())
          .join('. ') + (text.includes('.') ? '.' : '')
      const intermediateFallback =
        len > 500
          ? (() => {
              const cut = text.slice(0, 500)
              const lp = cut.lastIndexOf('.')
              return lp > 80 ? cut.slice(0, lp + 1) : cut
            })()
          : text

      const simplifiedFallback =
        level === 'advanced'
          ? text
          : level === 'intermediate'
            ? intermediateFallback
            : basicFallback || text.slice(0, 280)

      console.warn('[API] GROQ_API_KEY not configured, returning local simplified text')
      return NextResponse.json({
        simplified: simplifiedFallback,
        message: 'API key not configured. Please set GROQ_API_KEY environment variable.',
      })
    }

    const prompt =
      SIMPLIFICATION_PROMPTS[level] ||
      SIMPLIFICATION_PROMPTS.intermediate

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at simplifying text while preserving its meaning. Your goal is to make complex text accessible to readers with different literacy levels.',
          },
          {
            role: 'user',
            content: `${prompt}\n\nText to simplify:\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const data = await response.json()
    const simplified = data.choices[0].message.content

    return NextResponse.json({ simplified })
  } catch (error: any) {
    console.error('[API] Error simplifying text:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to simplify text' },
      { status: 500 }
    )
  }
}
