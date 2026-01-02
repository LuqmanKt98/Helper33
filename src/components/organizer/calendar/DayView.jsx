import React from 'react';
import CalendarTaskItem from './CalendarTaskItem';

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export default function DayView({ selectedDate, tasks, onEditTask }) {
  const getTasksForHour = (hour) => {
    const hourStr = String(hour).padStart(2, '0');
    return tasks.filter(task => task.due_time && task.due_time.startsWith(hourStr));
  };
  
  const untimedTasks = tasks.filter(task => !task.due_time);

  return (
    <div className="h-[70vh] flex flex-col">
      {untimedTasks.length > 0 && (
        <div className="p-3 border-b bg-gray-50/50">
          <h3 className="font-semibold text-sm mb-2 text-gray-700">All Day</h3>
          <div className="space-y-2">
            {untimedTasks.map(task => (
              <CalendarTaskItem key={task.isRecurringInstance ? `recurring-${task.originalTaskId}-${task.due_date}` : task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-gray-200 h-20">
              <div className="w-16 text-right pr-2 pt-1">
                <span className="text-xs text-gray-500">{hour}</span>
              </div>
              <div className="flex-1 p-1">
                {getTasksForHour(parseInt(hour.split(':')[0])).map(task => (
                   <CalendarTaskItem key={task.isRecurringInstance ? `recurring-${task.originalTaskId}-${task.due_date}` : task.id} task={task} onEdit={onEditTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}