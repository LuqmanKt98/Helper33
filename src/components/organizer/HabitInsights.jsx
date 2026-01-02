import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp } from "lucide-react";
import BehaviorInsights from "./BehaviorInsights";
import HabitCorrelations from "./HabitCorrelations";

export default function HabitInsights({ habits, onRefresh }) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Behavior Analysis
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Habit Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="mt-6">
          <BehaviorInsights />
        </TabsContent>

        <TabsContent value="correlations" className="mt-6">
          <HabitCorrelations habits={habits} onRefresh={onRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}