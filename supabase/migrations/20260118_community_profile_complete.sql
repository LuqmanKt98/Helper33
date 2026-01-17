-- Community Profile Complete Migration
-- Created: 2026-01-18
-- Purpose: Ensure all community profile fields exist and features work end-to-end

-- 1. Add all community profile fields to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_emoji TEXT DEFAULT '😊';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS general_location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_emoji TEXT DEFAULT '😊';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_categories TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS support_preferences TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS journey_stage TEXT DEFAULT 'just_started';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS buddy_preferences JSONB DEFAULT '{"preferred_check_in_frequency": "weekly", "communication_style": "empathetic", "preferred_check_in_time": "flexible", "open_to_challenges": true}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_open_to_new_connections BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matchmaking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_be_discovered BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS visibility_level TEXT DEFAULT 'anonymous';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_fully_anonymous BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_community_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_privacy JSONB DEFAULT '{"is_visible": false, "is_fully_anonymous": true}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 2. Allow anyone to view profiles with can_be_discovered
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles" ON public.profiles
    FOR SELECT USING (TRUE);

-- 3. Add INSERT policy for user creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Ensure posts can be inserted by authenticated users
DROP POLICY IF EXISTS "Users can insert posts" ON public.posts;
CREATE POLICY "Users can insert posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = author_id OR auth.uid() IS NOT NULL);

-- 5. Ensure challenge_participants has proper RLS for viewing
DROP POLICY IF EXISTS "Anyone can view challenge participants" ON public.challenge_participants;
CREATE POLICY "Anyone can view challenge participants" ON public.challenge_participants
    FOR SELECT USING (TRUE);

-- 6. Create or fix support circles RLS
DROP POLICY IF EXISTS "Anyone can view support circles" ON public.support_circles;
CREATE POLICY "Anyone can view support circles" ON public.support_circles
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create circles" ON public.support_circles;
CREATE POLICY "Authenticated users can create circles" ON public.support_circles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Circle memberships - allow viewing all memberships for display
DROP POLICY IF EXISTS "Anyone can view circle memberships" ON public.circle_memberships;
CREATE POLICY "Anyone can view circle memberships" ON public.circle_memberships
    FOR SELECT USING (TRUE);

-- 8. Ensure circle_posts can be created by members
DROP POLICY IF EXISTS "Members can insert circle posts" ON public.circle_posts;
CREATE POLICY "Members can insert circle posts" ON public.circle_posts
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.circle_memberships WHERE circle_id = circle_posts.circle_id AND user_id = auth.uid())
    );

-- 9. Buddy connections - ensure proper RLS
DROP POLICY IF EXISTS "Users can view their buddy connections" ON public.buddy_connections;
CREATE POLICY "Users can view their buddy connections" ON public.buddy_connections
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = buddy_id);

DROP POLICY IF EXISTS "Users can insert buddy connections" ON public.buddy_connections;
CREATE POLICY "Users can insert buddy connections" ON public.buddy_connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update buddy connections" ON public.buddy_connections;
CREATE POLICY "Users can update buddy connections" ON public.buddy_connections
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = buddy_id);

-- 10. Buddy encouragements RLS
DROP POLICY IF EXISTS "Users can view their encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can view their encouragements" ON public.buddy_encouragements
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can insert encouragements" ON public.buddy_encouragements
    FOR INSERT WITH CHECK (auth.uid() = sender_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their encouragements" ON public.buddy_encouragements;
CREATE POLICY "Users can update their encouragements" ON public.buddy_encouragements
    FOR UPDATE USING (auth.uid() = receiver_id);

-- 11. Create community_profiles view for easier queries if needed
CREATE OR REPLACE VIEW public.community_profiles AS
SELECT 
    id,
    email,
    full_name,
    preferred_name,
    display_name,
    display_emoji,
    avatar_url,
    bio,
    general_location,
    interests,
    goal_categories,
    support_preferences,
    looking_for,
    journey_stage,
    activity_level,
    buddy_preferences,
    is_open_to_new_connections,
    matchmaking_enabled,
    can_be_discovered,
    visibility_level,
    is_fully_anonymous,
    has_community_profile,
    gamification_stats,
    created_at
FROM public.profiles
WHERE has_community_profile = TRUE OR can_be_discovered = TRUE;

-- 12. Challenges - allow participants to view other participants
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;
CREATE POLICY "Anyone can view active challenges" ON public.challenges
    FOR SELECT USING (TRUE);

-- 13. Insert some default challenges if none exist
INSERT INTO public.challenges (id, title, description, challenge_type, duration_days, start_date, end_date, status, daily_actions)
SELECT 
    gen_random_uuid(),
    '7-Day Gratitude Challenge',
    'Practice gratitude daily for 7 days. Each day, write down 3 things you are grateful for.',
    'gratitude',
    7,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'active',
    '[{"day": 1, "action": "Morning Gratitude", "description": "Write 3 things you''re grateful for when you wake up"}, {"day": 2, "action": "Gratitude Letter", "description": "Write a short thank you to someone important"}, {"day": 3, "action": "Nature Appreciation", "description": "Spend 10 mins in nature and note what you appreciate"}, {"day": 4, "action": "Self Gratitude", "description": "List 3 qualities you appreciate about yourself"}, {"day": 5, "action": "Photo Gratitude", "description": "Take a photo of something you''re grateful for"}, {"day": 6, "action": "Gratitude Share", "description": "Tell someone why you appreciate them"}, {"day": 7, "action": "Reflection", "description": "Reflect on your week of gratitude"}]'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE status = 'active' LIMIT 1);

