import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles, Image as ImageIcon, Wand2, Lock } from 'lucide-react';

const initialCardState = {
    title: '',
    image_url: '',
    outcome_statement: '',
    affirmation: '',
    micro_actions: [{ action_id: Date.now().toString(), label: '', is_done: false }]
};

export default function VisionCardCreator({ isOpen, onClose, boardId, aiAffirmationsEnabled }) {
  const queryClient = useQueryClient();
  const [card, setCard] = useState(initialCardState);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingAffirmation, setIsGeneratingAffirmation] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const createCardMutation = useMutation({
    mutationFn: (cardData) => base44.entities.VisionCard.create(cardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionCards', boardId] });
      handleClose();
    },
  });

  const handleActionStepChange = (index, value) => {
    const newSteps = [...card.micro_actions];
    newSteps[index].label = value;
    setCard({ ...card, micro_actions: newSteps });
  };

  const addActionStep = () => {
    setCard({ ...card, micro_actions: [...card.micro_actions, { action_id: Date.now().toString(), label: '', is_done: false }] });
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt: imagePrompt });
      if (result.url) {
        setCard({ ...card, image_url: result.url });
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const handleFileUpload = async (e) => {
      const uploadedFile = e.target.files[0];
      if (!uploadedFile) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });
      setCard({ ...card, image_url: file_url });
  };
  
  const handleGenerateAffirmation = async () => {
      if (!card.outcome_statement || !aiAffirmationsEnabled) return;
      setIsGeneratingAffirmation(true);
      try {
          const result = await base44.integrations.Core.InvokeLLM({ prompt: `Create a short, powerful, first-person affirmation for the goal: "${card.outcome_statement}"` });
          setCard({ ...card, affirmation: result.replace(/"/g, '') });
      } catch (error) {
          console.error("Error generating affirmation:", error);
      } finally {
          setIsGeneratingAffirmation(false);
      }
  };

  const handleSubmit = () => {
    createCardMutation.mutate({ ...card, board_id: boardId });
  };
  
  const handleClose = () => {
      setCard(initialCardState);
      setImagePrompt('');
      onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Vision Card</DialogTitle>
          <DialogDescription>Fill in the details to bring your goal to life.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="title">Card Title</Label>
            <Input id="title" placeholder="e.g., 'Run a 5K Race'" value={card.title} onChange={e => setCard({ ...card, title: e.target.value })} />
          </div>
          
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-3">
              {card.image_url ? (
                <img src={card.image_url} alt="Vision" className="w-full h-48 object-cover rounded-md mb-2" />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-md">
                    <ImageIcon className="w-12 h-12 text-gray-300"/>
                    <p className="text-sm text-gray-500 mt-2">Your vision starts here</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => document.getElementById('file-upload').click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Input placeholder="Or describe an image for AI..." value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} />
                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage || !imagePrompt}>
                      {isGeneratingImage ? <Sparkles className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Outcome Statement</Label>
            <Textarea id="goal" placeholder="What is the clear, measurable outcome you want to achieve?" value={card.outcome_statement} onChange={e => setCard({ ...card, outcome_statement: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affirmation">Affirmation</Label>
             <div className="flex items-center gap-2">
                <Input id="affirmation" placeholder="A positive statement in the present tense." value={card.affirmation} onChange={e => setCard({ ...card, affirmation: e.target.value })} />
                 <Button onClick={handleGenerateAffirmation} disabled={isGeneratingAffirmation || !card.outcome_statement || !aiAffirmationsEnabled} variant="outline" title={aiAffirmationsEnabled ? 'Generate with AI' : 'AI affirmations available on Pro plan'}>
                  {isGeneratingAffirmation ? <Sparkles className="h-4 w-4 animate-spin" /> : (aiAffirmationsEnabled ? <Wand2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />)}
                </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Micro-Actions</Label>
            {card.micro_actions.map((step, index) => (
              <Input key={index} placeholder={`Tiny Step ${index + 1}`} value={step.label} onChange={e => handleActionStepChange(index, e.target.value)} />
            ))}
            <Button variant="outline" size="sm" onClick={addActionStep}>Add Step</Button>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createCardMutation.isPending}>
            {createCardMutation.isPending ? 'Saving...' : 'Create Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}