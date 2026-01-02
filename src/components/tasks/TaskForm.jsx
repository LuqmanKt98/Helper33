import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskForm({ task, onSubmit, onCancel }) {
    const [currentTask, setCurrentTask] = React.useState(task || {
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        category: "daily_living",
        due_date: "",
        due_time: "",
        reminder_enabled: false,
        reminder_minutes_before: 15,
        recurring: "none",
        estimated_duration: ""
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(currentTask);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    placeholder="What needs to be done?"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                    className="text-lg"
                />
                <Textarea
                    placeholder="Add details..."
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                    className="h-24"
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                    <Select
                        value={currentTask.priority}
                        onValueChange={(value) => setCurrentTask({...currentTask, priority: value})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={currentTask.category}
                        onValueChange={(value) => setCurrentTask({...currentTask, category: value})}
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

                {/* Due Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Due Date</Label>
                        <Input
                            type="date"
                            value={currentTask.due_date}
                            onChange={(e) => setCurrentTask({...currentTask, due_date: e.target.value})}
                        />
                    </div>
                    <div>
                        <Label>Due Time (optional)</Label>
                        <Input
                            type="time"
                            value={currentTask.due_time}
                            onChange={(e) => setCurrentTask({...currentTask, due_time: e.target.value})}
                        />
                    </div>
                </div>

                {/* Estimated Duration */}
                <div>
                    <Label>Estimated Duration (minutes)</Label>
                    <Input
                        type="number"
                        min="0"
                        placeholder="How long will this take?"
                        value={currentTask.estimated_duration}
                        onChange={(e) => setCurrentTask({...currentTask, estimated_duration: parseInt(e.target.value) || ""})}
                    />
                </div>

                {/* Reminder Settings */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <Label className="text-base font-medium">Reminder Settings</Label>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="checkbox"
                            id="reminder-enabled"
                            checked={currentTask.reminder_enabled}
                            onChange={(e) => setCurrentTask({...currentTask, reminder_enabled: e.target.checked})}
                        />
                        <Label htmlFor="reminder-enabled">Enable reminders for this task</Label>
                    </div>

                    {currentTask.reminder_enabled && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Remind me</Label>
                                <Select
                                    value={currentTask.reminder_minutes_before.toString()}
                                    onValueChange={(value) => setCurrentTask({...currentTask, reminder_minutes_before: parseInt(value)})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 minutes before</SelectItem>
                                        <SelectItem value="15">15 minutes before</SelectItem>
                                        <SelectItem value="30">30 minutes before</SelectItem>
                                        <SelectItem value="60">1 hour before</SelectItem>
                                        <SelectItem value="1440">1 day before</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Recurring</Label>
                                <Select
                                    value={currentTask.recurring}
                                    onValueChange={(value) => setCurrentTask({...currentTask, recurring: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No repeat</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        {task ? 'Update Task' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}