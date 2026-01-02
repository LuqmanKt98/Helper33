import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Music, Play, Pause, Trash2, Save, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const INSTRUMENTS = {
  drum: { emoji: '🥁', sound: 'drum', color: 'from-red-400 to-pink-500', notes: [0.5, 0.7, 0.9] },
  piano: { emoji: '🎹', sound: 'piano', color: 'from-blue-400 to-purple-500', notes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] },
  bell: { emoji: '🔔', sound: 'bell', color: 'from-yellow-400 to-orange-500', notes: [523.25, 587.33, 659.25, 698.46, 783.99] },
  star: { emoji: '⭐', sound: 'magic', color: 'from-pink-400 to-purple-500', notes: [880, 987.77, 1046.50, 1174.66] }
};

export default function MusicRhythmMaker({ onComplete, childName = "friend" }) {
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playNote = (frequency, duration = 0.5) => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = selectedInstrument === 'drum' ? 'triangle' : selectedInstrument === 'piano' ? 'sine' : 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const addNoteToSequence = (noteIndex) => {
    const instrument = INSTRUMENTS[selectedInstrument];
    const note = instrument.notes[noteIndex];
    
    playNote(note);
    
    setSequence(prev => [...prev, { 
      instrument: selectedInstrument, 
      note,
      emoji: instrument.emoji,
      noteIndex 
    }]);
  };

  const playSequence = async () => {
    setIsPlaying(true);
    const beatDuration = (60 / tempo) * 1000;

    for (let i = 0; i < sequence.length; i++) {
      playNote(sequence[i].note, beatDuration / 1000);
      await new Promise(resolve => setTimeout(resolve, beatDuration));
    }

    setIsPlaying(false);
  };

  const clearSequence = () => {
    setSequence([]);
    toast.success('Sequence cleared! Start fresh! 🎵');
  };

  const saveComposition = () => {
    toast.success('Music saved! You\'re a composer! 🎼');
    if (onComplete) onComplete(20, null);
  };

  const currentInstrument = INSTRUMENTS[selectedInstrument];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-purple-800 flex items-center justify-center gap-3">
            <Music className="w-8 h-8" />
            Music & Rhythm Maker
            <Music className="w-8 h-8" />
          </h3>

          {/* Instrument Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(INSTRUMENTS).map(([key, inst]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedInstrument(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border-4 transition-all ${
                  selectedInstrument === key
                    ? 'border-purple-500 bg-purple-100 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-4xl mb-2">{inst.emoji}</div>
                <div className="text-sm font-bold capitalize">{key}</div>
              </motion.button>
            ))}
          </div>

          {/* Note Pads */}
          <div>
            <p className="text-center font-bold text-purple-700 mb-3 text-lg">
              Tap notes to add to your song! {currentInstrument.emoji}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {currentInstrument.notes.map((note, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => addNoteToSequence(idx)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-20 rounded-xl bg-gradient-to-br ${currentInstrument.color} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all`}
                >
                  {currentInstrument.emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sequence Display */}
          <Card className="bg-white border-2 border-purple-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-purple-800">Your Song:</h4>
                <Badge className="bg-purple-500 text-white">
                  {sequence.length} notes
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[60px] bg-purple-50 rounded-lg p-3">
                {sequence.length === 0 ? (
                  <p className="text-gray-400 italic">Tap notes above to create music!</p>
                ) : (
                  sequence.map((note, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-3xl"
                    >
                      {note.emoji}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">
                <Volume2 className="w-4 h-4 inline mr-1" />
                Volume: {Math.round(volume * 100)}%
              </label>
              <Slider
                value={[volume * 100]}
                onValueChange={([val]) => setVolume(val / 100)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">
                Speed: {tempo} BPM
              </label>
              <Slider
                value={[tempo]}
                onValueChange={([val]) => setTempo(val)}
                min={60}
                max={180}
                step={10}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={playSequence}
              disabled={sequence.length === 0 || isPlaying}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 text-lg"
            >
              {isPlaying ? (
                <><Pause className="w-5 h-5 mr-2" /> Playing...</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Play Song</>
              )}
            </Button>
            <Button
              onClick={clearSequence}
              variant="outline"
              disabled={sequence.length === 0}
              className="border-2 border-red-400 hover:bg-red-50 font-bold py-4 text-lg"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear
            </Button>
          </div>

          <Button
            onClick={saveComposition}
            disabled={sequence.length < 3}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Save My Composition! (Min 3 notes)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}