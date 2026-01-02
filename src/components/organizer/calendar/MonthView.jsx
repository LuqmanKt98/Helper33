import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CalendarTaskItem from './CalendarTaskItem';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function MonthView({ selectedDate, tasks, onDateClick, onEditTask }) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 border-b pb-2 mb-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr gap-1.5 flex-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <motion.div
              key={dateStr}
              onClick={() => onDateClick(day)}
              className={`min-h-[12vh] sm:min-h-[14vh] border p-2 cursor-pointer transition-colors relative overflow-hidden group rounded-lg ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${
                isCurrentDay ? 'border-2 border-indigo-500' : 'border-gray-200'
              } hover:bg-indigo-50 hover:border-indigo-300`}
            >
              <div className={`text-xs sm:text-sm font-bold flex items-center justify-between ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'} ${isCurrentDay ? 'text-indigo-600' : ''}`}>
                <span>{format(day, 'd')}</span>
                {dayTasks.length > 0 && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-indigo-100 text-indigo-700 font-bold hidden sm:block">{dayTasks.length}</Badge>}
              </div>

              <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(14vh-2rem)]">
                {dayTasks.slice(0, 2).map(task => (
                  <CalendarTaskItem key={task.isRecurringInstance ? `recurring-${task.originalTaskId}-${task.due_date}` : task.id} task={task} onEdit={onEditTask} />
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-center text-gray-600 font-semibold bg-gray-100 rounded px-1 py-0.5 mt-1">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}