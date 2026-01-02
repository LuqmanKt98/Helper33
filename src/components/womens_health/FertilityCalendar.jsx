import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flower2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from 'date-fns';

export default function FertilityCalendar({ cycles, symptoms, cycleInfo }) {
  const currentCycle = cycles.find(c => c.is_current_cycle);
  
  if (!currentCycle) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-12 text-center">
          <Flower2 className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Tracking Your Cycle</h3>
          <p className="text-gray-600">
            Log your period to see your fertile window and ovulation predictions
          </p>
        </CardContent>
      </Card>
    );
  }

  const cycleStart = parseISO(currentCycle.cycle_start_date);
  const today = startOfDay(new Date());
  
  // Generate next 35 days for better visibility
  const next35Days = Array.from({ length: 35 }).map((_, i) => {
    const date = addDays(today, i);
    const cycleDay = differenceInDays(date, cycleStart) + 1;
    
    // Determine fertility status based on cycle day
    let status = 'low';
    let statusLabel = 'Low Fertility';
    let statusColor = 'from-gray-100 to-gray-200';
    let statusBorder = 'border-gray-300';
    let fertilityScore = 0; // 0-10 scale
    
    // Period days (low fertility)
    if (cycleDay >= 1 && cycleDay <= (currentCycle.period_length_days || 5)) {
      status = 'period';
      statusLabel = '🩸 Period';
      statusColor = 'from-red-200 to-pink-200';
      statusBorder = 'border-red-400';
      fertilityScore = 0;
    }
    // Pre-fertile (approaching fertile window)
    else if (cycleDay >= 8 && cycleDay < 10) {
      status = 'pre_fertile';
      statusLabel = 'Pre-Fertile';
      statusColor = 'from-orange-100 to-yellow-100';
      statusBorder = 'border-orange-300';
      fertilityScore = 3;
    }
    // Fertile window start (high fertility)
    else if (cycleDay >= 10 && cycleDay < 12) {
      status = 'fertile';
      statusLabel = '🌸 High Fertility';
      statusColor = 'from-green-200 to-emerald-200';
      statusBorder = 'border-green-400';
      fertilityScore = 7;
    }
    // Peak fertility (2-3 days before ovulation)
    else if (cycleDay >= 12 && cycleDay <= 14) {
      status = 'peak';
      statusLabel = '💐 Peak Fertility';
      statusColor = 'from-pink-300 to-rose-300';
      statusBorder = 'border-pink-500';
      fertilityScore = 10;
    }
    // Ovulation day
    else if (cycleDay === 15) {
      status = 'ovulation';
      statusLabel = '🌺 Ovulation Day';
      statusColor = 'from-rose-300 to-pink-400';
      statusBorder = 'border-rose-500';
      fertilityScore = 9;
    }
    // Post-ovulation (still some fertility)
    else if (cycleDay > 15 && cycleDay <= 17) {
      status = 'post_fertile';
      statusLabel = 'Post-Fertile';
      statusColor = 'from-orange-100 to-amber-100';
      statusBorder = 'border-orange-300';
      fertilityScore = 4;
    }
    // Luteal phase (low fertility)
    else if (cycleDay > 17 && cycleDay <= (currentCycle.cycle_length_days || cycleInfo.avgCycleLength)) {
      status = 'luteal';
      statusLabel = 'Luteal Phase';
      statusColor = 'from-purple-100 to-indigo-100';
      statusBorder = 'border-purple-300';
      fertilityScore = 1;
    }

    // Check if this is a predicted or actual ovulation day
    const isActualOvulation = currentCycle.ovulation_date && 
                             isSameDay(date, parseISO(currentCycle.ovulation_date));
    const isPredictedOvulation = currentCycle.predicted_ovulation_date && 
                                isSameDay(date, parseISO(currentCycle.predicted_ovulation_date));

    if (isActualOvulation) {
      status = 'ovulation';
      statusLabel = '🌺 Ovulation (Confirmed)';
      statusColor = 'from-rose-400 to-pink-500';
      statusBorder = 'border-rose-600';
      fertilityScore = 10;
    } else if (isPredictedOvulation && !isActualOvulation) {
      statusLabel = '🌸 Predicted Ovulation';
    }

    return { date, cycleDay, status, statusLabel, statusColor, statusBorder, fertilityScore };
  });

  // Calculate peak fertile days
  const peakDays = next35Days.filter(d => d.fertilityScore >= 8).length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Flower2 className="w-6 h-6 text-pink-500" />
          35-Day Fertility Forecast
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-pink-100 text-pink-800">
            {peakDays} peak fertility days ahead
          </Badge>
          <Badge variant="outline">
            Cycle Day {cycleInfo.cycleDay}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fertility Score Legend */}
        <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-1" />
            <p className="text-xs font-semibold text-gray-600">Low</p>
          </div>
          <div className="text-center">
            <div className="w-full h-3 bg-gradient-to-r from-orange-200 to-yellow-200 rounded mb-1" />
            <p className="text-xs font-semibold text-gray-600">Medium</p>
          </div>
          <div className="text-center">
            <div className="w-full h-3 bg-gradient-to-r from-green-300 to-emerald-300 rounded mb-1" />
            <p className="text-xs font-semibold text-gray-600">High</p>
          </div>
          <div className="text-center">
            <div className="w-full h-3 bg-gradient-to-r from-pink-300 to-rose-400 rounded mb-1" />
            <p className="text-xs font-semibold text-gray-600">Peak</p>
          </div>
          <div className="text-center">
            <div className="w-full h-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded mb-1" />
            <p className="text-xs font-semibold text-gray-600">Ovulation</p>
          </div>
        </div>

        {/* Scrollable Day List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {next35Days.map((day, idx) => (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`
                p-4 rounded-xl bg-gradient-to-r ${day.statusColor} border-2 ${day.statusBorder}
                ${day.status === 'ovulation' || day.status === 'peak' ? 'shadow-lg' : 'shadow-md'}
                ${isSameDay(day.date, today) ? 'ring-4 ring-purple-400 ring-offset-2' : ''}
                hover:scale-[1.02] transition-all
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    {format(day.date, 'EEE, MMM d')}
                    {isSameDay(day.date, today) && (
                      <Badge className="bg-purple-500 text-white text-xs">TODAY</Badge>
                    )}
                  </p>
                  <p className="text-xs text-gray-600">Cycle Day {day.cycleDay}</p>
                  
                  {/* Fertility Score Bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          day.fertilityScore >= 8 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                          day.fertilityScore >= 6 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          day.fertilityScore >= 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${day.fertilityScore * 10}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {day.fertilityScore}/10
                    </span>
                  </div>
                </div>
                <Badge className={
                  day.status === 'ovulation' || day.status === 'peak' ? 'bg-rose-500 text-white text-sm' :
                  day.status === 'fertile' ? 'bg-green-500 text-white text-sm' :
                  day.status === 'pre_fertile' || day.status === 'post_fertile' ? 'bg-orange-400 text-white text-sm' :
                  day.status === 'period' ? 'bg-red-500 text-white text-sm' :
                  'bg-gray-400 text-white text-sm'
                }>
                  {day.statusLabel}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-2">🌸 About Your Fertile Window</p>
              <p className="text-xs leading-relaxed">
                Your fertile window is typically <strong>6 days</strong>: the 5 days before ovulation and ovulation day itself. 
                The <strong>2-3 days before ovulation</strong> are when you're most fertile. 
                Sperm can survive up to 5 days, but the egg only survives 12-24 hours after release.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}