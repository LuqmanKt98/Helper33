
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon, // Renamed from CalendarIcon
    CheckCircle2,
    Circle,
    Pencil, // Now directly Pencil
    ArrowUpCircle, // New import
    MessageSquare, // New import
    Sparkles // New import
} from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "../../components/SoundManager";

export default function TaskItem({ task, onStatusChange, onEdit, onCheckIn }) {
    const { playSound } = useNotifications(); // Kept useNotifications hook, but playSound usage will be updated/removed as per outline.

    // Define icons for different task statuses
    const statusIcons = {
        todo: <Circle className="w-6 h-6 text-gray-400" />,
        in_progress: <ArrowUpCircle className="w-6 h-6 text-blue-500" />,
        done: <CheckCircle2 className="w-6 h-6 text-green-500" />,
        // Fallback for any unexpected status
        default: <Circle className="w-6 h-6 text-gray-400" />,
    };

    const priorityColors = {
        low: "bg-blue-100 text-blue-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800"
    };

    const categoryColors = {
        self_care: "bg-pink-100 text-pink-800",
        family: "bg-purple-100 text-purple-800",
        work: "bg-blue-100 text-blue-800",
        health: "bg-emerald-100 text-emerald-800",
        grief_support: "bg-rose-100 text-rose-800",
        daily_living: "bg-cyan-100 text-cyan-800",
        other: "bg-gray-100 text-gray-800"
    };

    // The outline implies a different status handling and removes direct sound feedback for status changes
    // The previous handleStatusToggle and related sound logic are removed as per the outline's new status dropdown.

    return (
        <motion.div
            layout // Keep layout for smooth transitions
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} // Updated exit animation
            className="group" // Keep group class for hover effects if any are implicitly desired from original
        >
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-start justify-between p-6 pb-0"> {/* Adjusted padding */}
                    <div className="flex items-start gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="mt-1 hover:opacity-70 transition-opacity" aria-label={`Change status of ${task.title}`}>
                                    {statusIcons[task.status] || statusIcons.default}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onStatusChange(task, "todo")}>
                                    <Circle className="w-4 h-4 mr-2 text-gray-400" />
                                    Mark as Todo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(task, "in_progress")}>
                                    <ArrowUpCircle className="w-4 h-4 mr-2 text-blue-500" />
                                    Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(task, "done")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                    Mark as Done
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex-1">
                            <CardTitle className={`text-lg font-semibold text-gray-800 transition-all duration-300 ${
                                task.status === 'done' ? 'line-through text-gray-500' : ''
                            }`}>
                                {task.title}
                                {task.status === 'done' && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="ml-2 text-sm"
                                    >
                                        🎉
                                    </motion.span>
                                )}
                            </CardTitle>
                            <div className="flex gap-2 mt-2 flex-wrap text-sm"> {/* Added text-sm for badges */}
                                <Badge className={`${priorityColors[task.priority]} capitalize`}>
                                    {task.priority} priority
                                </Badge>
                                {task.status === 'in_progress' && (
                                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                                )}
                                {task.category && categoryColors[task.category] && (
                                    <Badge className={`${categoryColors[task.category]} capitalize`}>
                                        {task.category.replace(/_/g, ' ')}
                                    </Badge>
                                )}
                                {task.due_date && (
                                    <Badge variant="outline" className="flex items-center gap-1 text-gray-600">
                                        <CalendarIcon className="w-3 h-3" />
                                        {format(new Date(task.due_date), 'MMM d')}
                                    </Badge>
                                )}
                                {task.ai_generated && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                        <Sparkles className="w-3 h-3 mr-1" /> AI Suggested
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onCheckIn && task.tags?.includes('life-coach-goal') && task.status !== 'done' && ( // Changed completed to done
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCheckIn(task)}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Check In
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(task)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Edit task"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                {task.description && (
                    <CardContent className="p-6 pt-0"> {/* Adjusted padding */}
                        <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p> {/* Added text-sm */}
                    </CardContent>
                )}
            </Card>
        </motion.div>
    );
}
