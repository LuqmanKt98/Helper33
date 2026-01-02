-- Supabase Migration: Base44 to Supabase
-- Created: 2026-01-02

-- A. Core User & Profile Data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    preferred_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    trial_used BOOLEAN DEFAULT FALSE,
    trial_start_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    dashboard_curated_tools TEXT[] DEFAULT '{}',
    wellness_settings JSONB DEFAULT '{}',
    gamification_stats JSONB DEFAULT '{"level": 1, "xp": 0, "streak": 0, "achievements": 0}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- B. Platform Integrations
CREATE TABLE IF NOT EXISTS public.platform_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    platform_name TEXT NOT NULL, -- e.g., 'Zoom', 'Plaid'
    credentials JSONB,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations" ON public.platform_integrations
    FOR ALL USING (auth.uid() = user_id);

-- C. Wellness & Health Features
CREATE TABLE IF NOT EXISTS public.wellness_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    emotional_weather TEXT,
    energy_level INTEGER,
    sleep_hours NUMERIC,
    sleep_quality INTEGER,
    water_intake INTEGER,
    exercise_minutes INTEGER,
    meditation_minutes INTEGER,
    notes TEXT,
    is_logged_to_history BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wellness entries" ON public.wellness_entries
    FOR ALL USING (auth.uid() = user_id);

-- D. Tasks & Habits
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    priority TEXT DEFAULT 'medium',
    category TEXT,
    due_date DATE,
    due_time TIME,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.habit_trackers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'daily', 'weekly'
    target_value INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habit_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habits" ON public.habit_trackers
    FOR ALL USING (auth.uid() = user_id);

-- E. Social & Community
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    author_display_name TEXT,
    author_avatar TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    post_type TEXT DEFAULT 'forum', -- 'forum', 'social', 'progress_win'
    goal_category TEXT,
    progress_type TEXT,
    mood_emoji TEXT,
    days_into_journey INTEGER,
    support_reactions JSONB DEFAULT '{"hearts": 0, "hugs": 0, "strength": 0, "relate": 0, "helpful": 0}',
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage their own comments" ON public.comments
    FOR ALL USING (auth.uid() = user_id);

-- F. Support Circles
CREATE TABLE IF NOT EXISTS public.support_circles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    circle_type TEXT DEFAULT 'general',
    image_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view circles" ON public.support_circles FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.circle_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID REFERENCES public.support_circles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    display_name TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

ALTER TABLE public.circle_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own memberships" ON public.circle_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join circles" ON public.circle_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.circle_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID REFERENCES public.support_circles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    author_display_name TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    title TEXT,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general',
    support_reactions JSONB DEFAULT '{"hearts": 0, "hugs": 0, "strength": 0, "relate": 0, "helpful": 0}',
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view circle posts" ON public.circle_posts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.circle_memberships WHERE circle_id = public.circle_posts.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Members can create circle posts" ON public.circle_posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.circle_memberships WHERE circle_id = circle_id AND user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.circle_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.circle_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    author_display_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.circle_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view comments" ON public.circle_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.circle_memberships m
        JOIN public.circle_posts p ON p.circle_id = m.circle_id
        WHERE p.id = public.circle_comments.post_id AND m.user_id = auth.uid()
    )
);

-- G. Buddy System
CREATE TABLE IF NOT EXISTS public.buddy_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    requester_email TEXT,
    buddy_email TEXT,
    requester_name TEXT,
    buddy_name TEXT,
    requester_avatar TEXT,
    buddy_avatar TEXT,
    connection_type TEXT DEFAULT 'goal_accountability',
    connection_message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'declined'
    total_check_ins INTEGER DEFAULT 0,
    shared_goals JSONB DEFAULT '[]',
    next_check_in_date DATE,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buddy_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their buddy connections" ON public.buddy_connections
    FOR ALL USING (auth.uid() = requester_id OR auth.uid() = buddy_id);

