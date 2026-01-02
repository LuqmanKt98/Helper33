import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';

export default function GratitudeDropinModal({ isOpen, onClose }) {
  const [gratitudeText, setGratitudeText] = useState('');

  const handleSave = () => {
    // In a real app, save `gratitudeText` to the database
    console.log('Gratitude saved:', gratitudeText);
    onClose();
    setGratitudeText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-50 border-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <Heart className="w-7 h-7 text-rose-500" />
            A Moment of Gratitude
          </DialogTitle>
          <DialogDescription>What is one thing, big or small, that you're grateful for right now?</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="e.g., The warm sun on my face, a quiet cup of coffee, a kind word from a friend..."
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            className="h-32 text-base"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!gratitudeText.trim()} className="bg-rose-500 hover:bg-rose-600">
            Save Moment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}