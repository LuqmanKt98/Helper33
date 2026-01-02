import React from 'react';
import { ArrowUp, ChevronsUp, AlertTriangle, Clock } from 'lucide-react';

const priorityIcons = {
  low: <ArrowUp className="w-3 h-3 text-green-600" />,
  medium: <ArrowUp className="w-3 h-3 text-yellow-600" />,
  high: <ChevronsUp className="w-3 h-3 text-orange-600" />,
  urgent: <AlertTriangle className="w-3 h-3 text-red-600" />,
};

const colorTagClasses = {
  default: 'bg-slate-200 text-slate-800',
  red: 'bg-rose-200 text-rose-800',
  orange: 'bg-orange-200 text-orange-800',
  yellow: 'bg-yellow-200 text-yellow-800',
  green: 'bg-emerald-200 text-emerald-800',
  blue: 'bg-sky-200 text-sky-800',
  purple: 'bg-purple-200 text-purple-800',
  pink: 'bg-pink-200 text-pink-800',
};

export default function CalendarTaskItem({ task, onEdit, showTime = true }) {
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <div
      onClick={handleEdit}
      className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow ${colorTagClasses[task.color_tag || 'default']}`}
      title={task.title}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">{priorityIcons[task.priority]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{task.title}</p>
          {showTime && task.due_time && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{task.due_time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}