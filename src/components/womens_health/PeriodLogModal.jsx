import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

export default function PeriodLogModal({ isOpen, onClose, avgCycleLength = 28, editingCycle = null }) {
  const queryClient = useQueryClient();
  const [periodStartDate, setPeriodStartDate] = useState(editingCycle?.cycle_start_date ? new Date(editingCycle.cycle_start_date) : new Date());
  const [periodLength, setPeriodLength] = useState(editingCycle?.period_length_days || 5);
  const [flowIntensity, setFlowIntensity] = useState(editingCycle?.flow_intensity || 'medium');
  const [ovulationDetected, setOvulationDetected] = useState(editingCycle?.ovulation_detected || false);
  const [ovulationDate, setOvulationDate] = useState(editingCycle?.ovulation_date ? new Date(editingCycle.ovulation_date) : null);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      if (editingCycle) {
        setPeriodStartDate(new Date(editingCycle.cycle_start_date));
        setPeriodLength(editingCycle.period_length_days || 5);
        setFlowIntensity(editingCycle.flow_intensity || 'medium');
        setOvulationDetected(editingCycle.ovulation_detected || false);
        setOvulationDate(editingCycle.ovulation_date ? new Date(editingCycle.ovulation_date) : null);
      } else {
        setPeriodStartDate(new Date());
        setPeriodLength(5);
        setFlowIntensity('medium');
        setOvulationDetected(false);
        setOvulationDate(null);
      }
    }
  }, [isOpen, editingCycle]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // First, mark all cycles as not current
      const allCycles = await base44.entities.MenstrualCycle.list();
      await Promise.all(
        allCycles
          .filter(c => c.is_current_cycle && (!editingCycle || c.id !== editingCycle.id))
          .map(c => base44.entities.MenstrualCycle.update(c.id, { is_current_cycle: false }))
      );

      // Calculate predictions
      const periodStart = new Date(data.cycle_start_date);
      const periodEnd = addDays(periodStart, data.period_length_days - 1);
      
      // Ovulation prediction (typically day 14 of cycle)
      const predictedOvulation = addDays(periodStart, 14);
      
      // Fertile window (5 days before ovulation + ovulation day)
      const fertileWindowStart = addDays(predictedOvulation, -5);
      const fertileWindowEnd = predictedOvulation;
      
      // Predicted next period (using average cycle length)
      const predictedNextPeriod = addDays(periodStart, data.predicted_cycle_length || avgCycleLength);

      const cycleData = {
        ...data,
        cycle_end_date: null, // Will be set when next period starts
        predicted_ovulation_date: data.ovulation_date || predictedOvulation.toISOString().split('T')[0],
        fertile_window_start: fertileWindowStart.toISOString().split('T')[0],
        fertile_window_end: fertileWindowEnd.toISOString().split('T')[0],
        predicted_next_period: predictedNextPeriod.toISOString().split('T')[0],
        is_current_cycle: true
      };

      if (editingCycle) {
        return await base44.entities.MenstrualCycle.update(editingCycle.id, cycleData);
      } else {
        return await base44.entities.MenstrualCycle.create(cycleData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['menstrual-cycles']);
      queryClient.invalidateQueries(['cycle-symptoms']);
      toast.success(editingCycle ? 'Period updated!' : 'Period logged successfully!');
      onClose();
    },
    onError: (error) => {
      console.error('Error saving period:', error);
      toast.error('Failed to save period. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      cycle_start_date: periodStartDate.toISOString().split('T')[0],
      period_length_days: parseInt(periodLength),
      flow_intensity: flowIntensity,
      ovulation_detected: ovulationDetected,
      ovulation_date: ovulationDetected && ovulationDate ? ovulationDate.toISOString().split('T')[0] : null,
      predicted_cycle_length: avgCycleLength,
      cycle_notes: ''
    };

    saveMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {editingCycle ? 'Edit Period Log' : 'Log Your Period'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Start Date */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">First Day of Period</Label>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border-2 border-pink-200">
              <Calendar
                mode="single"
                selected={periodStartDate}
                onSelect={setPeriodStartDate}
                className="rounded-md border-0 mx-auto"
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>

          {/* Period Length */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Period Duration (Days)</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #EC4899 0%, #F472B6 ${periodLength * 10}%, #e5e7eb ${periodLength * 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-bold text-pink-600">{periodLength}</span>
                <span className="text-sm text-gray-600 block">days</span>
              </div>
            </div>
          </div>

          {/* Flow Intensity */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Flow Intensity</Label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'spotting', label: 'Spotting', color: 'from-pink-200 to-pink-300' },
                { value: 'light', label: 'Light', color: 'from-pink-300 to-pink-400' },
                { value: 'medium', label: 'Medium', color: 'from-red-400 to-pink-500' },
                { value: 'heavy', label: 'Heavy', color: 'from-red-500 to-red-600' },
                { value: 'very_heavy', label: 'Very Heavy', color: 'from-red-600 to-red-700' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFlowIntensity(option.value)}
                  className={`
                    p-3 rounded-xl text-sm font-semibold transition-all
                    ${flowIntensity === option.value
                      ? `bg-gradient-to-br ${option.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ovulation Tracking */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ovulation"
                checked={ovulationDetected}
                onChange={(e) => setOvulationDetected(e.target.checked)}
                className="w-5 h-5 text-pink-600 rounded"
              />
              <Label htmlFor="ovulation" className="text-base font-semibold cursor-pointer">
                Did you detect ovulation this cycle?
              </Label>
            </div>

            {ovulationDetected && (
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 border-2 border-rose-200">
                <Label className="text-sm font-medium mb-2 block">Ovulation Date</Label>
                <Calendar
                  mode="single"
                  selected={ovulationDate}
                  onSelect={setOvulationDate}
                  className="rounded-md border-0 mx-auto"
                  disabled={(date) => date > new Date() || date < periodStartDate}
                />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>💡 Prediction Preview:</strong> Based on your {avgCycleLength}-day average cycle, 
              your next period is predicted for <strong>{addDays(periodStartDate, avgCycleLength).toLocaleDateString()}</strong> and 
              ovulation around <strong>{addDays(periodStartDate, 14).toLocaleDateString()}</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              {saveMutation.isPending ? 'Saving...' : editingCycle ? 'Update Period' : 'Log Period'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}