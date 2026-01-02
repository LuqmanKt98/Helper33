
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Brain, Calendar, Plus, Edit, X, Save, CheckCircle2, Circle, Check } from 'lucide-react';

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

const categoryColors = {
  self_care: "bg-pink-100 text-pink-800 border-pink-200",
  family: "bg-purple-100 text-purple-800 border-purple-200",
  work: "bg-blue-100 text-blue-800 border-blue-200",
  health: "bg-emerald-100 text-emerald-800 border-emerald-200",
  grief_support: "bg-rose-100 text-rose-800 border-rose-200",
  daily_living: "bg-cyan-100 text-cyan-800 border-cyan-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

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

// Memoized SuggestionItem component to prevent re-renders of non-editing items
const SuggestionItem = memo(({ suggestion, index, isSelected, isEditing, onToggle, onEdit, onDelete, onSave, onChange }) => {
  if (isEditing) {
    return (
        <Card className="border-2 border-purple-500 bg-purple-50/50">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Task title *"
              value={suggestion.title}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              className="font-semibold"
            />
            <Textarea
              placeholder="Description"
              value={suggestion.description}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              className="h-20"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={suggestion.priority}
                onValueChange={(value) => onChange(index, 'priority', value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={suggestion.category}
                onValueChange={(value) => onChange(index, 'category', value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={suggestion.due_date || ''}
                  onChange={(e) => onChange(index, 'due_date', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Due Time</Label>
                <Input
                  type="time"
                  value={suggestion.due_time || ''}
                  onChange={(e) => onChange(index, 'due_time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Color Tag</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(colorTagOptions).map(([color, className]) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => onChange(index, 'color_tag', color)}
                    className={`w-6 h-6 rounded-full ${className} transition-all flex items-center justify-center ${suggestion.color_tag === color ? 'ring-2 ring-offset-1 ring-purple-500' : 'hover:scale-110'}`}
                    aria-label={`Set color to ${color}`}
                  >
                    {suggestion.color_tag === color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!suggestion.title.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-2 border-purple-500 bg-purple-50/50 shadow-md'
          : 'border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="mt-1 cursor-pointer"
            onClick={() => onToggle(index)}
          >
            {isSelected ? (
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0" onClick={() => onToggle(index)}>
            <h4 className="font-semibold text-gray-800 mb-1 break-words">
              {suggestion.title || <span className="text-gray-400 italic">Untitled Task</span>}
            </h4>
              <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={priorityColors[suggestion.priority]}>
                {suggestion.priority}
              </Badge>
              <Badge className={categoryColors[suggestion.category]}>
                {suggestion.category.replace('_', ' ')}
              </Badge>
              {suggestion.due_date && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(suggestion.due_date).toLocaleDateString()}
                  {suggestion.due_time && ` at ${suggestion.due_time}`}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 break-words">
              {suggestion.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
            className="flex-shrink-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default function AiSuggestionsModal({
  isOpen,
  onClose,
  aiSuggestions,
  setAiSuggestions,
  onAccept
}) {
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState(null);
  const [bulkScheduleDate, setBulkScheduleDate] = useState("");
  const [bulkScheduleTime, setBulkScheduleTime] = useState("");

  const toggleSuggestionSelection = (index) => {
    setSelectedSuggestions(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        return newSelected;
    });
  };
  
  const handleSuggestionChange = (index, field, value) => {
    setAiSuggestions(currentSuggestions =>
        currentSuggestions.map((suggestion, i) =>
            i === index ? { ...suggestion, [field]: value } : suggestion
        )
    );
  };

  const saveSuggestionEdit = () => {
    setEditingSuggestionIndex(null);
  };

  const deleteSuggestion = (index) => {
    setAiSuggestions(currentSuggestions => currentSuggestions.filter((_, i) => i !== index));
    setSelectedSuggestions(prevSelected => {
        const newSelected = new Set();
        prevSelected.forEach(selectedIndex => {
            if (selectedIndex < index) {
                newSelected.add(selectedIndex);
            } else if (selectedIndex > index) {
                newSelected.add(selectedIndex - 1);
            }
        });
        return newSelected;
    });
  };

  const addNewSuggestion = () => {
    const newSuggestion = {
      id: `custom-${Date.now()}`, // Add a unique ID for custom tasks
      title: "", description: "", priority: "medium", category: "daily_living",
      due_date: "", due_time: "", reminder_enabled: false, reminder_minutes_before: 15,
      recurring: "none", recurring_start_date: "", recurring_end_date: "",
      estimated_duration: "", color_tag: "default"
    };
    const newIndex = aiSuggestions.length;
    setAiSuggestions([...aiSuggestions, newSuggestion]);
    setEditingSuggestionIndex(newIndex);
  };

  const applyBulkSchedule = () => {
    if (selectedSuggestions.size === 0) {
      alert("Please select at least one task to apply scheduling.");
      return;
    }
    if (!bulkScheduleDate) {
      alert("Please select a date to schedule tasks.");
      return;
    }

    setAiSuggestions(currentSuggestions => 
        currentSuggestions.map((suggestion, index) => {
            if (selectedSuggestions.has(index)) {
                return {
                    ...suggestion,
                    due_date: bulkScheduleDate,
                    due_time: bulkScheduleTime || suggestion.due_time
                };
            }
            return suggestion;
        })
    );

    alert(`✅ Applied schedule to ${selectedSuggestions.size} selected task${selectedSuggestions.size !== 1 ? 's' : ''}!`);
  };

  const handleAccept = () => {
    const tasksToCreate = aiSuggestions.filter((_, index) => selectedSuggestions.has(index));
    onAccept(tasksToCreate);
  };
  
  const handleClose = () => {
    setSelectedSuggestions(new Set());
    setEditingSuggestionIndex(null);
    setBulkScheduleDate("");
    setBulkScheduleTime("");
    onClose();
  }
  
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent data-card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Task Suggestions - Customize & Schedule
            </DialogTitle>
            <DialogDescription>
              Review, edit, and schedule these suggested tasks. Select tasks to schedule them all at once, or add your own custom tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="bulk-date" className="text-sm font-semibold text-purple-900 mb-1 block">
                  Schedule Selected Tasks For:
                </Label>
                <Input
                  id="bulk-date"
                  type="date"
                  value={bulkScheduleDate}
                  onChange={(e) => setBulkScheduleDate(e.target.value)}
                  className="border-purple-200"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="bulk-time" className="text-sm text-purple-700 mb-1 block">Time</Label>
                <Input
                  id="bulk-time"
                  type="time"
                  value={bulkScheduleTime}
                  onChange={(e) => setBulkScheduleTime(e.target.value)}
                  className="border-purple-200"
                />
              </div>
              <Button
                onClick={applyBulkSchedule}
                disabled={selectedSuggestions.size === 0 || !bulkScheduleDate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Apply to {selectedSuggestions.size} Task{selectedSuggestions.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              <AnimatePresence>
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id} // Use the unique ID as the key
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SuggestionItem
                        suggestion={suggestion}
                        index={index}
                        isSelected={selectedSuggestions.has(index)}
                        isEditing={editingSuggestionIndex === index}
                        onToggle={toggleSuggestionSelection}
                        onEdit={setEditingSuggestionIndex}
                        onDelete={deleteSuggestion}
                        onSave={saveSuggestionEdit}
                        onChange={handleSuggestionChange}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                onClick={addNewSuggestion}
                variant="outline"
                className="w-full border-dashed border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Task
              </Button>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white/95 backdrop-blur-sm z-10 p-6 pt-4 border-t flex flex-col sm:flex-row gap-2">
            <div className="flex-1 text-sm text-gray-600 flex items-center">
              {selectedSuggestions.size} of {aiSuggestions.length} tasks selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={selectedSuggestions.size === 0}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedSuggestions.size} Selected Task{selectedSuggestions.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
