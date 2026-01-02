import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BABY_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#10b981', label: 'Green' },
  { value: '#ef4444', label: 'Red' }
];

const BABY_EMOJIS = ['👶', '🍼', '💙', '💗', '💜', '🧡', '💛', '💚'];

export default function MultipleBabySetup({ onComplete, existingBabies = [], onCancel }) {
  const [numberOfBabies, setNumberOfBabies] = useState(existingBabies.length || 2);
  const [babies, setBabies] = useState(
    existingBabies.length > 0
      ? existingBabies
      : Array.from({ length: 2 }, (_, i) => ({
          baby_id: `baby_${Date.now()}_${i}`,
          baby_name: '',
          birth_date: '',
          birth_order: i + 1,
          color: BABY_COLORS[i % BABY_COLORS.length].value,
          emoji: BABY_EMOJIS[i % BABY_EMOJIS.length]
        }))
  );

  const handleBabyChange = (index, field, value) => {
    const updated = [...babies];
    updated[index] = { ...updated[index], [field]: value };
    setBabies(updated);
  };

  const handleNumberChange = (num) => {
    setNumberOfBabies(num);
    const current = babies.length;
    
    if (num > current) {
      // Add new babies
      const newBabies = Array.from({ length: num - current }, (_, i) => ({
        baby_id: `baby_${Date.now()}_${current + i}`,
        baby_name: '',
        birth_date: '',
        birth_order: current + i + 1,
        color: BABY_COLORS[(current + i) % BABY_COLORS.length].value,
        emoji: BABY_EMOJIS[(current + i) % BABY_EMOJIS.length]
      }));
      setBabies([...babies, ...newBabies]);
    } else {
      // Remove babies
      setBabies(babies.slice(0, num));
    }
  };

  const handleSubmit = () => {
    // Validate all babies have names and birth dates
    const incomplete = babies.some(b => !b.baby_name || !b.birth_date);
    if (incomplete) {
      alert('Please fill in all baby names and birth dates');
      return;
    }

    onComplete({
      is_multiple_birth: numberOfBabies > 1,
      number_of_babies: numberOfBabies,
      babies: babies.map((b, i) => ({ ...b, birth_order: i + 1 }))
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="w-6 h-6 text-purple-600" />
          {existingBabies.length > 0 ? 'Edit Babies Info' : 'Multiple Birth Setup'}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {numberOfBabies === 1 
            ? 'Track care for one baby'
            : `Track care for ${numberOfBabies === 2 ? 'twins' : numberOfBabies === 3 ? 'triplets' : 'quadruplets'}`
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number of Babies Selector */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            How many babies are you tracking?
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberChange(num)}
                className={`p-4 rounded-xl text-lg font-bold transition-all ${
                  numberOfBabies === num
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {numberOfBabies === 1 && 'Single baby'}
            {numberOfBabies === 2 && 'Twins 👶👶'}
            {numberOfBabies === 3 && 'Triplets 👶👶👶'}
            {numberOfBabies === 4 && 'Quadruplets 👶👶👶👶'}
          </p>
        </div>

        {/* Baby Details Forms */}
        <div className="space-y-4">
          {babies.map((baby, index) => (
            <motion.div
              key={baby.baby_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border-2"
              style={{ borderColor: baby.color, backgroundColor: `${baby.color}10` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{baby.emoji}</span>
                  Baby {index + 1}
                </h3>
                <Badge style={{ backgroundColor: baby.color }} className="text-white">
                  {BABY_COLORS.find(c => c.value === baby.color)?.label || 'Blue'}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Baby's Name *</Label>
                  <Input
                    value={baby.baby_name}
                    onChange={(e) => handleBabyChange(index, 'baby_name', e.target.value)}
                    placeholder={`Baby ${index + 1} name`}
                    className="mt-1 bg-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Birth Date *</Label>
                  <Input
                    type="date"
                    value={baby.birth_date}
                    onChange={(e) => handleBabyChange(index, 'birth_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="mt-1 bg-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-medium">Color Tag</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {BABY_COLORS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleBabyChange(index, 'color', color.value)}
                        className="p-2 rounded-lg border-2 transition-all text-xs font-semibold"
                        style={{
                          backgroundColor: baby.color === color.value ? color.value : '#fff',
                          borderColor: color.value,
                          color: baby.color === color.value ? '#fff' : color.value
                        }}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Emoji</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {BABY_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleBabyChange(index, 'emoji', emoji)}
                        className={`p-2 rounded-lg text-2xl transition-all ${
                          baby.emoji === emoji
                            ? 'bg-purple-100 ring-2 ring-purple-500'
                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Color tags and emojis help you quickly identify each baby when logging care activities. 
            Each baby can have the same or different birth dates (for premature multiples or siblings close in age).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-6 text-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Save {numberOfBabies} {numberOfBabies === 1 ? 'Baby' : 'Babies'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}