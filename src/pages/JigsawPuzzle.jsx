import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NatureJigsawPuzzle from '../components/games/NatureJigsawPuzzle';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { NotificationProvider as SoundProvider } from '@/components/SoundManager';

export default function JigsawPuzzlePage() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to={createPageUrl('MindfulTools')}>
              <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mindful Tools
              </Button>
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-200">
            <NatureJigsawPuzzle />
          </div>
        </div>
      </div>
    </SoundProvider>
  );
}