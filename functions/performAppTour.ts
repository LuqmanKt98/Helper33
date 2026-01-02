import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const tourTypes = {
  full_tour: {
    tour_type: "Full DobryLife Tour",
    total_steps: 14,
    tour_steps: [
      {
        page: "Home",
        description: "Your main hub - access all features from here. Quick stats, shortcuts, and your daily overview."
      },
      {
        page: "About",
        description: "Learn about DobryLife's mission - born from personal loss, built with compassion. Understand why we exist and what makes us different."
      },
      {
        page: "GriefCoach",
        description: "24/7 grief support with 8-week healing journeys. Voice-enabled AI for any loss - death, divorce, job change, or life transition."
      },
      {
        page: "LifeCoach",
        description: "Achieve your goals with 6-12 week structured programs. Confidence building, career clarity, habit formation with weekly challenges."
      },
      {
        page: "SoulLink",
        description: "Your daily emotional companion. Morning check-ins, evening reflections, customizable relationship style - friend, partner, or reflective soul."
      },
      {
        page: "KidsCreativeStudio",
        description: "Safe space for children - AI homework help, educational games, gratitude journal, Montessori activities. Forever free!"
      },
      {
        page: "MindfulnessHub",
        description: "Breathing exercises, guided meditations, mindful games, custom soundscapes. Build calm practices and earn badges."
      },
      {
        page: "Wellness",
        description: "Track mood, sleep, energy, and wellness habits. See patterns, get insights, celebrate progress over time."
      },
      {
        page: "Organizer",
        description: "AI-powered task manager with smart scheduling, habit tracking, calendar sync. Get AI suggestions and build lasting routines."
      },
      {
        page: "GentleFlowPlanner",
        description: "Neuro-inclusive planner that adapts to your energy. Perfect for ADHD, autism, chronic illness, or flexible planning needs."
      },
      {
        page: "VisionBoard",
        description: "Visualize goals with images, affirmations, action plans. Create vision cards and get AI-generated audio affirmations."
      },
      {
        page: "MemoryVault",
        description: "Preserve precious memories - photos, videos, voice recordings. Share with family or keep private in your sacred space."
      },
      {
        page: "JournalStudio",
        description: "Multiple guided journals - gratitude, healing, relationship reflection. AI provides personalized prompts and insights."
      },
      {
        page: "Home",
        description: "Tour complete! You're back home. Click the AI Assistant button (bottom right) anytime to navigate or get help. Welcome to DobryLife! 🎉"
      }
    ]
  },
  wellness_tour: {
    tour_type: "Wellness & Mindfulness Tour",
    total_steps: 4,
    tour_steps: [
      {
        page: "Wellness",
        description: "Daily wellness tracking - mood, sleep, energy, habits. Your central wellbeing dashboard with insights and patterns."
      },
      {
        page: "MindfulnessHub",
        description: "Breathing exercises, guided meditations, mindful games, soundscapes. Build your calm practice with gamification."
      },
      {
        page: "JournalStudio",
        description: "Guided journals for emotional processing - gratitude, healing, reflection. Private, secure, AI-enhanced."
      },
      {
        page: "Home",
        description: "Wellness tour complete! These tools work together to support your mental and emotional health. ✨"
      }
    ]
  },
  planning_tour: {
    tour_type: "Planning & Organization Tour",
    total_steps: 5,
    tour_steps: [
      {
        page: "Organizer",
        description: "Your AI task manager - smart scheduling, habits, calendar sync. Get suggestions and stay organized effortlessly."
      },
      {
        page: "GentleFlowPlanner",
        description: "Energy-based planning for neurodivergent minds. Adapts to your capacity, not rigid schedules."
      },
      {
        page: "MealPlanner",
        description: "Recipe search, meal planning, grocery lists. Plan healthy meals for your family with ease."
      },
      {
        page: "Family",
        description: "Shared family calendar, chore rotation, budget tracking, family chat. Coordinate everyone in one place."
      },
      {
        page: "Home",
        description: "Planning tour complete! Use these tools to organize life, reduce stress, and coordinate with family. 📅"
      }
    ]
  },
  support_tour: {
    tour_type: "AI Support & Coaching Tour",
    total_steps: 4,
    tour_steps: [
      {
        page: "GriefCoach",
        description: "Compassionate grief support - 8-week healing journeys for any loss. Available 24/7 with voice support."
      },
      {
        page: "LifeCoach",
        description: "Goal achievement programs - 6-12 week journeys for confidence, career, habits. Weekly challenges with accountability."
      },
      {
        page: "SoulLink",
        description: "Daily emotional companion - morning check-ins, evening reflections, emotional wellness journeys. Your AI friend."
      },
      {
        page: "Home",
        description: "Support tour complete! Your AI coaches are always here in the purple button. Just click and chat! 💜"
      }
    ]
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tour_type } = await req.json();
    
    const selectedTour = tour_type || 'full_tour';
    const tourData = tourTypes[selectedTour] || tourTypes.full_tour;

    return Response.json({
      action: 'tour',
      success: true,
      message: `Starting ${tourData.tour_type}! I'll take you through ${tourData.total_steps} key features. First stop: ${tourData.tour_steps[0].page}`,
      ...tourData
    });
    
  } catch (error) {
    console.error('Error in performAppTour:', error);
    return Response.json(
      { 
        error: error.message,
        action: 'tour',
        success: false
      }, 
      { status: 500 }
    );
  }
});