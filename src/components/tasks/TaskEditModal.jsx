
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskEditModal({ task, isOpen, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        category: "daily_living",
        due_date: "",
        due_time: "",
        reminder_enabled: false,
        reminder_minutes_before: 15,
        recurring: "none",
        recurring_start_date: "",
        recurring_end_date: "",
        estimated_duration: ""
    });

    useEffect(() => {
        if (task && isOpen) {
            setFormData({
                title: task.title || "",
                description: task.description || "",
                priority: task.priority || "medium",
                category: task.category || "daily_living",
                due_date: task.due_date || "",
                due_time: task.due_time || "",
                reminder_enabled: task.reminder_enabled || false,
                reminder_minutes_before: task.reminder_minutes_before || 15,
                recurring: task.recurring || "none",
                recurring_start_date: task.recurring_start_date || "",
                recurring_end_date: task.recurring_end_date || "",
                estimated_duration: task.estimated_duration ? String(task.estimated_duration) : ""
            });
        }
    }, [task, isOpen]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        
        const taskData = {
            ...task,
            ...formData,
            estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null
        };
        
        onSave(taskData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Task Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="What needs to be done?"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="text-lg"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Add details..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="h-24"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleSelectChange("priority", value)}
                                    >
                                        <SelectTrigger>
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
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleSelectChange("category", value)}
                                    >
                                        <SelectTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        name="due_date"
                                        type="date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="due_time">Due Time</Label>
                                    <Input
                                        id="due_time"
                                        name="due_time"
                                        type="time"
                                        value={formData.due_time}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="reminder-enabled"
                                    checked={formData.reminder_enabled}
                                    onCheckedChange={(checked) => handleSelectChange("reminder_enabled", checked)}
                                />
                                <Label htmlFor="reminder-enabled">Enable Reminder</Label>
                            </div>

                            {formData.reminder_enabled && (
                                <div>
                                    <Label>Reminder Time</Label>
                                    <Select
                                        value={String(formData.reminder_minutes_before)}
                                        onValueChange={(value) => handleSelectChange("reminder_minutes_before", parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Remind me" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 minutes before</SelectItem>
                                            <SelectItem value="10">10 minutes before</SelectItem>
                                            <SelectItem value="15">15 minutes before</SelectItem>
                                            <SelectItem value="30">30 minutes before</SelectItem>
                                            <SelectItem value="60">1 hour before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label>Recurring</Label>
                                <Select
                                    value={formData.recurring}
                                    onValueChange={(value) => handleSelectChange("recurring", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Recurring" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not Recurring</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.recurring !== "none" && (
                                <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <Label className="text-sm font-semibold text-purple-900">Recurring Schedule</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="recurring_start_date" className="text-xs text-purple-700">Start Date</Label>
                                            <Input
                                                type="date"
                                                id="recurring_start_date"
                                                name="recurring_start_date"
                                                value={formData.recurring_start_date || formData.due_date}
                                                onChange={handleChange}
                                                title="When does this recurring task start?"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="recurring_end_date" className="text-xs text-purple-700">End Date (Optional)</Label>
                                            <Input
                                                type="date"
                                                id="recurring_end_date"
                                                name="recurring_end_date"
                                                value={formData.recurring_end_date || ""}
                                                onChange={handleChange}
                                                title="When does this recurring task end? Leave empty for no end date."
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600">
                                        This task will repeat <strong>{formData.recurring}</strong> and appear on the calendar for each occurrence.
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                                <Input
                                    id="estimated_duration"
                                    name="estimated_duration"
                                    type="number"
                                    placeholder="How long will this take?"
                                    value={formData.estimated_duration}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
