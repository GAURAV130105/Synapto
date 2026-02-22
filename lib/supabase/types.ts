/**
 * Supabase Database Types for Synapto
 * Auto-generated types matching the schema.sql definitions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Preferences JSON shape ───
export interface UserPreferences {
  fontSize?: 'small' | 'normal' | 'large' | 'xlarge'
  highContrast?: boolean
  focusMode?: boolean
  languageLevel?: 'beginner' | 'intermediate' | 'advanced'
  enableSignLanguage?: boolean
  enableAudioNarrative?: boolean
  textSpacing?: number
}

// ─── Table row types ───
export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  title: string
  description: string | null
  youtube_url: string | null
  thumbnail_url: string | null
  transcript: string | null
  transcript_status: 'pending' | 'processing' | 'completed' | 'failed'
  duration_seconds: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SavedContent {
  id: string
  user_id: string
  content_id: string
  created_at: string
}

// Joined type when fetching saved content with content details
export interface SavedContentWithDetails extends SavedContent {
  content: Content
}

export interface SimplifiedContent {
  id: string
  content_id: string
  original_text: string
  simplified_text: string
  level: 'beginner' | 'intermediate' | 'advanced'
  provider: string | null
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  content_id: string | null
  activity_type: 'view' | 'simplify' | 'audio' | 'sign_language' | 'complete'
  metadata: Json
  created_at: string
}

// ─── Insert types (omit auto-generated fields) ───
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

export type ContentInsert = Omit<Content, 'id' | 'created_at' | 'updated_at'>
export type ContentUpdate = Partial<Omit<Content, 'id' | 'created_at'>>

export type SavedContentInsert = Omit<SavedContent, 'id' | 'created_at'>
export type UserActivityInsert = Omit<UserActivity, 'id' | 'created_at'>

// ─── Database type map (for use with Supabase client generics) ───
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      content: {
        Row: Content
        Insert: ContentInsert
        Update: ContentUpdate
      }
      saved_content: {
        Row: SavedContent
        Insert: SavedContentInsert
        Update: never
      }
      simplified_content: {
        Row: SimplifiedContent
        Insert: Omit<SimplifiedContent, 'id' | 'created_at'>
        Update: never
      }
      user_activity: {
        Row: UserActivity
        Insert: UserActivityInsert
        Update: never
      }
    }
  }
}
