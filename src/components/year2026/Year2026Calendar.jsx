import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const MONTHS_2025 = [
  { number: -1, name: 'November 2025', year: 2025, month: 10, displayName: 'Nov' },
  { number: 0, name: 'December 2025', year: 2025, month: 11, displayName: 'Dec' }
];

const MONTHS_2026 = [
  { number: 1, name: 'January 2026', year: 2026, month: 0, displayName: 'Jan' },
  { number: 2, name: 'February 2026', year: 2026, month: 1, displayName: 'Feb' },
  { number: 3, name: 'March 2026', year: 2026, month: 2, displayName: 'Mar' },
  { number: 4, name: 'April 2026', year: 2026, month: 3, displayName: 'Apr' },
  { number: 5, name: 'May 2026', year: 2026, month: 4, displayName: 'May' },
  { number: 6, name: 'June 2026', year: 2026, month: 5, displayName: 'Jun' },
  { number: 7, name: 'July 2026', year: 2026, month: 6, displayName: 'Jul' },
  { number: 8, name: 'August 2026', year: 2026, month: 7, displayName: 'Aug' },
  { number: 9, name: 'September 2026', year: 2026, month: 8, displayName: 'Sep' },
  { number: 10, name: 'October 2026', year: 2026, month: 9, displayName: 'Oct' },
  { number: 11, name: 'November 2026', year: 2026, month: 10, displayName: 'Nov' },
  { number: 12, name: 'December 2026', year: 2026, month: 11, displayName: 'Dec' }
];

const WEATHER_ICONS = {
  sunny: Sun,
  partly_cloudy: Cloud,
  cloudy: CloudDrizzle,
  rainy: CloudRain,
  stormy: CloudSnow
};

