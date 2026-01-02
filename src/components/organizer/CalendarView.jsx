
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import MonthView from './calendar/MonthView';
import WeekView from './calendar/WeekView';
import DayView from './calendar/DayView';

export default function CalendarView({
  selectedDate,
  setSelectedDate,
  tasks,
  recurringInstances,
  onEditTask,
  onDateClick,
}) {
  const [displayMode, setDisplayMode] = useState('month');

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };
  
  const handleDateChange = (amount, unit) => {
    const newDate = new Date(selectedDate);
    if (unit === 'month') newDate.setMonth(newDate.getMonth() + amount);
    if (unit === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
    if (unit === 'day') newDate.setDate(newDate.getDate() + amount);
    setSelectedDate(newDate);
  };

  const getHeaderTitle = () => {
    const unit = displayMode;
    if (unit === 'month') return format(selectedDate, 'MMMM yyyy');
    if (unit === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(selectedDate, 'EEEE, MMMM d, yyyy');
  };

  const allTasksInView = useMemo(() => {
    const uniqueTasks = new Map();
    [...tasks, ...recurringInstances].forEach(task => {
        const key = task.isRecurringInstance ? `${task.originalTaskId}-${task.due_date}` : task.id;
        uniqueTasks.set(key, task);
    });
    return Array.from(uniqueTasks.values());
  }, [tasks, recurringInstances]);

  return (
    <div data-card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 border border-white/30">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">
          {getHeaderTitle()}
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="relative flex bg-gray-100/90 backdrop-blur-sm rounded-lg p-1 border border-gray-200/80">
              {[{id: 'month', label: 'Month'}, {id: 'week', label: 'Week'}, {id: 'day', label: 'Day'}].map(mode => (
                <button key={mode.id} onClick={() => handleDisplayModeChange(mode.id)}
                  className={`relative w-20 py-1 text-xs sm:text-sm font-medium transition-colors z-10 ${displayMode === mode.id ? 'text-indigo-700' : 'text-gray-600 hover:text-indigo-600'}`}>
                  {mode.label}
                  {displayMode === mode.id && <motion.div layoutId="activeCalendarDisplayMode" className="absolute inset-0 bg-white rounded-md shadow-sm z-[-1]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => handleDateChange(-1, displayMode)} className="bg-white/70 h-9 w-9 hover:bg-white shadow-sm" aria-label="Previous">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="bg-white/70 h-9 hover:bg-white shadow-sm font-semibold" aria-label="Go to today">
                <Target className="w-4 h-4 mr-1 sm:mr-2" />
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDateChange(1, displayMode)} className="bg-white/70 h-9 w-9 hover:bg-white shadow-sm" aria-label="Next">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={displayMode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
        >
            {displayMode === 'month' && (
              <MonthView
                selectedDate={selectedDate}
                tasks={allTasksInView}
                onDateClick={onDateClick}
                onEditTask={onEditTask}
              />
            )}
            {displayMode === 'week' && (
              <WeekView
                selectedDate={selectedDate}
                tasks={allTasksInView}
                onEditTask={onEditTask}
                onDateClick={onDateClick}
              />
            )}
            {displayMode === 'day' && (
              <DayView
                selectedDate={selectedDate}
                tasks={allTasksInView}
                onEditTask={onEditTask}
              />
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
