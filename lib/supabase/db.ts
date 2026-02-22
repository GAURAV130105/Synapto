/**
 * Supabase Database Helpers for Synapto
 * Server-side functions for CRUD operations with proper auth checks
 */

import { createClient } from './server'
import type {
  Profile,
  ProfileUpdate,
  Content,
  ContentInsert,
  SavedContentWithDetails,
  UserPreferences,
  UserActivityInsert,
} from './types'

// ─── Profile Operations ───

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[Supabase] Error fetching profile:', error.message)
    return null
  }
  return data as Profile
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[Supabase] Error updating profile:', error.message)
    return null
  }
  return data as Profile
}

export async function updatePreferences(preferences: UserPreferences): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('profiles')
    .update({ preferences })
    .eq('id', user.id)

  if (error) {
    console.error('[Supabase] Error updating preferences:', error.message)
    return false
  }
  return true
}

// ─── Content Operations ───

export async function getContent(contentId: string): Promise<Content | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single()

  if (error) {
    console.error('[Supabase] Error fetching content:', error.message)
    return null
  }
  return data as Content
}

export async function createContent(content: ContentInsert): Promise<Content | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content')
    .insert(content)
    .select()
    .single()

  if (error) {
    console.error('[Supabase] Error creating content:', error.message)
    return null
  }
  return data as Content
}

// ─── Saved Content Operations ───

export async function getSavedContent(limit = 20): Promise<SavedContentWithDetails[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_content')
    .select(`
      id,
      user_id,
      content_id,
      created_at,
      content (
        id,
        title,
        description,
        youtube_url,
        thumbnail_url,
        transcript,
        transcript_status,
        duration_seconds,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Supabase] Error fetching saved content:', error.message)
    return []
  }

  return (data || []) as unknown as SavedContentWithDetails[]
}

export async function saveContent(contentId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('saved_content')
    .insert({ user_id: user.id, content_id: contentId })

  if (error && !error.message.includes('duplicate')) {
    console.error('[Supabase] Error saving content:', error.message)
    return false
  }
  return true
}

export async function unsaveContent(contentId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('saved_content')
    .delete()
    .eq('user_id', user.id)
    .eq('content_id', contentId)

  if (error) {
    console.error('[Supabase] Error unsaving content:', error.message)
    return false
  }
  return true
}

// ─── Activity Logging ───

export async function logActivity(activity: Omit<UserActivityInsert, 'user_id'>): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('user_activity')
    .insert({ ...activity, user_id: user.id })

  if (error) {
    console.error('[Supabase] Error logging activity:', error.message)
    return false
  }
  return true
}

export async function getRecentActivity(limit = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_activity')
    .select(`
      *,
      content (id, title, thumbnail_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Supabase] Error fetching activity:', error.message)
    return []
  }
  return data || []
}

// ─── Stats / Progress ───

export async function getUserStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [savedResult, activityResult] = await Promise.all([
    supabase
      .from('saved_content')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id),
    supabase
      .from('user_activity')
      .select('activity_type', { count: 'exact' })
      .eq('user_id', user.id),
  ])

  return {
    totalSaved: savedResult.count || 0,
    totalActivities: activityResult.count || 0,
  }
}
