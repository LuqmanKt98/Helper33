import React from 'react';
import CalendarTaskItem from './CalendarTaskItem';
import { format, startOfWeek, eachDayOfInterval, isToday } from 'date-fns';

export default function WeekView({ selectedDate, tasks, onEditTask, onDateClick }) {
  const weekStart = startOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: new Date(weekStart).setDate(weekStart.getDate() + 6) });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-1 min-h-[70vh]">
      {weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        const isCurrentDay = isToday(date);

        return (
          <div key={dateStr} className={`p-2 rounded-lg ${isCurrentDay ? 'bg-indigo-50' : 'bg-gray-50/70'}`}>
            <div 
              onClick={() => onDateClick(date)}
              className={`text-center mb-2 pb-2 border-b-2 cursor-pointer ${isCurrentDay ? 'border-indigo-500' : 'border-gray-200'}`}
            >
              <p className="text-xs text-gray-500">{format(date, 'EEE')}</p>
              <p className={`text-lg sm:text-xl font-bold ${isCurrentDay ? 'text-indigo-700' : 'text-gray-800'}`}>{format(date, 'd')}</p>
            </div>
            <div className="space-y-2 h-[calc(70vh-4rem)] overflow-y-auto">
              {dayTasks.map(task => (
                <CalendarTaskItem key={task.isRecurringInstance ? `recurring-${task.originalTaskId}-${task.due_date}` : task.id} task={task} onEdit={onEditTask} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}