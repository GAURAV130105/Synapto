// YouTube utilities for extracting video information

export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Extract YouTube transcript using the server-side API.
 * This is a client-side helper that calls the /api/content/transcript endpoint.
 * For direct server-side usage, use the youtube-transcript package directly.
 */
export async function extractYoutubeTranscript(
  videoId: string,
  contentId?: string,
  title?: string,
  description?: string
): Promise<{ transcript: string; segments: Array<{ startTime: number; duration: number; text: string; formattedTime: string }> }> {
  try {
    const res = await fetch('/api/content/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: contentId || 'temp',
        video_id: videoId,
        title: title || '',
        description: description || '',
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to fetch transcript')
    }

    const data = await res.json()
    return {
      transcript: data.transcript || '',
      segments: data.segments || [],
    }
  } catch (error) {
    console.error('[YouTube] Error extracting transcript:', error)
    throw new Error('Failed to extract transcript')
  }
}
