
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Palette, Check, Calendar, Loader2, Bell, Clock } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User } from '@/entities/all';
import { motion } from 'framer-motion';

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

export default function TaskForm({ taskToEdit, onSave, onCancel, familyMembers = [] }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => User.me(),
  });

  const [formData, setFormData] = useState(() => {
    if (taskToEdit) {
      return {
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'pending',
        priority: taskToEdit.priority || 'medium',
        category: taskToEdit.category || 'daily_living',
        color_tag: taskToEdit.color_tag || 'default',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '',
        due_time: taskToEdit.due_time ? taskToEdit.due_time.substring(0, 5) : '',
        reminder_enabled: taskToEdit.reminder_enabled || false,
        reminder_minutes_before: taskToEdit.reminder_minutes_before || 15,
        recurring: taskToEdit.recurring || 'none',
        estimated_duration: taskToEdit.estimated_duration || 60,
        assigned_family_member: taskToEdit.assigned_family_member || '',
        tags: taskToEdit.tags || []
      };
    }
    return {
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
      estimated_duration: 60,
      assigned_family_member: '',
      tags: []
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'pending',
        priority: taskToEdit.priority || 'medium',
        category: taskToEdit.category || 'daily_living',
        color_tag: taskToEdit.color_tag || 'default',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '',
        due_time: taskToEdit.due_time ? taskToEdit.due_time.substring(0, 5) : '',
        reminder_enabled: taskToEdit.reminder_enabled || false,
        reminder_minutes_before: taskToEdit.reminder_minutes_before || 15,
        recurring: taskToEdit.recurring || 'none',
        estimated_duration: taskToEdit.estimated_duration || 60,
        assigned_family_member: taskToEdit.assigned_family_member || '',
        tags: taskToEdit.tags || []
      });
    } else {
      setFormData({
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
        estimated_duration: 60,
        assigned_family_member: '',
        tags: []
      });
    }
  }, [taskToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        owner_id: formData.assigned_family_member || user?.id,
      };

      let toastMessage = '';
      if (taskToEdit) {
        toastMessage = taskData.reminder_enabled && taskData.due_date && taskData.due_time 
          ? 'Task updated with reminder!' 
          : 'Task updated successfully!';
      } else {
        toastMessage = taskData.reminder_enabled && taskData.due_date && taskData.due_time 
          ? 'Task created with reminder!' 
          : 'Task created successfully!';
      }

      await onSave(taskData);
      
      if (taskData.reminder_enabled && taskData.due_date && taskData.due_time) {
        const dueDateTime = new Date(`${taskData.due_date}T${taskData.due_time}`);
        const reminderMinutes = typeof taskData.reminder_minutes_before === 'number' ? taskData.reminder_minutes_before : 15;
        const reminderTime = new Date(dueDateTime.getTime() - (reminderMinutes * 60 * 1000));
        
        toast.success(toastMessage, {
          description: `You'll get a reminder at ${reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          duration: 5000
        });
      } else {
        toast.success(toastMessage);
      }

      if (!taskToEdit) {
        setFormData({
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
          estimated_duration: 60,
          assigned_family_member: '',
          tags: []
        });
      }

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card data-card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 border-b pb-4">
        <CardTitle className="text-xl text-slate-800">{taskToEdit ? "Edit Task" : "Add New Task"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <form onSubmit={handleSubmit} id="task-form" className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-base font-semibold text-slate-700 mb-2 block">Task Title *</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="What needs to be done?" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              className="text-base h-12"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-semibold text-slate-700 mb-2 block">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Add more details..." 
              value={formData.description} 
              onChange={handleChange} 
              className="min-h-[120px] text-base resize-y"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="priority" className="text-base font-semibold text-slate-700 mb-2 block">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                <SelectTrigger id="priority" className="h-12 text-base">
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
              <Label htmlFor="category" className="text-base font-semibold text-slate-700 mb-2 block">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger id="category" className="h-12 text-base">
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
          
          {/* Due Date & Time */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="due_date" className="text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                id="due_date"
                type="date"
                name="due_date"
                value={formData.due_date || ''}
                onChange={handleChange}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="due_time" className="text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due Time
              </Label>
              <Input
                id="due_time"
                type="time"
                name="due_time"
                value={formData.due_time || ''}
                onChange={handleChange}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl space-y-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <Label htmlFor="reminder_enabled" className="text-base font-semibold text-purple-900 cursor-pointer">
                  Enable Reminder
                </Label>
              </div>
              <Switch
                id="reminder_enabled"
                checked={formData.reminder_enabled || false}
                onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
                className="scale-110"
              />
            </div>

            {formData.reminder_enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div>
                  <Label htmlFor="reminder_minutes" className="text-sm text-purple-800 mb-2 block">
                    Remind me before:
                  </Label>
                  <Select
                    value={String(formData.reminder_minutes_before || 0)}
                    onValueChange={(value) => setFormData({ ...formData, reminder_minutes_before: parseInt(value) })}
                  >
                    <SelectTrigger id="reminder_minutes" className="bg-white h-12 text-base">
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
                  <div className="bg-white p-3 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-purple-800">
                      <Bell className="w-4 h-4 inline mr-1" />
                      <strong>Reminder will be sent:</strong>
                      <br />
                      <span className="text-base font-semibold mt-1 block">
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
          </div>

          {/* Color Tag Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="color_tag" className="border rounded-lg">
              <AccordionTrigger className="text-base font-semibold px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-teal-600" />
                  Color Tag
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Label className="text-sm text-slate-600 mb-3 block">Choose a color to visually tag this task</Label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(colorTagOptions).map(([color, className]) => (
                    <button 
                      type="button" 
                      key={color} 
                      onClick={() => handleSelectChange("color_tag", color)}
                      className={`w-12 h-12 rounded-full ${className} transition-all flex items-center justify-center ${
                        formData.color_tag === color ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-110'
                      }`}
                      aria-label={`Set color to ${color}`}
                    >
                      {formData.color_tag === color && <Check className="w-6 h-6 text-white" />}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 border-t pt-4 bg-slate-50/50">
        {onCancel && (
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel} 
            disabled={isSaving}
            className="bg-white px-6 h-11"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          form="task-form"
          disabled={isSaving} 
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:opacity-90 px-6 h-11"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {taskToEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            taskToEdit ? 'Save Changes' : 'Create Task'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
