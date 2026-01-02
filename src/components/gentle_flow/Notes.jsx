import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Feather, 
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Notes({ settings }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(settings?.currentPlan?.notes || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNotes(settings?.currentPlan?.notes || '');
  }, [settings?.currentPlan?.notes]);

  const updateSettingsMutation = useMutation({
    mutationFn: (newNotes) => base44.auth.updateMe({
      gentle_flow_settings: {
        ...settings,
        currentPlan: {
          ...settings.currentPlan,
          notes: newNotes
        }
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setHasChanges(false);
      toast.success('Notes saved!');
    },
  });

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Feather className="w-5 h-5 text-[#7AAE9E]" />
            Notes & Reflections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Jot down thoughts, ideas, or reflections about your day..."
            value={notes}
            onChange={handleNotesChange}
            className="min-h-[150px] resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {notes.length} characters
            </p>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                size="sm"
                className="bg-[#7AAE9E] hover:bg-[#7AAE9E]/90"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}