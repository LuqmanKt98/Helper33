import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function TaskResponseCard({ tasks, onTaskCompleted }) {
  const queryClient = useQueryClient();

  const completeTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.Task.update(taskId, { status: 'completed' }),
    onSuccess: (_, taskId) => {
      // Invalidate queries to refetch tasks in the main Organizer view
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Call the callback to update the local AI chat state
      onTaskCompleted(taskId);
    },
  });

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-3 bg-white/80 border border-indigo-100 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-indigo-900">{task.title}</p>
              <p className="text-xs text-gray-500">
                Status: <span className="font-medium capitalize">{task.status}</span>
              </p>
            </div>
            {task.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => completeTaskMutation.mutate(task.id)}
                disabled={completeTaskMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
            )}
          </Card>
        </motion.div>
      ))}
      {tasks.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">You have no pending tasks right now. Great job!</p>
      )}
    </div>
  );
}