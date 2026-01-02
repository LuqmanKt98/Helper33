import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Zap, Coffee, Cloud, AlertCircle, Clock, Calendar } from 'lucide-react';

const challenges = ["Decision fatigue", "Hard transitions", "Overwhelm", "Perfectionism", "Sensory overload"];

const shiftTypes = [
  { value: "regular_8", label: "Regular 8-hour shift (9-5 or similar)" },
  { value: "extended_10", label: "10-hour shift" },
  { value: "long_12", label: "12-hour shift (e.g., 6am-6pm, 7am-7pm)" },
  { value: "night_shift", label: "Night shift (any duration)" },
  { value: "rotating", label: "Rotating shifts (days/nights)" },
  { value: "split_shift", label: "Split shift (morning + evening)" },
  { value: "on_call", label: "On-call schedule" }
];

const daysOffPatterns = [
  { value: "weekends", label: "Regular weekends off" },
  { value: "2_days", label: "2 days off per week (not weekends)" },
  { value: "3_days", label: "3+ days off per week" },
  { value: "rotating_days", label: "Rotating days off" },
  { value: "irregular", label: "Irregular schedule" }
];

export default function OnboardingQuiz({ onComplete }) {
    const [quiz, setQuiz] = useState({
        workStyle: '',
        shiftType: '',
        daysOffPattern: '',
        weekdayEnergy: 'medium',
        challenge: [],
        reminderStyle: 'gentle',
        familySync: false,
    });
    const [showValidation, setShowValidation] = useState(false);

    const handleChallengeToggle = (value) => {
        setQuiz(prev => {
            const currentChallenges = prev.challenge;
            if (currentChallenges.includes(value)) {
                return { ...prev, challenge: currentChallenges.filter(c => c !== value) };
            }
            if (currentChallenges.length < 2) {
                return { ...prev, challenge: [...currentChallenges, value] };
            }
            return prev;
        });
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!quiz.workStyle) {
            setShowValidation(true);
            return;
        }
        
        // If fixed schedule, require shift type
        if (quiz.workStyle === 'anchor' && !quiz.shiftType) {
            setShowValidation(true);
            return;
        }
        
        setShowValidation(false);
        onComplete(quiz);
    };

    const isFormValid = quiz.workStyle && (quiz.workStyle === 'flex' || quiz.shiftType);

    return (
        <div className="fixed inset-0 bg-[#F7F6F3]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-[1.25rem] shadow-xl border border-gray-200 p-8 overflow-y-auto max-h-[90vh]"
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">Quick Personalization</h2>
                    <p className="text-gray-500">Tailor your planner in 60 seconds to get a plan that works for YOU.</p>
                    {showValidation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-semibold">Please complete required fields</p>
                                <p>Select your work style{quiz.workStyle === 'anchor' && ' and shift type'}.</p>
                            </div>
                        </motion.div>
                    )}
                </div>
                
                <div className="space-y-6">
                    {/* Work Style - REQUIRED */}
                    <div>
                        <Label className="text-base font-semibold text-[#2E2E2E] mb-3 block">
                            How do you work most days? <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup value={quiz.workStyle} onValueChange={(value) => setQuiz(p => ({ ...p, workStyle: value, shiftType: '', daysOffPattern: '' }))}>
                            <div className={`flex items-center space-x-2 p-4 border rounded-[1.25rem] transition-all cursor-pointer ${quiz.workStyle === 'flex' ? 'bg-[#7AAE9E]/10 border-[#7AAE9E]' : showValidation && !quiz.workStyle ? 'border-red-300' : 'hover:border-gray-300'}`}>
                                <RadioGroupItem value="flex" id="flex" />
                                <Label htmlFor="flex" className="text-base flex-1 cursor-pointer">🌈 Flexible / Self‑employed / Creative</Label>
                            </div>
                            <div className={`flex items-center space-x-2 p-4 border rounded-[1.25rem] transition-all cursor-pointer ${quiz.workStyle === 'anchor' ? 'bg-[#7AAE9E]/10 border-[#7AAE9E]' : showValidation && !quiz.workStyle ? 'border-red-300' : 'hover:border-gray-300'}`}>
                                <RadioGroupItem value="anchor" id="anchor" />
                                <Label htmlFor="anchor" className="text-base flex-1 cursor-pointer">🕘 Fixed schedule (healthcare, office, caregiving)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Shift Type - Shows only if anchor selected */}
                    {quiz.workStyle === 'anchor' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Label className="text-base font-semibold text-[#2E2E2E] mb-3 block flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#7AAE9E]" />
                                What's your typical shift? <span className="text-red-500">*</span>
                            </Label>
                            <Select value={quiz.shiftType} onValueChange={(value) => setQuiz(p => ({ ...p, shiftType: value }))}>
                                <SelectTrigger className={`rounded-[1.25rem] ${showValidation && !quiz.shiftType ? 'border-red-300' : ''}`}>
                                    <SelectValue placeholder="Select your shift type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftTypes.map((shift) => (
                                        <SelectItem key={shift.value} value={shift.value}>
                                            {shift.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">
                                This helps us suggest activities that fit your work hours
                            </p>
                        </motion.div>
                    )}

                    {/* Days Off Pattern - Shows only if anchor selected */}
                    {quiz.workStyle === 'anchor' && quiz.shiftType && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Label className="text-base font-semibold text-[#2E2E2E] mb-3 block flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#7AAE9E]" />
                                Days off pattern (optional)
                            </Label>
                            <Select value={quiz.daysOffPattern} onValueChange={(value) => setQuiz(p => ({ ...p, daysOffPattern: value }))}>
                                <SelectTrigger className="rounded-[1.25rem]">
                                    <SelectValue placeholder="Select your days off pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daysOffPatterns.map((pattern) => (
                                        <SelectItem key={pattern.value} value={pattern.value}>
                                            {pattern.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">
                                Helps plan for recovery and recharge time
                            </p>
                        </motion.div>
                    )}

                    {/* Weekday Energy */}
                    <div>
                        <Label className="text-base font-semibold text-[#2E2E2E] mb-3 block">
                            Typical {quiz.workStyle === 'anchor' ? 'post-shift' : 'weekday'} energy
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((energy) => (
                                <Button
                                    key={energy}
                                    type="button"
                                    variant={quiz.weekdayEnergy === energy ? 'default' : 'outline'}
                                    onClick={() => setQuiz(p => ({ ...p, weekdayEnergy: energy }))}
                                    className={`py-4 h-auto flex-col gap-2 rounded-[1.25rem] transition-all ${
                                        quiz.weekdayEnergy === energy 
                                        ? 'bg-[#B9A7D1]/20 border-[#B9A7D1] text-[#2E2E2E] hover:bg-[#B9A7D1]/30' 
                                        : 'bg-transparent text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {energy === 'low' && <Cloud className="h-5 w-5"/>}
                                    {energy === 'medium' && <Coffee className="h-5 w-5"/>}
                                    {energy === 'high' && <Zap className="h-5 w-5"/>}
                                    {energy.charAt(0).toUpperCase() + energy.slice(1)}
                                </Button>
                            ))}
                        </div>
                        {quiz.workStyle === 'anchor' && (
                            <p className="text-xs text-gray-500 mt-2">
                                How do you typically feel after work?
                            </p>
                        )}
                    </div>

                    {/* Biggest Challenge */}
                    <div>
                        <Label className="text-base font-semibold text-[#2E2E2E] mb-3 block">Biggest challenge (pick up to 2)</Label>
                        <div className="flex flex-wrap gap-2">
                            {challenges.map(c => (
                                <Button 
                                    key={c}
                                    type="button"
                                    variant={quiz.challenge.includes(c) ? 'default' : 'outline'}
                                    onClick={() => handleChallengeToggle(c)}
                                    className={`rounded-full ${quiz.challenge.includes(c) ? 'bg-[#E9D4A7] text-[#2E2E2E] hover:bg-[#E9D4A7]/90' : 'text-gray-700'}`}
                                >
                                    {c}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Reminder Style */}
                    <div>
                        <Label htmlFor="reminders" className="text-base font-semibold text-[#2E2E2E] mb-3 block">Reminder style</Label>
                        <Select value={quiz.reminderStyle} onValueChange={(value) => setQuiz(p => ({ ...p, reminderStyle: value }))}>
                            <SelectTrigger id="reminders" className="rounded-[1.25rem]">
                                <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gentle">Gentle nudges</SelectItem>
                                <SelectItem value="playful">Playful coach</SelectItem>
                                <SelectItem value="off">Minimal / silent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Family Sync */}
                    <div className="flex items-center justify-between p-4 border rounded-[1.25rem]">
                        <Label htmlFor="family-sync" className="text-base font-semibold text-[#2E2E2E] cursor-pointer">Sync with Family Hub (optional)</Label>
                        <Switch id="family-sync" checked={quiz.familySync} onCheckedChange={(checked) => setQuiz(p => ({ ...p, familySync: checked }))} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!isFormValid}
                        className={`rounded-xl ${isFormValid ? 'bg-[#7AAE9E] hover:bg-[#7AAE9E]/90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Save & Create My Plan
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}