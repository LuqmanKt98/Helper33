import { useEffect } from "react";
import { UserActivity } from "@/entities/all";

/**
 * ActivityTracker - Invisible component that monitors user activities across the app
 * This should be included in the Layout component to track all activities
 */
export default function ActivityTracker({ activityType, activityCategory, activityData, duration, moodBefore, moodAfter, relatedEntityId, relatedEntityType }) {
  useEffect(() => {
    if (activityType && activityCategory) {
      trackActivity();
    }
  }, [activityType, activityCategory, activityData]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  };

  const getDayOfWeek = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  const trackActivity = async () => {
    try {
      await UserActivity.create({
        activity_type: activityType,
        activity_category: activityCategory,
        activity_data: activityData || {},
        duration_minutes: duration,
        time_of_day: getTimeOfDay(),
        day_of_week: getDayOfWeek(),
        mood_before: moodBefore,
        mood_after: moodAfter,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };

  return null; // This is an invisible tracking component
}

// Helper hook for easy activity tracking
export function useActivityTracker() {
  const trackActivity = async (activityType, activityCategory, options = {}) => {
    try {
      const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "morning";
        if (hour < 17) return "afternoon";
        if (hour < 21) return "evening";
        return "night";
      };

      const getDayOfWeek = () => {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        return days[new Date().getDay()];
      };

      await UserActivity.create({
        activity_type: activityType,
        activity_category: activityCategory,
        activity_data: options.activityData || {},
        duration_minutes: options.duration,
        time_of_day: getTimeOfDay(),
        day_of_week: getDayOfWeek(),
        mood_before: options.moodBefore,
        mood_after: options.moodAfter,
        related_entity_id: options.relatedEntityId,
        related_entity_type: options.relatedEntityType
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };

  return { trackActivity };
}