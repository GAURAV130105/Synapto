'use client'

import dynamic from 'next/dynamic'

const VoiceAssistant = dynamic(() => import('@/components/voice-assistant'), {
  ssr: false,
})

export default function VoiceAssistantWrapper() {
  return <VoiceAssistant />
}
