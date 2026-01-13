-- RLS and Schema Fixes for Community Features
-- Created: 2026-01-13

-- 1. Unify columns in public.posts
-- The code uses user_id, author_id, and created_by inconsistently.
-- Let's ensure author_id and created_by are present or aliased (for simplicity, we'll add them if missing).
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Update RLS for posts to be more inclusive of these columns
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.posts;
CREATE POLICY "Users can manage their own posts" ON public.posts
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() = author_id OR 
        auth.uid() = created_by
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() = author_id OR 
        auth.uid() = created_by
    );

-- 2. friend_activities RLS
-- Missing INSERT policy
DROP POLICY IF EXISTS "Users can create activities" ON public.friend_activities;
CREATE POLICY "Users can create activities" ON public.friend_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. activity_comments RLS
-- Currently has no policies
DROP POLICY IF EXISTS "Anyone can view activity comments" ON public.activity_comments;
CREATE POLICY "Anyone can view activity comments" ON public.activity_comments
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can comment on activities" ON public.activity_comments;
CREATE POLICY "Users can comment on activities" ON public.activity_comments
    FOR INSERT WITH CHECK (auth.uid() = commenter_id);

-- 4. cheer_reactions RLS
-- Currently has no policies
DROP POLICY IF EXISTS "Anyone can view cheer reactions" ON public.cheer_reactions;
CREATE POLICY "Anyone can view cheer reactions" ON public.cheer_reactions
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can cheer for activities" ON public.cheer_reactions;
CREATE POLICY "Users can cheer for activities" ON public.cheer_reactions
    FOR INSERT WITH CHECK (auth.uid() = cheerer_id);

DROP POLICY IF EXISTS "Users can remove their cheers" ON public.cheer_reactions;
CREATE POLICY "Users can remove their cheers" ON public.cheer_reactions
    FOR DELETE USING (auth.uid() = cheerer_id);

-- 5. Ensure activity_type in friend_activities can handle manual updates
-- (No change needed to schema, but good to note for the code)
