-- ============================================================
-- MEMEVERSE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  upload_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEMES TABLE
-- ============================================================
CREATE TABLE public.memes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,                    -- direct media URL
  thumbnail_url TEXT,                   -- optimized thumbnail
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
  width INT,
  height INT,
  file_size BIGINT,
  
  -- Source tracking
  source TEXT NOT NULL DEFAULT 'upload' CHECK (source IN ('reddit', 'upload', 'twitter', 'tiktok')),
  source_id TEXT UNIQUE,                -- external ID to deduplicate
  source_url TEXT,                      -- original link
  subreddit TEXT,
  author_name TEXT,
  
  -- Classification
  category TEXT NOT NULL DEFAULT 'global' CHECK (category IN ('global', 'turkish', 'trending', 'classic', 'nsfw')),
  language TEXT NOT NULL DEFAULT 'en',
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metrics
  views INT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  score FLOAT NOT NULL DEFAULT 0,       -- trending score
  reddit_score INT NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_nsfw BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Relations
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SOUNDS TABLE
-- ============================================================
CREATE TABLE public.sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,                    -- R2 audio URL
  duration_ms INT,                      -- milliseconds
  file_size BIGINT,
  
  -- Classification
  category TEXT NOT NULL DEFAULT 'funny' CHECK (category IN ('funny', 'bass', 'anime', 'gaming', 'movie', 'turkish', 'meme', 'classic')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en',
  
  -- Metrics
  plays INT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Relations
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LIKES TABLE
-- ============================================================
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('meme', 'sound')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- ============================================================
-- FAVORITES TABLE
-- ============================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('meme', 'sound')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- ============================================================
-- VIEWS TABLE (for analytics)
-- ============================================================
CREATE TABLE public.views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meme_id UUID NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT,                         -- hashed IP for anonymous tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCRAPER LOG TABLE
-- ============================================================
CREATE TABLE public.scraper_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  fetched_count INT NOT NULL DEFAULT 0,
  inserted_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_memes_category ON public.memes(category);
CREATE INDEX idx_memes_score ON public.memes(score DESC);
CREATE INDEX idx_memes_created_at ON public.memes(created_at DESC);
CREATE INDEX idx_memes_source_id ON public.memes(source_id);
CREATE INDEX idx_memes_tags ON public.memes USING GIN(tags);
CREATE INDEX idx_memes_is_active ON public.memes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_memes_language ON public.memes(language);
CREATE INDEX idx_memes_title_trgm ON public.memes USING GIN(title gin_trgm_ops);

CREATE INDEX idx_sounds_category ON public.sounds(category);
CREATE INDEX idx_sounds_plays ON public.sounds(plays DESC);

CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_likes_content ON public.likes(content_type, content_id);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_content ON public.favorites(content_type, content_id);

CREATE INDEX idx_views_meme ON public.views(meme_id);
CREATE INDEX idx_views_created ON public.views(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Memes: public read active memes, authenticated upload
CREATE POLICY "Active memes are publicly readable" ON public.memes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Authenticated users can insert memes" ON public.memes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sounds: public read
CREATE POLICY "Active sounds are publicly readable" ON public.sounds FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Authenticated users can insert sounds" ON public.sounds FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Likes: own read/write
CREATE POLICY "Users can manage own likes" ON public.likes USING (auth.uid() = user_id);

-- Favorites: own read/write
CREATE POLICY "Users can manage own favorites" ON public.favorites USING (auth.uid() = user_id);

-- Views: insert always, read own
CREATE POLICY "Anyone can record views" ON public.views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can read own views" ON public.views FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update meme like count
CREATE OR REPLACE FUNCTION public.update_meme_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.content_type = 'meme' THEN
    UPDATE public.memes SET likes = likes + 1 WHERE id = NEW.content_id;
  ELSIF TG_OP = 'DELETE' AND OLD.content_type = 'meme' THEN
    UPDATE public.memes SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.content_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_meme_likes();

-- Update sound play count
CREATE OR REPLACE FUNCTION public.increment_sound_plays(sound_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sounds SET plays = plays + 1 WHERE id = sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update meme view count
CREATE OR REPLACE FUNCTION public.increment_meme_views(meme_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.memes SET views = views + 1 WHERE id = meme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trending score calculation
-- score = (likes * 3 + views * 0.5 + reddit_score * 0.1) / (hours_since_post + 2)^1.5
CREATE OR REPLACE FUNCTION public.calculate_trending_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE public.memes
  SET score = (
    (likes * 3.0 + views * 0.5 + reddit_score * 0.1) /
    POW(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 + 2, 1.5)
  )
  WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER memes_updated_at BEFORE UPDATE ON public.memes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER sounds_updated_at BEFORE UPDATE ON public.sounds FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE OR REPLACE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SEED DATA: Sample SFX Sounds
-- ============================================================
INSERT INTO public.sounds (title, description, url, duration_ms, category, tags, language, plays) VALUES
  ('Bruh', 'The classic bruh sound effect', 'https://www.myinstants.com/media/sounds/bruh.mp3', 1000, 'meme', ARRAY['bruh', 'classic', 'reaction'], 'en', 15420),
  ('Vine Boom', 'Classic Vine boom sound', 'https://www.myinstants.com/media/sounds/vine-boom.mp3', 500, 'meme', ARRAY['vine', 'boom', 'classic'], 'en', 89234),
  ('Air Horn', 'Air horn blast', 'https://www.myinstants.com/media/sounds/air-horn-club-sample.mp3', 3000, 'funny', ARRAY['airhorn', 'loud', 'celebration'], 'en', 43211),
  ('Sad Violin', 'World''s smallest violin', 'https://www.myinstants.com/media/sounds/the-price-is-right-losing-horn.mp3', 3500, 'funny', ARRAY['sad', 'violin', 'meme'], 'en', 28903),
  ('Windows XP Error', 'Windows XP error sound', 'https://www.myinstants.com/media/sounds/windows-xp-error.mp3', 1200, 'classic', ARRAY['windows', 'error', 'nostalgia'], 'en', 67823),
  ('Oof', 'Roblox oof sound', 'https://www.myinstants.com/media/sounds/roblox-oof.mp3', 800, 'gaming', ARRAY['roblox', 'oof', 'gaming'], 'en', 112045),
  ('Tuturu', 'Steins;Gate Tuturu', 'https://www.myinstants.com/media/sounds/tuturu.mp3', 1500, 'anime', ARRAY['steinsgate', 'tuturu', 'anime'], 'en', 34521),
  ('Nani', 'Omae wa mou shindeiru', 'https://www.myinstants.com/media/sounds/nani.mp3', 2000, 'anime', ARRAY['nani', 'anime', 'meme'], 'en', 78932),
  ('MLG Air Horn', 'MLG air horn', 'https://www.myinstants.com/media/sounds/airhorn.mp3', 3000, 'gaming', ARRAY['mlg', 'airhorn', 'gaming'], 'en', 54321),
  ('Dramatic Chipmunk', 'Dramatic chipmunk stare', 'https://www.myinstants.com/media/sounds/dramatic-chipmunk.mp3', 5000, 'classic', ARRAY['dramatic', 'chipmunk', 'classic'], 'en', 92341),
  ('Hahaha Nelson', 'Nelson haha from Simpsons', 'https://www.myinstants.com/media/sounds/haha.mp3', 1000, 'classic', ARRAY['simpsons', 'nelson', 'haha'], 'en', 43219),
  ('İlk Bullet Bass', 'Türk bass drop', 'https://www.myinstants.com/media/sounds/turkish-bass.mp3', 5000, 'turkish', ARRAY['turkish', 'bass', 'drop'], 'tr', 23456);
