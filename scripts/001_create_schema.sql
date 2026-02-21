-- Synapto - Inclusive Education Platform Database Schema

-- Create profiles table (auto-created from auth triggers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  font_size TEXT DEFAULT 'normal',
  high_contrast_mode BOOLEAN DEFAULT FALSE,
  focus_mode_default BOOLEAN DEFAULT FALSE,
  language_level TEXT DEFAULT 'intermediate',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create content table for saved educational videos
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  transcript_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create saved_content table for user favorites
CREATE TABLE IF NOT EXISTS public.saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, content_id)
);

-- Create sign_language_library table for ASL animations
CREATE TABLE IF NOT EXISTS public.sign_language_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english_word TEXT NOT NULL UNIQUE,
  asl_gloss TEXT NOT NULL,
  keypoint_animation JSONB NOT NULL,
  animation_duration_ms INTEGER DEFAULT 1000,
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_interactions table for tracking progress
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  watched_duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_language_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for content (public read, authenticated write)
CREATE POLICY "Allow public to view content" ON public.content
  FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated users to insert content" ON public.content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for saved_content
CREATE POLICY "Allow users to view their own saved content" ON public.saved_content
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own saved content" ON public.saved_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own saved content" ON public.saved_content
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sign_language_library (public read)
CREATE POLICY "Allow public to view sign language library" ON public.sign_language_library
  FOR SELECT USING (TRUE);

-- RLS Policies for user_interactions
CREATE POLICY "Allow users to view their own interactions" ON public.user_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_content_user_id ON public.saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_content_id ON public.saved_content(content_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content_id ON public.user_interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_youtube_url ON public.content(youtube_url);
CREATE INDEX IF NOT EXISTS idx_sign_language_library_english_word ON public.sign_language_library(english_word);
