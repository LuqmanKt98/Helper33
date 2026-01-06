-- Community Features Improvement Migration
-- Created: 2026-01-06
-- Purpose: Add forum categories, enhance posts table, and add RLS policies for buddy system

-- 1. Create forum_categories table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on forum_categories
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view forum categories
CREATE POLICY "Anyone can view forum categories" ON public.forum_categories 
    FOR SELECT USING (TRUE);

-- 2. Enhance posts table for forum functionality
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.forum_categories(id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 3. Add RLS policies for buddy system tables

-- Buddy check-ins policies
DROP POLICY IF EXISTS "Users can view buddy check-ins" ON public.buddy_check_ins;
CREATE POLICY "Users can view buddy check-ins" ON public.buddy_check_ins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.buddy_connections bc
            WHERE bc.id = buddy_check_ins.buddy_connection_id
            AND (bc.requester_id = auth.uid() OR bc.buddy_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert buddy check-ins" ON public.buddy_check_ins;
CREATE POLICY "Users can insert buddy check-ins" ON public.buddy_check_ins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.buddy_connections bc
            WHERE bc.id = buddy_connection_id
            AND (bc.requester_id = auth.uid() OR bc.buddy_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update buddy check-ins" ON public.buddy_check_ins;
CREATE POLICY "Users can update buddy check-ins" ON public.buddy_check_ins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.buddy_connections bc
            WHERE bc.id = buddy_check_ins.buddy_connection_id
            AND (bc.requester_id = auth.uid() OR bc.buddy_id = auth.uid())
        )
    );

-- Buddy encouragements policies
DROP POLICY IF EXISTS "Users can view encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can view encouragements" ON public.buddy_encouragements
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can send encouragements" ON public.buddy_encouragements
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their received encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can update their received encouragements" ON public.buddy_encouragements
    FOR UPDATE USING (auth.uid() = receiver_id);

-- 4. Insert default forum categories
INSERT INTO public.forum_categories (id, name, slug, description, icon, color) VALUES
    ('grief', 'Grief & Loss Support', 'grief-loss', 'A safe space to share experiences, find comfort, and support others through loss', 'Heart', 'rose'),
    ('family', 'Family Coordination', 'family', 'Tips, stories, and advice for managing family life and schedules', 'Home', 'purple'),
    ('productivity', 'Productivity & Organization', 'productivity', 'Share your best practices for staying organized and productive', 'Briefcase', 'blue'),
    ('mental-health', 'Mental Health & Wellness', 'mental-health', 'Open discussions about mental health, self-care, and wellbeing', 'Brain', 'green'),
    ('parenting', 'Parenting & Kids', 'parenting', 'Connect with other parents and share parenting wisdom', 'Baby', 'yellow'),
    ('success', 'Success Stories', 'success', 'Celebrate wins, milestones, and inspiring transformations', 'Trophy', 'amber')
ON CONFLICT (id) DO NOTHING;

-- 5. Add sharing and engagement tables

-- Post reactions table
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type TEXT NOT NULL, -- 'like', 'love', 'support', 'celebrate'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.post_reactions 
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can add reactions" ON public.post_reactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON public.post_reactions 
    FOR DELETE USING (auth.uid() = user_id);

-- Post shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    share_type TEXT DEFAULT 'community', -- 'community', 'external', 'family'
    share_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares" ON public.post_shares 
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can share posts" ON public.post_shares 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Enhance family invites table
ALTER TABLE public.community_invites ADD COLUMN IF NOT EXISTS invite_type TEXT DEFAULT 'community'; -- 'community', 'family', 'challenge'
ALTER TABLE public.community_invites ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.community_invites ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days';

-- Add policy for family invites
DROP POLICY IF EXISTS "Users can view their invites" ON public.community_invites;
CREATE POLICY "Users can view their invites" ON public.community_invites
    FOR SELECT USING (auth.uid() = inviter_id OR invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can create invites" ON public.community_invites;
CREATE POLICY "Users can create invites" ON public.community_invites
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Users can update their invites" ON public.community_invites;
CREATE POLICY "Users can update their invites" ON public.community_invites
    FOR UPDATE USING (auth.uid() = inviter_id OR invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- 7. Add engagement tracking
CREATE TABLE IF NOT EXISTS public.user_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    engagement_type TEXT NOT NULL, -- 'post_created', 'comment_added', 'reaction_given', 'share_made'
    target_type TEXT, -- 'post', 'comment', 'circle', 'challenge'
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their engagement" ON public.user_engagement
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track engagement" ON public.user_engagement
    FOR INSERT WITH CHECK (TRUE);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_date ON public.posts(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user ON public.user_engagement(user_id, created_at DESC);

-- 9. Update trigger for post counts
CREATE OR REPLACE FUNCTION update_forum_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
        UPDATE public.forum_categories 
        SET post_count = post_count + 1 
        WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
        UPDATE public.forum_categories 
        SET post_count = post_count - 1 
        WHERE id = OLD.category_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_count ON public.posts;
CREATE TRIGGER update_category_count
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_forum_category_post_count();

