/**
 * Text-to-Sign Gloss Parser
 * Converts English text into ASL gloss notation.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'to', 'of', 'do', 'does', 'did', 'has', 'have', 'had', 'having',
  'very', 'really', 'just', 'also', 'so', 'too', 'quite'
])

const WORD_MAP = {
  "hello": "HELLO", "hi": "HELLO", "hey": "HELLO",
  "goodbye": "GOODBYE", "bye": "GOODBYE",
  "thank you": "THANK-YOU", "thanks": "THANK-YOU",
  "please": "PLEASE", "sorry": "SORRY", "welcome": "WELCOME",
  "what": "WHAT", "where": "WHERE", "when": "WHEN",
  "who": "WHO", "why": "WHY", "how": "HOW",
  "i": "I", "me": "I", "my": "MY", "you": "YOU", "your": "YOUR",
  "he": "HE", "she": "SHE", "her": "HER", "we": "WE", "they": "THEY",
  "want": "WANT", "need": "NEED", "like": "LIKE", "love": "LOVE",
  "know": "KNOW", "understand": "UNDERSTAND", "think": "THINK",
  "feel": "FEEL", "see": "SEE", "hear": "HEAR", "help": "HELP",
  "go": "GO", "come": "COME", "eat": "EAT", "drink": "DRINK",
  "sleep": "SLEEP", "work": "WORK", "learn": "LEARN", "teach": "TEACH",
  "play": "PLAY", "run": "RUN", "walk": "WALK", "stop": "STOP",
  "wait": "WAIT", "give": "GIVE", "take": "TAKE", "make": "MAKE",
  "say": "SAY", "ask": "ASK", "can": "CAN",
  "don't": "NOT", "can't": "CANNOT", "won't": "NOT-WILL",
  "i'm": "I", "i'll": "I WILL", "didn't": "NOT", "doesn't": "NOT",
  "name": "NAME", "friend": "FRIEND", "family": "FAMILY",
  "mother": "MOTHER", "father": "FATHER", "school": "SCHOOL",
  "home": "HOME", "food": "FOOD", "water": "WATER", "book": "BOOK",
  "phone": "PHONE", "money": "MONEY", "time": "TIME",
  "today": "TODAY", "tomorrow": "TOMORROW", "yesterday": "YESTERDAY",
  "good": "GOOD", "bad": "BAD", "big": "BIG", "small": "SMALL",
  "happy": "HAPPY", "sad": "SAD", "beautiful": "BEAUTIFUL",
  "new": "NEW", "old": "OLD", "hot": "HOT", "cold": "COLD",
  "yes": "YES", "no": "NO", "not": "NOT", "maybe": "MAYBE",
  "more": "MORE", "all": "ALL", "now": "NOW", "later": "LATER",
  "again": "AGAIN", "never": "NEVER", "always": "ALWAYS",
  "here": "HERE", "there": "THERE", "with": "WITH",
  "because": "BECAUSE", "but": "BUT", "if": "IF", "and": "AND", "or": "OR",
}

const MULTI_WORD_PHRASES = [
  { phrase: "thank you", gloss: "THANK-YOU" },
  { phrase: "excuse me", gloss: "EXCUSE-ME" },
  { phrase: "good morning", gloss: "GOOD MORNING" },
  { phrase: "i love you", gloss: "I LOVE YOU" },
  { phrase: "how are you", gloss: "HOW YOU" },
  { phrase: "what is your name", gloss: "YOUR NAME WHAT" },
  { phrase: "my name is", gloss: "MY NAME" },
  { phrase: "nice to meet you", gloss: "NICE MEET YOU" },
]

export function textToGloss(text) {
  if (!text?.trim()) return []
  let processed = text.toLowerCase().trim()
  const glosses = []
  let remaining = processed

  for (const { phrase, gloss } of MULTI_WORD_PHRASES) {
    if (remaining.includes(phrase)) {
      remaining = remaining.replace(phrase, '')
      glosses.push(...gloss.split(' '))
    }
  }

  const words = remaining.split(/\s+/).filter(w => w.length > 0)
  for (const word of words) {
    const cleaned = word.replace(/[.,!?;:'"]/g, '')
    if (!cleaned) continue
    if (WORD_MAP[cleaned]) {
      const mapped = WORD_MAP[cleaned]
      glosses.push(...mapped.split(' '))
    } else if (!STOP_WORDS.has(cleaned)) {
      glosses.push(cleaned.toUpperCase())
    }
  }
  return glosses
}

export async function textToGlossLLM(text, apiKey) {
  if (!text?.trim()) return []
  if (!apiKey) return textToGloss(text)

  try {
    const prompt = `You are an ASL gloss translator. Convert English to ASL gloss.
Rules: Topic-Comment structure, remove articles/be-verbs, UPPERCASE unknown words.
Examples: "What is your name?" → "YOUR NAME WHAT" | "I want to go to the store" → "I STORE GO WANT"
Translate: "${text}"
Output ONLY gloss tokens separated by spaces:`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
        })
      }
    )
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    const glossText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!glossText) throw new Error('Empty response')
    return glossText.replace(/[.,!;:'"]/g, '').split(/\s+/).filter(t => t.length > 0).map(t => t.toUpperCase())
  } catch (err) {
    console.error('LLM fallback to rule-based:', err)
    return textToGloss(text)
  }
}