export default function Year2026Calendar({ goals, checkIns, queryClient }) {
  const today = new Date();
  const [activeYear, setActiveYear] = useState(today.getFullYear() === 2025 ? '2025' : '2026');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    if (today.getFullYear() === 2025) {
      return today.getMonth() === 10 ? 0 : 1; // Nov = 0, Dec = 1
    }
    return today.getMonth(); // 0-11 for 2026
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [checkInData, setCheckInData] = useState({
    mood_rating: 7,
    energy_level: 7,
    emotional_weather: 'sunny',
    wins_today: [],
    gratitude: [],
    reflection: '',
    tomorrow_intentions: []
  });

  const months = activeYear === '2025' ? MONTHS_2025 : MONTHS_2026;
  const monthData = months[currentMonthIndex];
  const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(monthData.year, monthData.month, 1).getDay();
  
  const getDayNumber = (year, month, day) => {
    const startOfPeriod = new Date(2025, 10, 1); // Nov 1, 2025
    const currentDate = new Date(year, month, day);
    const daysDiff = Math.floor((currentDate - startOfPeriod) / (1000 * 60 * 60 * 24));
    return daysDiff + 1;
  };

  const getCheckInForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkIns.find(c => c.date === dateStr);
  };

  const handleDayClick = (day) => {
    const dateStr = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingCheckIn = getCheckInForDate(monthData.year, monthData.month, day);
    
    if (existingCheckIn) {
      setCheckInData({
        mood_rating: existingCheckIn.mood_rating || 7,
        energy_level: existingCheckIn.energy_level || 7,
        emotional_weather: existingCheckIn.emotional_weather || 'sunny',
        wins_today: existingCheckIn.wins_today || [],
        gratitude: existingCheckIn.gratitude || [],
        reflection: existingCheckIn.reflection || '',
        tomorrow_intentions: existingCheckIn.tomorrow_intentions || []
      });
    } else {
      setCheckInData({
        mood_rating: 7,
        energy_level: 7,
        emotional_weather: 'sunny',
        wins_today: [],
        gratitude: [],
        reflection: '',
        tomorrow_intentions: []
      });
    }
    
    setSelectedDay({ year: monthData.year, month: monthData.month, day, dateStr });
  };

  const handleSaveCheckIn = async () => {
    if (!selectedDay) return;

    try {
      const dayNumber = getDayNumber(selectedDay.year, selectedDay.month, selectedDay.day);
      const existingCheckIn = getCheckInForDate(selectedDay.year, selectedDay.month, selectedDay.day);

      const checkInPayload = {
        date: selectedDay.dateStr,
        day_number: dayNumber,
        ...checkInData,
        is_checked_in: true,
        goals_worked_on: goals.map(g => g.id)
      };

      if (existingCheckIn) {
        await base44.entities.Year2026DailyCheckIn.update(existingCheckIn.id, checkInPayload);
      } else {
        await base44.entities.Year2026DailyCheckIn.create(checkInPayload);
      }

      for (const goal of goals) {
        const completedDays = checkIns.filter(c => c.goals_worked_on?.includes(goal.id) && c.is_checked_in).length + 1;
        const totalDays = 427;
        const progress = Math.round((completedDays / totalDays) * 100);

        await base44.entities.Year2026Goal.update(goal.id, {
          days_completed: completedDays,
          progress_percentage: progress
        });
      }

      await queryClient.invalidateQueries(['year2026CheckIns']);
      await queryClient.invalidateQueries(['year2026Goals']);
      
      toast.success('Daily check-in saved! +25 XP 🎉');
      setSelectedDay(null);
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in');
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDayOfMonth + 1;
      
      if (i < firstDayOfMonth || dayNum > daysInMonth) {
        days.push(<div key={i} className="aspect-square" />);
      } else {
        const checkIn = getCheckInForDate(monthData.year, monthData.month, dayNum);
        const isToday = monthData.year === today.getFullYear() && 
                       monthData.month === today.getMonth() && 
                       dayNum === today.getDate();
        const isCheckedIn = checkIn?.is_checked_in;

        days.push(
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDayClick(dayNum)}
            className={`aspect-square p-2 rounded-xl text-sm font-semibold transition-all relative ${
              isToday ? 'ring-2 ring-purple-500 bg-purple-50' :
              isCheckedIn ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300' :
              'bg-white border-2 border-purple-200 hover:border-purple-400'
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className={isCheckedIn ? 'text-green-800' : 'text-gray-800'}>{dayNum}</span>
              {isCheckedIn && <CheckCircle className="w-4 h-4 text-green-600 mt-1" />}
              {checkIn?.emotional_weather && (
                <div className="absolute bottom-1 right-1">
                  {React.createElement(WEATHER_ICONS[checkIn.emotional_weather], { 
                    className: "w-3 h-3 text-purple-500" 
                  })}
                </div>
              )}
            </div>
          </motion.button>
        );
      }
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else if (activeYear === '2026') {
      setActiveYear('2025');
      setCurrentMonthIndex(1); // December 2025
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else if (activeYear === '2025') {
      setActiveYear('2026');
      setCurrentMonthIndex(0); // January 2026
    }
  };

  const canGoPrev = !(activeYear === '2025' && currentMonthIndex === 0);
  const canGoNext = !(activeYear === '2026' && currentMonthIndex === MONTHS_2026.length - 1);

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center gap-4"
      >
        <Button
          onClick={() => {
            setActiveYear('2025');
            setCurrentMonthIndex(0);
          }}
          variant={activeYear === '2025' ? 'default' : 'outline'}
          className={`${
            activeYear === '2025'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
              : 'border-2 border-amber-300 hover:bg-amber-50'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          2025 Start (Nov-Dec)
        </Button>
        <Button
          onClick={() => {
            setActiveYear('2026');
            setCurrentMonthIndex(0);
          }}
          variant={activeYear === '2026' ? 'default' : 'outline'}
          className={`${
            activeYear === '2026'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'border-2 border-purple-300 hover:bg-purple-50'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          2026 Full Year
        </Button>
      </motion.div>

      {/* Calendar Card */}
      <Card className={`bg-white/90 backdrop-blur-sm border-2 shadow-xl ${
        activeYear === '2025' ? 'border-amber-300' : 'border-purple-300'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${
              activeYear === '2025' ? 'text-amber-800' : 'text-purple-800'
            }`}>
              <Calendar className="w-6 h-6" />
              {activeYear === '2025' ? '2025 Journey Start' : '2026 Transformation'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevMonth}
                disabled={!canGoPrev}
                variant="outline"
                size="sm"
                className={activeYear === '2025' ? 'border-amber-300' : 'border-purple-300'}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className={`font-bold min-w-[180px] text-center ${
                activeYear === '2025' ? 'text-amber-700' : 'text-purple-700'
              }`}>
                {monthData.name}
              </span>
              <Button
                onClick={handleNextMonth}
                disabled={!canGoNext}
                variant="outline"
                size="sm"
                className={activeYear === '2025' ? 'border-amber-300' : 'border-purple-300'}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>

          {/* Month Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl border-2 ${
              activeYear === '2025' 
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
            }`}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${
                  activeYear === '2025' ? 'text-amber-700' : 'text-purple-700'
                }`}>
                  {checkIns.filter(c => {
                    const d = new Date(c.date);
                    return d.getFullYear() === monthData.year && 
                           d.getMonth() === monthData.month && 
                           c.is_checked_in;
                  }).length}
                </div>
                <div className="text-xs text-gray-600">Days Checked</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  activeYear === '2025' ? 'text-amber-700' : 'text-purple-700'
                }`}>
                  {daysInMonth}
                </div>
                <div className="text-xs text-gray-600">Total Days</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  activeYear === '2025' ? 'text-amber-700' : 'text-purple-700'
                }`}>
                  {Math.round((checkIns.filter(c => {
                    const d = new Date(c.date);
                    return d.getFullYear() === monthData.year && 
                           d.getMonth() === monthData.month && 
                           c.is_checked_in;
                  }).length / daysInMonth) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Completion</div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Daily Check-In: {selectedDay?.dateStr}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mood & Energy */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block font-semibold">Mood (1-10)</Label>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      onClick={() => setCheckInData(prev => ({ ...prev, mood_rating: n }))}
                      className={`flex-1 h-10 rounded-lg font-bold transition-all ${
                        checkInData.mood_rating === n
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Energy (1-10)</Label>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      onClick={() => setCheckInData(prev => ({ ...prev, energy_level: n }))}
                      className={`flex-1 h-10 rounded-lg font-bold transition-all ${
                        checkInData.energy_level === n
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white scale-110'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emotional Weather */}
            <div>
              <Label className="mb-2 block font-semibold">Emotional Weather</Label>
              <div className="flex gap-2">
                {Object.entries(WEATHER_ICONS).map(([key, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setCheckInData(prev => ({ ...prev, emotional_weather: key }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      checkInData.emotional_weather === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto text-purple-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection */}
            <div>
              <Label className="mb-2 block font-semibold">Daily Reflection</Label>
              <Textarea
                value={checkInData.reflection}
                onChange={(e) => setCheckInData(prev => ({ ...prev, reflection: e.target.value }))}
                placeholder="How was your day? What did you learn?"
                rows={4}
                className="border-2 border-purple-300"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setSelectedDay(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveCheckIn} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                Save Check-In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}