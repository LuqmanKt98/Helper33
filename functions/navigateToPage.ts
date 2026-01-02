import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        const { pageName } = await req.json();

        if (!pageName) {
            return Response.json({
                success: false,
                error: 'Missing required field: pageName'
            }, { status: 400 });
        }

        // Valid page names in the app
        const validPages = [
            'Home', 'Dashboard', 'Profile', 'Account', 'Security', 'AccountManager', 
            'IntegrationsHub', 'AgentsHub', 'Messages', 'Notifications',
            'Wellness', 'GriefCoach', 'LifeCoach', 'MindfulGames', 'HeartShiftJournal', 
            'GratitudeJournal', 'JournalHistory', 'WellnessTools', 'MindfulTools', 
            'MindfulnessHub', 'SoulLink', 'SafePlace', 'CrisisHub',
            'Organizer', 'Year2026Hub', 'GentleFlowPlanner', 'ScheduleTemplates', 'LifeTemplates',
            'Family', 'FamilyAccess', 'MealPlanner', 'KidsCreativeStudio', 'HomeworkHub', 'ParentDashboard',
            'CareHub', 'FindCare', 'WomensHealthHub', 'FindPractitioners', 'ClientPortal', 
            'PractitionerDashboard', 'BecomePractitioner',
            'FindConsultants', 'BrowseClientRequests', 'ConsultantDashboard', 'BecomeAConsultant',
            'SellerDashboard', 'Marketplace',
            'SocialMediaManager', 'Workspace',
            'Community', 'CommunityHub', 'CommunityForum', 'Events', 'Discover',
            'BookStudio', 'InfinityBook', 'InfinityJournal', 'JournalStudio', 'StoryHub',
            'About', 'Blog', 'HeartfulHolidays', 'SupportUs',
            'AdminPractitionerReview', 'AdminConsultantReview', 'AdminChallengeReview', 'AdminAuditLogs'
        ];

        // Check if page exists
        if (!validPages.includes(pageName)) {
            console.warn(`⚠️ Page "${pageName}" not found in valid pages list`);
            // Still return success but with a warning
            return Response.json({
                success: true,
                pageName,
                action: 'navigate',
                warning: `Page "${pageName}" might not exist. Attempting navigation anyway.`
            });
        }

        console.log(`✅ Navigation to ${pageName} approved for user: ${user.email}`);

        return Response.json({
            success: true,
            pageName,
            action: 'navigate',
            message: `Navigating to ${pageName}`
        });

    } catch (error) {
        console.error('❌ Navigate Page Error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});