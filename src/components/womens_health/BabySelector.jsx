import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BabySelector({ babies, selectedBaby, onSelect, showAll = true }) {
  if (!babies || babies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-2">Viewing:</span>
      
      {showAll && babies.length > 1 && (
        <button
          onClick={() => onSelect('all')}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            selectedBaby === 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          All Babies
        </button>
      )}

      {babies.map((baby, index) => (
        <motion.button
          key={baby.baby_id}
          onClick={() => onSelect(baby.baby_id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            selectedBaby === baby.baby_id
              ? 'text-white shadow-lg'
              : 'bg-white text-gray-700 hover:shadow-md border-2'
          }`}
          style={{
            backgroundColor: selectedBaby === baby.baby_id ? baby.color : 'white',
            borderColor: baby.color
          }}
        >
          <span className="mr-1">{baby.emoji}</span>
          {baby.baby_name}
        </motion.button>
      ))}
    </div>
  );
}