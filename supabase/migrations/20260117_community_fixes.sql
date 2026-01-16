-- Community and Social Features Fixes
-- Created: 2026-01-17
-- Purpose: Add missing tables for likes, comments on posts, and ensure all features work

-- 1. Create post_likes table for tracking post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
CREATE POLICY "Anyone can view post likes" ON public.post_likes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;
CREATE POLICY "Users can unlike posts" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Create post_comments table for comments on posts
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT,
    author_avatar TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post comments" ON public.post_comments;
CREATE POLICY "Anyone can view post comments" ON public.post_comments
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can comment on posts" ON public.post_comments;
CREATE POLICY "Users can comment on posts" ON public.post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their comments" ON public.post_comments;
CREATE POLICY "Users can update their comments" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their comments" ON public.post_comments;
CREATE POLICY "Users can delete their comments" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Add more columns to posts table for compatibility
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_avatar_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'post';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'community';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS achievement_data JSONB DEFAULT NULL;

-- 4. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
CREATE POLICY "Anyone can view comment likes" ON public.comment_likes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can like comments" ON public.comment_likes;
CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike comments" ON public.comment_likes;
CREATE POLICY "Users can unlike comments" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON public.post_comments(user_id);

-- 6. Add trigger to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET comment_count = COALESCE(comment_count, 0) + 1 
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET comment_count = GREATEST(0, COALESCE(comment_count, 0) - 1) 
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comment_count ON public.post_comments;
CREATE TRIGGER update_comment_count
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- 7. Add trigger to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET like_count = COALESCE(like_count, 0) + 1 
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1) 
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_like_count ON public.post_likes;
CREATE TRIGGER update_like_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_like_count();

-- 8. Ensure circle posts are viewable to members by id (fix RLS for discovery)
DROP POLICY IF EXISTS "Members can view circle posts" ON public.circle_posts;
CREATE POLICY "Members can view circle posts" ON public.circle_posts 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.circle_memberships cm
            WHERE cm.circle_id = public.circle_posts.circle_id 
            AND cm.user_id = auth.uid()
        )
    );

-- 9. Add CREATE CIRCLE ability
DROP POLICY IF EXISTS "Users can create circles" ON public.support_circles;
CREATE POLICY "Users can create circles" ON public.support_circles
    FOR INSERT WITH CHECK (TRUE);

-- 10. Make challenges viewable
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
CREATE POLICY "Anyone can view challenges" ON public.challenges
    FOR SELECT USING (TRUE);

-- 11. Create community_events table
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'workshop', -- 'workshop', 'meditation', 'qa', 'challenge', 'meetup'
    category TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    host_name TEXT,
    host_avatar TEXT,
    host_id UUID REFERENCES public.profiles(id),
    location_type TEXT DEFAULT 'virtual', -- 'virtual', 'in_person', 'hybrid'
    meeting_link TEXT,
    physical_location TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    points_reward INTEGER DEFAULT 0,
    badge_reward_key TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published', -- 'draft', 'published', 'live', 'completed', 'cancelled'
    session_recording_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published events" ON public.community_events;
CREATE POLICY "Anyone can view published events" ON public.community_events
    FOR SELECT USING (status IN ('published', 'live', 'completed'));

DROP POLICY IF EXISTS "Hosts can manage their events" ON public.community_events;
CREATE POLICY "Hosts can manage their events" ON public.community_events
    FOR ALL USING (auth.uid() = host_id);

-- 12. Create event_rsvps table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT,
    user_avatar TEXT,
    rsvp_status TEXT DEFAULT 'going', -- 'going', 'maybe', 'not_going'
    attended BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMPTZ,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can view their RSVPs" ON public.event_rsvps
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can manage their RSVPs" ON public.event_rsvps
    FOR ALL USING (auth.uid() = user_id);

-- 13. Create saved_events table
CREATE TABLE IF NOT EXISTS public.saved_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_title TEXT,
    event_date TIMESTAMPTZ,
    event_category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their saved events" ON public.saved_events;
CREATE POLICY "Users can view their saved events" ON public.saved_events
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their saved events" ON public.saved_events;
CREATE POLICY "Users can manage their saved events" ON public.saved_events
    FOR ALL USING (auth.uid() = user_id);

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_events_date ON public.community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_community_events_status ON public.community_events(status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_user ON public.saved_events(user_id);

-- 15. Update event attendee count trigger
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.rsvp_status = 'going' THEN
        UPDATE public.community_events 
        SET current_attendees = COALESCE(current_attendees, 0) + 1 
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' AND OLD.rsvp_status = 'going' THEN
        UPDATE public.community_events 
        SET current_attendees = GREATEST(0, COALESCE(current_attendees, 0) - 1) 
        WHERE id = OLD.event_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.rsvp_status = 'going' AND NEW.rsvp_status != 'going' THEN
            UPDATE public.community_events 
            SET current_attendees = GREATEST(0, COALESCE(current_attendees, 0) - 1) 
            WHERE id = NEW.event_id;
        ELSIF OLD.rsvp_status != 'going' AND NEW.rsvp_status = 'going' THEN
            UPDATE public.community_events 
            SET current_attendees = COALESCE(current_attendees, 0) + 1 
            WHERE id = NEW.event_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_attendee_count ON public.event_rsvps;
CREATE TRIGGER update_attendee_count
    AFTER INSERT OR UPDATE OR DELETE ON public.event_rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_event_attendee_count();

