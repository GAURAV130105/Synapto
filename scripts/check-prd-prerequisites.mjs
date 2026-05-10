import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'app/api/ai/generate-audio/route.ts',
  'app/api/ai/simplify-text/route.ts',
  'app/api/content/[id]/route.ts',
  'app/api/content/add/route.ts',
  'app/api/content/library/route.ts',
  'app/api/content/remove/route.ts',
  'app/api/content/transcript/route.ts',
  'app/api/user/preferences/route.ts',
  'app/api/voice/process-command/route.ts',
  'app/api/voice/youtube-search/route.ts',
  'app/auth/callback/route.ts',
  'app/auth/error/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/sign-up/page.tsx',
  'app/auth/sign-up-success/page.tsx',
  'app/dashboard/add-content/page.tsx',
  'app/dashboard/content/[id]/page.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/library/page.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/preferences/page.tsx',
  'components/features/audio-narrative.tsx',
  'components/features/focus-mode.tsx',
  'components/features/language-leveler.tsx',
  'components/features/sign-3d/sign-language-3d.tsx',
  'components/voice-assistant.tsx',
  'components/voice-assistant-wrapper.tsx',
  'lib/supabase/client.ts',
  'lib/supabase/proxy.ts',
  'lib/supabase/server.ts',
  'middleware.ts',
]

const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
const optionalEnv = ['GROQ_API_KEY', 'OPENAI_API_KEY']

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath))
}

const missingFiles = requiredFiles.filter((f) => !exists(f))
const missingRequiredEnv = requiredEnv.filter((name) => !process.env[name])
const missingOptionalEnv = optionalEnv.filter((name) => !process.env[name])

console.log('Synapto PRD prerequisites check')
console.log('--------------------------------')
console.log(`Required files checked: ${requiredFiles.length}`)
console.log(`Missing required files: ${missingFiles.length}`)

if (missingFiles.length > 0) {
  console.log('\nMissing files:')
  for (const file of missingFiles) console.log(`- ${file}`)
}

console.log('\nEnvironment variables')
console.log(`- Required missing: ${missingRequiredEnv.length}`)
for (const key of missingRequiredEnv) console.log(`  - ${key}`)

console.log(`- Optional missing: ${missingOptionalEnv.length}`)
for (const key of missingOptionalEnv) console.log(`  - ${key}`)

if (missingFiles.length > 0 || missingRequiredEnv.length > 0) {
  console.error('\nPRD prerequisite check failed.')
  process.exit(1)
}

console.log('\nPRD prerequisite check passed.')