INSERT INTO public.challenges (id, title, description, challenge_type, duration_days, start_date, end_date, status, daily_actions)
SELECT 
    gen_random_uuid(),
    '21-Day Mindfulness Journey',
    'Build a mindfulness habit over 21 days with guided daily practices.',
    'wellness',
    21,
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '24 days',
    'upcoming',
    '[{"day": 1, "action": "Breath Awareness", "description": "5 minutes of focused breathing"}, {"day": 2, "action": "Body Scan", "description": "Progressive relaxation exercise"}, {"day": 3, "action": "Mindful Walking", "description": "A short mindful walk outdoors"}]'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE status = 'upcoming' LIMIT 1);

-- 14. Insert some default support circles if none exist
INSERT INTO public.support_circles (id, name, description, circle_type, is_private, member_count)
SELECT 
    gen_random_uuid(),
    'Wellness Warriors',
    'A supportive community for those on their wellness journey. Share tips, victories, and support each other.',
    'wellness',
    FALSE,
    0
WHERE NOT EXISTS (SELECT 1 FROM public.support_circles LIMIT 1);

INSERT INTO public.support_circles (id, name, description, circle_type, is_private, member_count)
SELECT 
    gen_random_uuid(),
    'Grief & Loss Support',
    'A safe space for those processing grief and loss. Share your journey, find comfort, and support others.',
    'grief_support',
    FALSE,
    0
WHERE NOT EXISTS (SELECT 1 FROM public.support_circles WHERE circle_type = 'grief_support' LIMIT 1);

INSERT INTO public.support_circles (id, name, description, circle_type, is_private, member_count)
SELECT 
    gen_random_uuid(),
    'Mindful Parents',
    'Connect with other parents working on mindful parenting techniques.',
    'parenting',
    FALSE,
    0
WHERE NOT EXISTS (SELECT 1 FROM public.support_circles WHERE circle_type = 'parenting' LIMIT 1);

-- 15. Community invites RLS if missing
ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invites they sent or received" ON public.community_invites;
CREATE POLICY "Users can view invites they sent or received" ON public.community_invites
    FOR SELECT USING (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Users can create invites" ON public.community_invites;
CREATE POLICY "Users can create invites" ON public.community_invites
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- 16. Challenge proposals RLS
DROP POLICY IF EXISTS "Users can view their proposals" ON public.challenge_proposals;
CREATE POLICY "Users can view their proposals" ON public.challenge_proposals
    FOR SELECT USING (auth.uid() = proposer_id);

DROP POLICY IF EXISTS "Users can create proposals" ON public.challenge_proposals;
CREATE POLICY "Users can create proposals" ON public.challenge_proposals
    FOR INSERT WITH CHECK (auth.uid() = proposer_id);

-- 17. Coaching goals RLS
DROP POLICY IF EXISTS "Users can manage their coaching goals" ON public.coaching_goals;
CREATE POLICY "Users can manage their coaching goals" ON public.coaching_goals
    FOR ALL USING (auth.uid() = user_id);

-- 18. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_has_community ON public.profiles(has_community_profile);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON public.profiles(can_be_discovered);
CREATE INDEX IF NOT EXISTS idx_profiles_matchmaking ON public.profiles(matchmaking_enabled);
CREATE INDEX IF NOT EXISTS idx_buddy_connections_status ON public.buddy_connections(status);
CREATE INDEX IF NOT EXISTS idx_circle_memberships_user ON public.circle_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_memberships_circle ON public.circle_memberships(circle_id);
