import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flower2, Calendar, Droplets, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

export default function OvulationTracker({ cycles, symptoms, cycleInfo }) {
  const currentCycle = cycles.find(c => c.is_current_cycle);
  const today = new Date();

  // Calculate ovulation prediction with confidence scoring
  const getOvulationPrediction = () => {
    if (!currentCycle) {
      return {
        predicted: null,
        fertileStart: null,
        fertileEnd: null,
        confidence: 'low',
        signs: []
      };
    }

    const cycleStart = parseISO(currentCycle.cycle_start_date);
    
    // Use detected ovulation if available, otherwise predict
    let predictedOvulation;
    if (currentCycle.ovulation_date) {
      predictedOvulation = parseISO(currentCycle.ovulation_date);
    } else if (currentCycle.predicted_ovulation_date) {
      predictedOvulation = parseISO(currentCycle.predicted_ovulation_date);
    } else {
      predictedOvulation = addDays(cycleStart, 14);
    }

    // Fertile window: 5 days before ovulation + ovulation day
    const fertileStart = currentCycle.fertile_window_start 
      ? parseISO(currentCycle.fertile_window_start)
      : addDays(predictedOvulation, -5);
    const fertileEnd = currentCycle.fertile_window_end
      ? parseISO(currentCycle.fertile_window_end)
      : predictedOvulation;

    // Check for ovulation signs in symptoms
    const ovulationSigns = symptoms.filter(s => {
      const logDate = parseISO(s.log_date);
      const daysDiff = differenceInDays(logDate, cycleStart);
      // Look for signs around day 12-16 of cycle
      return daysDiff >= 12 && daysDiff <= 16 &&
             (s.cervical_mucus === 'egg_white' || 
              (s.basal_body_temp && s.basal_body_temp > 97.8) ||
              s.physical_symptoms?.includes('ovulation_pain'));
    });

    // Calculate confidence based on available data
    let confidence = 'low';
    if (currentCycle.ovulation_date) {
      confidence = 'confirmed'; // User detected it
    } else if (ovulationSigns.length >= 3) {
      confidence = 'high'; // Multiple signs
    } else if (ovulationSigns.length >= 1) {
      confidence = 'medium'; // Some signs
    } else if (cycles.length >= 3) {
      // Calculate average ovulation day from past cycles
      const pastOvulations = cycles
        .filter(c => c.ovulation_date && c.cycle_start_date)
        .map(c => differenceInDays(parseISO(c.ovulation_date), parseISO(c.cycle_start_date)));
      
      if (pastOvulations.length >= 2) {
        const avgOvulationDay = Math.round(
          pastOvulations.reduce((sum, day) => sum + day, 0) / pastOvulations.length
        );
        predictedOvulation = addDays(cycleStart, avgOvulationDay);
        confidence = 'medium'; // Based on personal history
      }
    }

    return {
      predicted: predictedOvulation,
      fertileStart,
      fertileEnd,
      confidence,
      signs: ovulationSigns,
      isDetected: !!currentCycle.ovulation_date
    };
  };

  const ovulationInfo = getOvulationPrediction();

  const isInFertileWindow = ovulationInfo.fertileStart && ovulationInfo.fertileEnd &&
                            today >= ovulationInfo.fertileStart && today <= ovulationInfo.fertileEnd;

  const daysUntilOvulation = ovulationInfo.predicted 
    ? differenceInDays(ovulationInfo.predicted, today)
    : null;

  const confidenceColors = {
    confirmed: 'bg-green-500 text-white',
    high: 'bg-emerald-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-gray-500 text-white'
  };

  const confidenceLabels = {
    confirmed: 'Confirmed',
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Predicted'
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Flower2 className="w-6 h-6 text-pink-500" />
          Ovulation & Fertility Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fertile Window Alert */}
        {isInFertileWindow && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl border-2 border-pink-300 shadow-lg"
          >
            <div className="text-center">
              <Flower2 className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-pink-900 mb-2">
                🌸 You're in Your Fertile Window!
              </h3>
              <p className="text-pink-800">
                This is your most fertile time of the month - Days {differenceInDays(today, parseISO(currentCycle.cycle_start_date))} of your cycle
              </p>
            </div>
          </motion.div>
        )}

        {/* Ovulation Prediction */}
        {ovulationInfo.predicted && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  {ovulationInfo.isDetected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Detected Ovulation
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      Predicted Ovulation
                    </>
                  )}
                </p>
                <p className="text-2xl font-bold text-pink-700">
                  {format(ovulationInfo.predicted, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                {daysUntilOvulation !== null && (
                  <p className="text-sm text-gray-600 mb-2">
                    {daysUntilOvulation > 0 ? `In ${daysUntilOvulation} days` :
                     daysUntilOvulation === 0 ? 'Today! 🌸' :
                     `${Math.abs(daysUntilOvulation)} days ago`}
                  </p>
                )}
                <Badge className={confidenceColors[ovulationInfo.confidence]}>
                  {confidenceLabels[ovulationInfo.confidence]}
                </Badge>
              </div>
            </div>

            {/* Fertile Window Dates */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Your Fertile Window</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Starts</p>
                  <p className="font-bold text-green-700">
                    {format(ovulationInfo.fertileStart, 'MMM d')}
                  </p>
                  <p className="text-xs text-gray-500">
                    (Cycle Day {differenceInDays(ovulationInfo.fertileStart, parseISO(currentCycle.cycle_start_date)) + 1})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ends</p>
                  <p className="font-bold text-green-700">
                    {format(ovulationInfo.fertileEnd, 'MMM d')}
                  </p>
                  <p className="text-xs text-gray-500">
                    (Cycle Day {differenceInDays(ovulationInfo.fertileEnd, parseISO(currentCycle.cycle_start_date)) + 1})
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-800 mt-3 bg-white/50 rounded-lg p-2">
                💚 Peak fertility is typically 2-3 days before ovulation
              </p>
            </div>

            {/* Ovulation Signs Detected */}
            {ovulationInfo.signs.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Ovulation Signs Detected ({ovulationInfo.signs.length})
                </h4>
                <div className="space-y-2">
                  {ovulationInfo.signs.map((sign, idx) => (
                    <div key={idx} className="text-sm bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {format(parseISO(sign.log_date), 'MMM d')} (Day {sign.cycle_day})
                        </span>
                        <div className="flex gap-2">
                          {sign.cervical_mucus === 'egg_white' && (
                            <Badge className="bg-pink-100 text-pink-800 text-xs">Egg White CM</Badge>
                          )}
                          {sign.basal_body_temp > 97.8 && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">Temp Rise</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ovulation Signs to Track */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Track These Ovulation Signs
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg">🌡️</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Basal Body Temperature</p>
                <p className="text-gray-600 text-xs">Small rise (0.5-1°F) indicates ovulation occurred</p>
                <p className="text-blue-700 text-xs font-semibold mt-1">
                  ✓ Log daily in symptom tracker
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg">💧</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Cervical Mucus</p>
                <p className="text-gray-600 text-xs">Clear, stretchy "egg white" consistency = most fertile</p>
                <p className="text-blue-700 text-xs font-semibold mt-1">
                  ✓ Check daily and log in symptom tracker
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-lg">⚡</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Increased Energy & Libido</p>
                <p className="text-gray-600 text-xs">Natural surge in energy and sex drive</p>
                <p className="text-blue-700 text-xs font-semibold mt-1">
                  ✓ Note in daily mood tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Accuracy Info */}
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-2">💜 Improving Prediction Accuracy</p>
              <ul className="space-y-1 text-xs">
                <li>• Track BBT every morning before getting out of bed</li>
                <li>• Log cervical mucus daily</li>
                <li>• Note any ovulation pain or breast tenderness</li>
                <li>• Use ovulation test strips for confirmation</li>
                <li>• The more cycles you track, the more accurate predictions become</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cycle Statistics */}
        {cycles.length >= 3 && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📊 Your Ovulation Patterns</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Cycles Tracked</p>
                <p className="text-xl font-bold text-blue-700">{cycles.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Avg Cycle Length</p>
                <p className="text-xl font-bold text-blue-700">{cycleInfo.avgCycleLength} days</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}