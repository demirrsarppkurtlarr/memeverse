-- ============================================================
-- ADDITIONAL HELPERS — Run AFTER schema.sql
-- ============================================================

-- Atomic increment for sound likes via API
-- (meme likes are handled by trigger in schema.sql)
CREATE OR REPLACE FUNCTION public.increment_sound_likes(sound_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sounds SET likes = likes + 1 WHERE id = sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_sound_likes(sound_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sounds SET likes = GREATEST(likes - 1, 0) WHERE id = sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment upload count on profile
CREATE OR REPLACE FUNCTION public.increment_profile_uploads(profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET upload_count = upload_count + 1 WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic view increment with dedup window
-- (dedup is now handled in application layer — this is just the raw increment)
CREATE OR REPLACE FUNCTION public.increment_meme_views(meme_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.memes SET views = views + 1 WHERE id = meme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get trending memes for a specific language/region
CREATE OR REPLACE FUNCTION public.get_trending_by_language(lang TEXT, lim INT DEFAULT 20)
RETURNS SETOF public.memes AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM public.memes
    WHERE is_active = TRUE
      AND language = lang
    ORDER BY score DESC
    LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full cleanup: deactivate old low-engagement Reddit content
CREATE OR REPLACE FUNCTION public.cleanup_old_content()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  UPDATE public.memes
  SET is_active = FALSE
  WHERE source = 'reddit'
    AND is_active = TRUE
    AND created_at < NOW() - INTERVAL '30 days'
    AND score < 0.001;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
