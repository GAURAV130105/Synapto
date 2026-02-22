'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2, PlayCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AddContentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const videoId = extractVideoId(youtubeUrl)
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please use a valid YouTube link.')
      }

      const response = await fetch('/api/content/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
          title: title || `Video ${new Date().toLocaleDateString()}`,
          description,
          video_id: videoId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add content')
      }

      const { contentId } = await response.json()
      router.push(`/dashboard/content/${contentId}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Add YouTube Content</h1>
        <p className="text-muted-foreground">Upload educational videos with accessibility features</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL <span className="text-destructive">*</span></Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLoading}
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Copy and paste a direct YouTube link
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Content Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter a custom title for this content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use default date-based title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes or context about this content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !youtubeUrl}
            className="w-full h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Add Content
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-accent/5 border-accent/20">
        <h3 className="font-semibold text-foreground mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-accent">1.</span>
            <span>Video transcript will be extracted automatically</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent">2.</span>
            <span>Text is simplified for better comprehension</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent">3.</span>
            <span>Audio descriptions generated for images and diagrams</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-accent">4.</span>
            <span>Sign Language avatar translates content in real-time</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
