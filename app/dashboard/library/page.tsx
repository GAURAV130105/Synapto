'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlayCircle, Trash2, Clock, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ContentItem {
  id: string
  content_id: string
  created_at: string
  content: {
    id: string
    title: string
    description?: string
    youtube_url?: string
    thumbnail_url?: string
    transcript_status: string
    duration_seconds?: number
    created_at: string
  }
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [library, setLibrary] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch library from Supabase
  useEffect(() => {
    async function fetchLibrary() {
      try {
        const res = await fetch('/api/content/library')
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to fetch library')
        }
        const data = await res.json()
        setLibrary(data.library || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLibrary()
  }, [])

  const filteredContents = library.filter(item =>
    item.content.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (contentId: string) => {
    if (!confirm('Remove this content from your library?')) return

    setDeletingId(contentId)
    try {
      const res = await fetch('/api/content/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove content')
      }

      // Remove from local state
      setLibrary(prev => prev.filter(item => item.content_id !== contentId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">My Learning Library</h1>
        <p className="text-muted-foreground">
          {filteredContents.length} content{filteredContents.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {filteredContents.length === 0 ? (
        <Card className="p-12 text-center">
          <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground mb-2">
            {searchQuery ? 'No content matches your search' : 'Your library is empty'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {!searchQuery &&
              'Add educational content to get started with your personalized learning'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/add-content">
              <Button>Add Content</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContents.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/dashboard/content/${item.content.id}`}>
                <div className="aspect-video bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors relative">
                  {item.content.thumbnail_url ? (
                    <img
                      src={item.content.thumbnail_url}
                      alt={item.content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircle className="w-12 h-12 text-muted-foreground opacity-50" />
                  )}
                </div>
              </Link>

              <div className="p-4 space-y-3">
                <Link href={`/dashboard/content/${item.content.id}`}>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate">
                    {item.content.title}
                  </h3>
                </Link>

                {item.content.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.content.duration_seconds
                      ? `${Math.floor(item.content.duration_seconds / 60)} min`
                      : 'Unknown'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(item.content_id)
                    }}
                    disabled={deletingId === item.content_id}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                    title="Remove from library"
                  >
                    {deletingId === item.content_id ? (
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-destructive opacity-70 hover:opacity-100" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
