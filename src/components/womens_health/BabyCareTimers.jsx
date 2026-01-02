import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, Bell, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BabyCareTimers({ babyName = 'Baby' }) {
  const [feedingTimer, setFeedingTimer] = useState({ isRunning: false, seconds: 0, startTime: null });
  const [nextFeedTimer, setNextFeedTimer] = useState({ targetTime: null, countdown: null });
  const [nextDiaperTimer, setNextDiaperTimer] = useState({ targetTime: null, countdown: null });

  // Feeding timer
  useEffect(() => {
    let interval;
    if (feedingTimer.isRunning) {
      interval = setInterval(() => {
        setFeedingTimer(prev => ({
          ...prev,
          seconds: prev.seconds + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [feedingTimer.isRunning]);

  // Next feed countdown
  useEffect(() => {
    let interval;
    if (nextFeedTimer.targetTime) {
      interval = setInterval(() => {
        const now = new Date();
        const target = new Date(nextFeedTimer.targetTime);
        const diff = Math.floor((target - now) / 1000);
        
        if (diff <= 0) {
          toast.success(`⏰ Time to feed ${babyName}!`, {
            duration: 10000,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          });
          setNextFeedTimer({ targetTime: null, countdown: null });
        } else {
          setNextFeedTimer(prev => ({ ...prev, countdown: diff }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [nextFeedTimer.targetTime, babyName]);

  // Next diaper countdown
  useEffect(() => {
    let interval;
    if (nextDiaperTimer.targetTime) {
      interval = setInterval(() => {
        const now = new Date();
        const target = new Date(nextDiaperTimer.targetTime);
        const diff = Math.floor((target - now) / 1000);
        
        if (diff <= 0) {
          toast.success(`⏰ Time to check ${babyName}'s diaper!`, {
            duration: 10000,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          });
          setNextDiaperTimer({ targetTime: null, countdown: null });
        } else {
          setNextDiaperTimer(prev => ({ ...prev, countdown: diff }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [nextDiaperTimer.targetTime, babyName]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds) => {
    if (!seconds) return '--:--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAmPm = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const startFeedingTimer = () => {
    setFeedingTimer({
      isRunning: true,
      seconds: 0,
      startTime: new Date()
    });
    toast.success('🍼 Feeding timer started');
  };

  const pauseFeedingTimer = () => {
    setFeedingTimer(prev => ({ ...prev, isRunning: false }));
  };

  const stopFeedingTimer = () => {
    const duration = Math.floor(feedingTimer.seconds / 60);
    toast.success(`✅ Feeding complete! Duration: ${duration} minutes`);
    setFeedingTimer({ isRunning: false, seconds: 0, startTime: null });
  };

  const resetFeedingTimer = () => {
    setFeedingTimer({ isRunning: false, seconds: 0, startTime: null });
  };

  const setNextFeedReminder = (hours) => {
    const target = new Date();
    target.setHours(target.getHours() + hours);
    setNextFeedTimer({ targetTime: target, countdown: hours * 3600 });
    toast.success(`⏰ Feed reminder set for ${hours} hours from now`);
  };

  const setNextDiaperReminder = (hours) => {
    const target = new Date();
    target.setHours(target.getHours() + hours);
    setNextDiaperTimer({ targetTime: target, countdown: hours * 3600 });
    toast.success(`⏰ Diaper check reminder set for ${hours} hours from now`);
  };

  return (
    <div className="space-y-6">
      {/* Feeding Timer */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-600" />
            Feeding Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <motion.div
              animate={feedingTimer.isRunning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: feedingTimer.isRunning ? Infinity : 0 }}
              className="text-6xl font-bold text-blue-700 mb-4"
            >
              {formatTime(feedingTimer.seconds)}
            </motion.div>
            {feedingTimer.startTime && (
              <p className="text-sm text-gray-600 mb-4">
                Started at {formatTimeAmPm(feedingTimer.startTime)}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {!feedingTimer.isRunning && feedingTimer.seconds === 0 && (
              <Button
                onClick={startFeedingTimer}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Feeding
              </Button>
            )}

            {feedingTimer.isRunning && (
              <>
                <Button
                  onClick={pauseFeedingTimer}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={stopFeedingTimer}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Complete
                </Button>
              </>
            )}

            {!feedingTimer.isRunning && feedingTimer.seconds > 0 && (
              <>
                <Button
                  onClick={() => setFeedingTimer(prev => ({ ...prev, isRunning: true }))}
                  variant="outline"
                  className="flex-1"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={stopFeedingTimer}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Complete
                </Button>
                <Button
                  onClick={resetFeedingTimer}
                  variant="outline"
                  size="icon"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Feed Reminder */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Next Feeding Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextFeedTimer.targetTime ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-green-700 mb-2">
                {formatCountdown(nextFeedTimer.countdown)}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Feed at {formatTimeAmPm(new Date(nextFeedTimer.targetTime))}
              </p>
              <Button
                onClick={() => setNextFeedTimer({ targetTime: null, countdown: null })}
                variant="outline"
                size="sm"
              >
                Cancel Reminder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 6].map(hours => (
                <Button
                  key={hours}
                  onClick={() => setNextFeedReminder(hours)}
                  variant="outline"
                  className="flex-1"
                >
                  {hours}h
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Diaper Reminder */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Diaper Check Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextDiaperTimer.targetTime ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-700 mb-2">
                {formatCountdown(nextDiaperTimer.countdown)}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Check at {formatTimeAmPm(new Date(nextDiaperTimer.targetTime))}
              </p>
              <Button
                onClick={() => setNextDiaperTimer({ targetTime: null, countdown: null })}
                variant="outline"
                size="sm"
              >
                Cancel Reminder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(hours => (
                <Button
                  key={hours}
                  onClick={() => setNextDiaperReminder(hours)}
                  variant="outline"
                  className="flex-1"
                >
                  {hours}h
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-3">⏰ Timer Tips</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Newborns:</strong> Feed every 2-3 hours (8-12 times/day)</li>
            <li>• <strong>Diapers:</strong> Check every 2-3 hours or after feeding</li>
            <li>• <strong>Sleep tracking:</strong> Use the Care Tracker tab</li>
            <li>• <strong>Reminders:</strong> Browser notifications will alert you</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}