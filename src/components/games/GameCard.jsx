import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function GameCard({ game, onPlay }) {
  return (
    <Card data-card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <div className={`w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <game.icon className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{game.title}</CardTitle>
        <p className="text-gray-600 mb-6 flex-grow">{game.description}</p>
        <Button 
          onClick={onPlay}
          className={`w-full bg-gradient-to-r ${game.color} hover:scale-105 transition-transform mt-auto`}
        >
          <Play className="w-4 h-4 mr-2" />
          Start
        </Button>
      </div>
    </Card>
  );
}