import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Circle, CheckCircle2, Edit, Calendar, Clock, Repeat, Hourglass, Brain, Trash2 } from 'lucide-react';
import { useNotifications } from '@/components/SoundManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

const priorityColors = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-rose-100 text-rose-700 border-rose-200"
};

const categoryColors = {
  self_care: "bg-pink-100 text-pink-700",
  family: "bg-purple-100 text-purple-700",
  work: "bg-blue-100 text-blue-700",
  health: "bg-emerald-100 text-emerald-700",
  grief_support: "bg-rose-100 text-rose-700",
  daily_living: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-700"
};

const colorTagBorderColors = {
  default: 'border-l-transparent',
  red: 'border-l-rose-400',
  orange: 'border-l-orange-400',
  yellow: 'border-l-amber-400',
  green: 'border-l-emerald-400',
  blue: 'border-l-sky-400',
  purple: 'border-l-purple-400',
  pink: 'border-l-pink-400',
};

export default function TaskItem({ task, onStatusChange, onEdit, onDelete }) {
  const { playSound } = useNotifications();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(task.isRecurringInstance ? task.originalTaskId : task.id, newStatus, task.due_date);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.isRecurringInstance ? task.originalTaskId : task.id);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className={`bg-white/70 backdrop-blur-lg border border-white/60 hover:bg-white/90 transition-all duration-200 group border-l-4 ${colorTagBorderColors[task.color_tag || 'default']} shadow-md hover:shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox - Mark Done/Undo */}
            <motion.button
              onClick={handleStatusToggle}
              className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
              whileTap={{ scale: 0.9 }}
              title={task.status === 'completed' ? 'Undo - Mark as pending' : 'Mark as done'}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400 hover:text-emerald-500" />
              )}
            </motion.button>

            <div className="flex-1 min-w-0">
              {/* Title and Action Buttons */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`font-medium text-base break-words ${
                  task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'
                }`}>
                  {task.title}
                  {task.ai_generated && (
                    <Badge variant="outline" className="ml-2 text-xs align-middle px-1.5 py-0.5 border-purple-300 text-purple-700 bg-purple-50">
                      <Brain className="w-3 h-3 mr-0.5" />AI
                    </Badge>
                  )}
                </h3>

                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => onEdit(task)}
                    title="Edit task"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <Badge className={`${priorityColors[task.priority]} border px-2 py-1 font-medium text-xs`}>
                  {task.priority}
                </Badge>
                <Badge className={`${categoryColors[task.category]} capitalize px-2 py-1 text-xs`}>
                  {task.category.replace('_', ' ')}
                </Badge>
                
                {task.due_date && (
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                
                {task.due_time && (
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {task.due_time}
                  </span>
                )}
                
                {task.recurring && task.recurring !== "none" && (
                  <span className="flex items-center gap-1 text-purple-600 capitalize text-xs">
                    <Repeat className="w-3.5 h-3.5" />
                    {task.recurring}
                  </span>
                )}
                
                {task.estimated_duration && (
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Hourglass className="w-3.5 h-3.5" />
                    {task.estimated_duration}m
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}