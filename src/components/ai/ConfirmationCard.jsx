import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckSquare, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ConfirmationCard({ item, itemType }) {
  let icon, title, details;

  switch (itemType) {
    case 'task':
      icon = <CheckSquare className="w-5 h-5 text-fuchsia-600" />;
      title = item.title;
      details = item.due_date ? `Due: ${format(new Date(item.due_date), 'MMM d, yyyy')}` : 'No due date';
      break;
    case 'event':
      icon = <Calendar className="w-5 h-5 text-cyan-600" />;
      title = item.title;
      details = item.start_date ? `On: ${format(new Date(item.start_date), 'MMM d, yyyy @ h:mm a')}` : 'No date set';
      break;
    case 'email_draft':
        icon = <Mail className="w-5 h-5 text-sky-600" />;
        title = item.title;
        details = `Drafted. Find it in the Email Center.`;
        break;
    default:
      return null;
  }

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
    >
        <Card className="p-3 bg-white/80 border-gray-200 flex items-start gap-3 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{details}</p>
            </div>
        </Card>
    </motion.div>
  );
}