import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";

const ExerciseCard = ({ exercise }) => {
  return (
    <Link to={createPageUrl(`ExercisePlayer?key=${exercise.key}`)}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
          <div className="relative">
            <img src={exercise.image_url} alt={exercise.title} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute bottom-2 left-4 text-white">
              <h3 className="font-bold text-lg">{exercise.title}</h3>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exercise.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>{Math.round(exercise.duration_seconds / 60)} min</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default function MindfulExercisesPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get('category');

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['mindfulExercises', category],
    queryFn: () => base44.entities.MindfulExercise.filter(category ? { category } : {}),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl('MindfulnessHub')}>
            <Button variant="ghost">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{category || 'All'} Exercises</h1>
        </div>

        {isLoading ? (
          <div className="text-center">
            <p>Loading exercises...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises?.map((exercise) => (
              <ExerciseCard key={exercise.key} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}