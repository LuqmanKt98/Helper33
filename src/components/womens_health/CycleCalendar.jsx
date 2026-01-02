import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO
} from 'date-fns';
import PeriodLogModal from './PeriodLogModal';

export default function CycleCalendar({ cycles, symptoms, cycleInfo }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayInfo = (day) => {
    const daySymptoms = symptoms.find(s => isSameDay(parseISO(s.log_date), day));
    
    let isPeriodDay = false;
    let isOvulationDay = false;
    let isFertileDay = false;
    let isPredictedPeriodDay = false;
    let isPredictedOvulationDay = false;
    let cycleForThisDay = null;
    
    cycles.forEach(cycle => {
      const cycleStart = parseISO(cycle.cycle_start_date);
      const periodEnd = addDays(cycleStart, (cycle.period_length_days || 5) - 1);
      
      // Actual period days
      if (day >= cycleStart && day <= periodEnd) {
        isPeriodDay = true;
        cycleForThisDay = cycle;
      }
      
      // Actual ovulation
      if (cycle.ovulation_date && isSameDay(parseISO(cycle.ovulation_date), day)) {
        isOvulationDay = true;
      }
      
      // Fertile window
      if (cycle.fertile_window_start && cycle.fertile_window_end) {
        const fertileStart = parseISO(cycle.fertile_window_start);
        const fertileEnd = parseISO(cycle.fertile_window_end);
        if (day >= fertileStart && day <= fertileEnd && !isPeriodDay) {
          isFertileDay = true;
        }
      }

      // Predicted ovulation
      if (cycle.predicted_ovulation_date && isSameDay(parseISO(cycle.predicted_ovulation_date), day)) {
        isPredictedOvulationDay = true;
      }

      // Predicted next period (only for current cycle)
      if (cycle.is_current_cycle && cycle.predicted_next_period && isSameDay(parseISO(cycle.predicted_next_period), day)) {
        isPredictedPeriodDay = true;
      }
    });

    return { 
      daySymptoms, 
      isPeriodDay, 
      isOvulationDay, 
      isFertileDay, 
      isPredictedPeriodDay,
      isPredictedOvulationDay,
      cycleForThisDay 
    };
  };

  const handleDayClick = (day, info) => {
    if (info.cycleForThisDay) {
      setEditingCycle(info.cycleForThisDay);
      setShowPeriodModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowPeriodModal(false);
    setEditingCycle(null);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingCycle(null);
              setShowPeriodModal(true);
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 mt-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log New Period
          </Button>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const info = getDayInfo(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isFuture = day > new Date();

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => handleDayClick(day, info)}
                  className={`
                    aspect-square p-2 rounded-xl border-2 transition-all
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-50'}
                    ${isToday ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'}
                    ${info.isPeriodDay ? 'bg-gradient-to-br from-red-100 to-pink-100 border-red-300 cursor-pointer hover:shadow-lg' : ''}
                    ${info.isPredictedPeriodDay && !info.isPeriodDay ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 border-dashed' : ''}
                    ${info.isOvulationDay ? 'bg-gradient-to-br from-pink-200 to-rose-200 border-rose-400' : ''}
                    ${info.isPredictedOvulationDay && !info.isOvulationDay ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300 border-dashed' : ''}
                    ${info.isFertileDay && !info.isPeriodDay && !info.isOvulationDay ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300' : ''}
                    ${!info.isPeriodDay && !info.isPredictedPeriodDay ? 'hover:shadow-md hover:scale-105 cursor-pointer' : ''}
                  `}
                >
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Day Indicators */}
                  <div className="flex flex-wrap gap-1">
                    {info.isPeriodDay && (
                      <div className="w-2 h-2 rounded-full bg-red-500" title="Period Day" />
                    )}
                    {info.isPredictedPeriodDay && !info.isPeriodDay && (
                      <div className="w-2 h-2 rounded-full bg-red-300 border border-red-400" title="Predicted Period" />
                    )}
                    {info.isOvulationDay && (
                      <div className="w-2 h-2 rounded-full bg-pink-500" title="Ovulation Detected" />
                    )}
                    {info.isPredictedOvulationDay && !info.isOvulationDay && (
                      <div className="w-2 h-2 rounded-full bg-pink-300 border border-pink-400" title="Predicted Ovulation" />
                    )}
                    {info.isFertileDay && (
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Fertile Window" />
                    )}
                    {info.daySymptoms && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" title="Symptoms Logged" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-gray-700">Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-300 border border-red-400" />
              <span className="text-sm text-gray-700">Predicted Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-500" />
              <span className="text-sm text-gray-700">Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-300 border border-pink-400" />
              <span className="text-sm text-gray-700">Predicted Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">Fertile Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-700">Symptoms Logged</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <PeriodLogModal 
        isOpen={showPeriodModal}
        onClose={handleCloseModal}
        avgCycleLength={cycleInfo.avgCycleLength}
        editingCycle={editingCycle}
      />
    </>
  );
}