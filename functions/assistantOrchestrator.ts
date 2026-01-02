import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, conversationHistory = [] } = await req.json();

        if (!message || typeof message !== 'string') {
            return Response.json({ error: 'Message is required' }, { status: 400 });
        }

        // Page mapping for navigation
        const pageMap = {
            'planner': 'Organizer',
            'organizer': 'Organizer',
            'tasks': 'Organizer',
            'task': 'Organizer',
            'to do': 'Organizer',
            'todo': 'Organizer',
            'schedule': 'Organizer',
            'calendar': 'Organizer',
            'journal': 'JournalStudio',
            'journals': 'JournalStudio',
            'write': 'JournalStudio',
            'reflect': 'JournalStudio',
            'wellness': 'Wellness',
            'health': 'Wellness',
            'mood': 'Wellness',
            'check-in': 'Wellness',
            'family': 'Family',
            'grief coach': 'GriefCoach',
            'grief': 'GriefCoach',
            'life coach': 'LifeCoach',
            'coach': 'LifeCoach',
            'coaching': 'LifeCoach',
            'mindfulness': 'MindfulnessHub',
            'meditation': 'MindfulnessHub',
            'breathe': 'MindfulnessHub',
            'breathing': 'MindfulnessHub',
            'games': 'MindfulGames',
            'play': 'MindfulGames',
            'soullink': 'SoulLink',
            'companion': 'SoulLink',
            'memory vault': 'MemoryVault',
            'memories': 'MemoryVault',
            'vision board': 'VisionBoard',
            'vision': 'VisionBoard',
            'goals': 'VisionBoard',
            'meal planner': 'MealPlanner',
            'meal': 'MealPlanner',
            'recipes': 'MealPlanner',
            'cooking': 'MealPlanner',
            'dashboard': 'Dashboard',
            'home': 'Home',
            'kids studio': 'KidsCreativeStudio',
            'kids': 'KidsCreativeStudio',
            'homework': 'KidsCreativeStudio',
            'discover': 'Discover',
            'news': 'Discover',
            'account': 'Account',
            'profile': 'Account',
            'settings': 'AppSettings',
            'upgrade': 'Upgrade',
            'subscription': 'Upgrade',
            'blog': 'Blog'
        };

        // Check if this is a navigation request
        const lowerMessage = message.toLowerCase();
        let navigationPage = null;
        
        // Check for navigation keywords
        const navigationVerbs = ['show', 'open', 'go to', 'take me to', 'navigate to', 'view', 'see'];
        const hasNavigationIntent = navigationVerbs.some(verb => lowerMessage.includes(verb));
        
        // Find matching page
        for (const [keyword, page] of Object.entries(pageMap)) {
            if (lowerMessage.includes(keyword)) {
                navigationPage = page;
                break;
            }
        }

        // Build user context
        const userContext = await buildUserContext(base44, user);

        // Create AI prompt
        const systemPrompt = `You are DobryLife's compassionate AI assistant helping ${user.full_name}.

${navigationPage ? `
🎯 NAVIGATION DETECTED
User wants to go to: ${navigationPage}
Respond warmly confirming you're taking them there and briefly mention what they'll find.
Example: "Of course! Opening your planner now. 📅 You'll see your tasks and schedule there."
` : `
You can help with questions and navigation. If they ask about features, explain briefly and offer to take them there.
`}

USER'S CURRENT STATE:
- Pending tasks: ${userContext.tasks_count || 0} (${userContext.tasks_today || 0} due today)
- Recent mood: ${userContext.recent_mood?.label || 'Not logged'} (${userContext.recent_mood?.rating || 'N/A'}/10)
- Wellness logged today: ${userContext.wellness_logged_today ? 'Yes ✓' : 'Not yet'}
- Active habits: ${userContext.active_habits || 0}
- Plan: ${userContext.plan_type}

CONVERSATION:
${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

USER SAYS: ${message}

Respond in 1-3 sentences. Be warm, helpful, and compassionate.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: systemPrompt,
        });

        return Response.json({
            response: aiResponse,
            navigation: navigationPage ? {
                page: navigationPage,
                action: 'navigate'
            } : null,
            context: userContext
        });

    } catch (error) {
        console.error('Assistant orchestrator error:', error);
        return Response.json({ 
            error: error.message,
            response: "I'm having trouble right now. Please try again in a moment. 💜"
        }, { status: 500 });
    }
});

async function buildUserContext(base44, user) {
    const context = {
        user_name: user.full_name,
        plan_type: user.plan_type || 'free'
    };

    try {
        const tasks = await base44.entities.Task.filter({ status: 'pending' }, '-created_date', 10);
        context.tasks_count = tasks.length;
        
        const today = new Date().toISOString().split('T')[0];
        context.tasks_today = tasks.filter(t => t.due_date === today).length;

        const moods = await base44.entities.SoulLinkMoodEntry.list('-created_date', 1);
        if (moods.length > 0) {
            context.recent_mood = {
                rating: moods[0].mood_rating,
                label: moods[0].mood_label
            };
        }

        const wellnessToday = await base44.entities.WellnessEntry.filter({ date: today });
        context.wellness_logged_today = wellnessToday.length > 0;

        const habits = await base44.entities.HabitTracker.filter({ is_active: true });
        context.active_habits = habits.length;

    } catch (error) {
        console.error('Error building context:', error);
    }

    return context;
}