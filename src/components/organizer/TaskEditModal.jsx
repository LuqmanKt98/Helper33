import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, Clock, Bell, Palette, Check, Loader2, Repeat, Trash2 } from 'lucide-react';
import { Task } from '@/entities/all';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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

const colorTagOptions = {
  default: 'bg-gray-200 border border-gray-300',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

export default function TaskEditModal({ task, isOpen, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'daily_living',
    color_tag: 'default',
    due_date: '',
    due_time: '',
    reminder_enabled: false,
    reminder_minutes_before: 15,
    recurring: 'none',
    recurring_start_date: '',
    recurring_end_date: '',
    estimated_duration: 60,
    assigned_family_member: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        category: task.category || 'daily_living',
        color_tag: task.color_tag || 'default',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        due_time: task.due_time ? task.due_time.substring(0, 5) : '',
        reminder_enabled: task.reminder_enabled || false,
        reminder_minutes_before: task.reminder_minutes_before || 15,
        recurring: task.recurring || 'none',
        recurring_start_date: task.recurring_start_date ? task.recurring_start_date.split('T')[0] : '',
        recurring_end_date: task.recurring_end_date ? task.recurring_end_date.split('T')[0] : '',
        estimated_duration: task.estimated_duration || 60,
        assigned_family_member: task.assigned_family_member || '',
      });
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (formData.reminder_enabled && (!formData.due_date || !formData.due_time)) {
      toast.error("Please set a due date and time for the reminder");
      return;
    }

    setIsSaving(true);

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        reminder_minutes_before: formData.reminder_enabled ? parseInt(formData.reminder_minutes_before) : 15,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
      };

      await Task.update(task.id, taskData);
      
      if (taskData.reminder_enabled && taskData.due_date && taskData.due_time) {
        const dueDateTime = new Date(`${taskData.due_date}T${taskData.due_time}`);
        const reminderMinutes = typeof taskData.reminder_minutes_before === 'number' ? taskData.reminder_minutes_before : 15;
        const reminderTime = new Date(dueDateTime.getTime() - (reminderMinutes * 60 * 1000));
        
        toast.success('Task updated with reminder!', {
          description: `You'll get a reminder at ${reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          duration: 5000
        });
      } else {
        toast.success('Task updated successfully!');
      }

      if (onSave) await onSave();
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await Task.delete(task.id);
      toast.success('Task deleted successfully');
      if (onSave) await onSave();
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center justify-between">
              <span>Edit Task</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold text-slate-700">Task Title *</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="What needs to be done?" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                className="mt-2 text-base"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold text-slate-700">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Add more details..." 
                value={formData.description} 
                onChange={handleChange} 
                className="h-24 mt-2 resize-none text-base"
              />
            </div>
            
            {/* Priority and Category - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="priority" className="text-base font-semibold text-slate-700">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger id="priority" className="mt-2 text-base h-11">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold text-slate-700">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger id="category" className="mt-2 text-base h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_care">Self Care</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="grief_support">Grief Support</SelectItem>
                    <SelectItem value="daily_living">Daily Living</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Due Date, Due Time, and Estimated Duration - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="due_date" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={formData.due_date || ''}
                  onChange={handleChange}
                  className="mt-2 text-base h-11"
                />
              </div>
              <div>
                <Label htmlFor="due_time" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Due Time
                </Label>
                <Input
                  id="due_time"
                  type="time"
                  name="due_time"
                  value={formData.due_time || ''}
                  onChange={handleChange}
                  className="mt-2 text-base h-11"
                />
              </div>
              <div>
                <Label htmlFor="estimated_duration" className="text-base font-semibold text-slate-700">
                  Duration (minutes)
                </Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration || ''}
                  onChange={handleChange}
                  min="5"
                  step="5"
                  className="mt-2 text-base h-11"
                />
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl space-y-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-purple-600" />
                  <Label htmlFor="reminder_enabled" className="text-lg font-semibold text-purple-900 cursor-pointer">
                    Enable Reminder
                  </Label>
                </div>
                <Switch
                  id="reminder_enabled"
                  checked={formData.reminder_enabled || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
                  className="scale-125"
                />
              </div>

              <AnimatePresence>
                {formData.reminder_enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div>
                      <Label htmlFor="reminder_minutes" className="text-base text-purple-800">
                        Remind me before:
                      </Label>
                      <Select
                        value={String(formData.reminder_minutes_before || 0)}
                        onValueChange={(value) => setFormData({ ...formData, reminder_minutes_before: parseInt(value) })}
                      >
                        <SelectTrigger id="reminder_minutes" className="mt-2 bg-white text-base h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">At the time</SelectItem>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="120">2 hours before</SelectItem>
                          <SelectItem value="1440">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.due_date && formData.due_time && (
                      <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                        <p className="text-base text-purple-800">
                          <Bell className="w-5 h-5 inline mr-2" />
                          <strong>Reminder will be sent:</strong>
                          <br />
                          <span className="text-lg font-semibold mt-1 block">
                            {(() => {
                              const dueDateTime = new Date(`${formData.due_date}T${formData.due_time}`);
                              const reminderMinutes = typeof formData.reminder_minutes_before === 'number' ? formData.reminder_minutes_before : 15;
                              const reminderTime = new Date(dueDateTime.getTime() - (reminderMinutes * 60 * 1000));
                              return reminderTime.toLocaleString([], { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              });
                            })()}
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recurring Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl space-y-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Repeat className="w-6 h-6 text-blue-600" />
                <Label className="text-lg font-semibold text-blue-900">Recurring Task</Label>
              </div>

              <div>
                <Label htmlFor="recurring" className="text-base text-blue-800">Repeat:</Label>
                <Select value={formData.recurring} onValueChange={(value) => handleSelectChange("recurring", value)}>
                  <SelectTrigger id="recurring" className="mt-2 bg-white text-base h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurring !== 'none' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                >
                  <div>
                    <Label htmlFor="recurring_start_date" className="text-base text-blue-800">Start Date:</Label>
                    <Input
                      id="recurring_start_date"
                      type="date"
                      name="recurring_start_date"
                      value={formData.recurring_start_date || ''}
                      onChange={handleChange}
                      className="mt-2 bg-white text-base h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recurring_end_date" className="text-base text-blue-800">End Date (Optional):</Label>
                    <Input
                      id="recurring_end_date"
                      type="date"
                      name="recurring_end_date"
                      value={formData.recurring_end_date || ''}
                      onChange={handleChange}
                      className="mt-2 bg-white text-base h-11"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Color Tag Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="color_tag" className="border-2 rounded-xl">
                <AccordionTrigger className="text-base font-semibold px-6 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-teal-600" />
                    Color Tag
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Label className="text-base text-slate-600 mb-4 block">Choose a color to visually tag this task</Label>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(colorTagOptions).map(([color, className]) => (
                      <button 
                        type="button" 
                        key={color} 
                        onClick={() => handleSelectChange("color_tag", color)}
                        className={`w-14 h-14 rounded-full ${className} transition-all flex items-center justify-center ${
                          formData.color_tag === color ? 'ring-4 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-110'
                        }`}
                        aria-label={`Set color to ${color}`}
                      >
                        {formData.color_tag === color && <Check className="w-7 h-7 text-white" />}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose} 
                disabled={isSaving}
                className="px-8 py-6 text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:opacity-90 px-8 py-6 text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete "{task?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base px-6 py-5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-base px-6 py-5"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}