CREATE TABLE IF NOT EXISTS public.buddy_check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buddy_connection_id UUID REFERENCES public.buddy_connections(id) ON DELETE CASCADE NOT NULL,
    check_in_date DATE NOT NULL,
    requester_completed BOOLEAN DEFAULT FALSE,
    buddy_completed BOOLEAN DEFAULT FALSE,
    both_completed BOOLEAN DEFAULT FALSE,
    requester_update JSONB,
    buddy_update JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buddy_check_ins ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.buddy_encouragements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buddy_connection_id UUID REFERENCES public.buddy_connections(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_email TEXT,
    receiver_email TEXT,
    sender_name TEXT,
    receiver_name TEXT,
    encouragement_type TEXT DEFAULT 'cheer',
    message TEXT,
    reaction_emoji TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buddy_encouragements ENABLE ROW LEVEL SECURITY;

-- H. Challenges & Invites
CREATE TABLE IF NOT EXISTS public.challenge_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color_theme TEXT,
    duration_days INTEGER,
    goal_description TEXT,
    goal_value NUMERIC,
    category TEXT,
    difficulty_level TEXT,
    moderation_status TEXT DEFAULT 'pending',
    moderation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenge_proposals ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT,
    duration_days INTEGER,
    start_date DATE,
    end_date DATE,
    participant_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'upcoming', 'completed'
    image_url TEXT,
    daily_actions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING (status IN ('active', 'upcoming'));

CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    display_name TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    current_day INTEGER DEFAULT 1,
    completed_days INTEGER[] DEFAULT '{}',
    completion_percentage NUMERIC DEFAULT 0,
    check_ins JSONB DEFAULT '[]',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own participations" ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitee_email TEXT NOT NULL,
    invitee_name TEXT,
    personal_message TEXT,
    invite_code TEXT,
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.coaching_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coaching_goals ENABLE ROW LEVEL SECURITY;

-- G. SoulLink / AI Context
CREATE TABLE IF NOT EXISTS public.companion_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    companion_name TEXT DEFAULT 'SoulLink',
    user_preferred_name TEXT,
    relationship_mode TEXT DEFAULT 'friend',
    tone_preference TEXT DEFAULT 'warm_and_affectionate',
    use_terms_of_endearment BOOLEAN DEFAULT FALSE,
    preferred_endearments TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companion_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their companion settings" ON public.companion_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.companion_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_type TEXT,
    user_mood TEXT,
    conversation_summary TEXT,
    key_themes TEXT[] DEFAULT '{}',
    support_provided TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companion_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.companion_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- H. Family & Kids
CREATE TABLE IF NOT EXISTS public.families (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member', -- 'admin', 'member', 'kid'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family members" ON public.family_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_members fm 
            WHERE fm.family_id = public.family_members.family_id 
            AND fm.user_id = auth.uid()
        )
    );

CREATE TABLE IF NOT EXISTS public.chores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

-- I. Vision Board
CREATE TABLE IF NOT EXISTS public.vision_boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vision_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their vision boards" ON public.vision_boards
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.vision_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID REFERENCES public.vision_boards(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    target_date DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vision_cards ENABLE ROW LEVEL SECURITY;

-- J. Translation & Marketplace
CREATE TABLE IF NOT EXISTS public.translation_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.translation_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their translation memory" ON public.translation_memory
    FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- I. Social Feed & Connections
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    requester_email TEXT,
    receiver_email TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their friend requests" ON public.friend_requests
    FOR ALL USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE TABLE IF NOT EXISTS public.friend_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT,
    user_avatar TEXT,
    activity_type TEXT NOT NULL, -- 'badge_earned', 'challenge_completed', etc.
    achievement_title TEXT,
    achievement_description TEXT,
    achievement_data JSONB DEFAULT '{}',
    cheer_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.friend_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activities" ON public.friend_activities FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.cheer_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.friend_activities(id) ON DELETE CASCADE NOT NULL,
    cheerer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    cheerer_email TEXT,
    cheerer_name TEXT,
    cheerer_avatar TEXT,
    recipient_email TEXT,
    reaction_type TEXT NOT NULL, -- 'fire', 'heart', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cheer_reactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.activity_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.friend_activities(id) ON DELETE CASCADE NOT NULL,
    commenter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    commenter_email TEXT,
    commenter_name TEXT,
    commenter_avatar TEXT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.companion_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT DEFAULT 'companion', -- 'companion', 'user'
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companion_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their companion messages" ON public.companion_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.direct_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_1_email TEXT,
    participant_2_email TEXT,
    last_message_content TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    last_message_sender_id UUID REFERENCES public.profiles(id),
    unread_count_p1 INTEGER DEFAULT 0,
    unread_count_p2 INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their conversations" ON public.direct_conversations
    FOR ALL USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_email TEXT,
    sender_name TEXT,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_email TEXT,
    recipient_name TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their messages" ON public.direct_messages
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- J. Security & Logs

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_wellness_entries_updated BEFORE UPDATE ON public.wellness_entries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_families_updated BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Note: In a real Supabase environment, you'd also want to add a trigger 
-- to automatically create a profile when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
