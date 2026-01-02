import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  User, Stethoscope, HeartHandshake, Brain, Building2, ShoppingBag,
  CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const ACCOUNT_TYPES = [
  {
    type: 'individual',
    name: 'Personal Account',
    icon: User,
    description: 'For personal wellness, family management, and daily productivity',
    color: 'from-blue-500 to-cyan-500',
    features: ['AI Wellness Coach', 'Task Management', 'Family Hub', 'Journaling']
  },
  {
    type: 'practitioner',
    name: 'Licensed Practitioner',
    icon: Stethoscope,
    description: 'For licensed mental health professionals, therapists, and counselors',
    color: 'from-purple-500 to-pink-500',
    features: ['Client Portal', 'Appointment Scheduling', 'Session Notes', 'Telehealth']
  },
  {
    type: 'caregiver',
    name: 'Caregiver Professional',
    icon: HeartHandshake,
    description: 'For nannies, eldercare providers, housekeepers, and home service professionals',
    color: 'from-green-500 to-teal-500',
    features: ['Booking Management', 'Client Reviews', 'Background Verification', 'Job Matching']
  },
  {
    type: 'consultant',
    name: 'AI Consultant',
    icon: Brain,
    description: 'For business consultants offering AI implementation and strategic services',
    color: 'from-indigo-500 to-blue-500',
    features: ['Client Requests', 'AI Partnership Tools', 'Project Management', 'Analytics']
  },
  {
    type: 'seller',
    name: 'Marketplace Seller',
    icon: ShoppingBag,
    description: 'Sell products, courses, and digital content on the Helper33 marketplace',
    color: 'from-pink-500 to-rose-500',
    features: ['Product Listings', 'Course Creation', 'Commission Tracking', 'Seller Analytics']
  },
  {
    type: 'business',
    name: 'Business Account',
    icon: Building2,
    description: 'For businesses needing team collaboration and productivity tools',
    color: 'from-orange-500 to-red-500',
    features: ['Team Management', 'Multi-user Access', 'Advanced Analytics', 'White Label']
  }
];

export default function RoleSelector({ user, onComplete }) {
  const [selectedType, setSelectedType] = useState(user?.account_type || null);
  const queryClient = useQueryClient();

  const updateAccountMutation = useMutation({
    mutationFn: async (accountType) => {
      await base44.auth.updateMe({ account_type: accountType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Account type updated! Redirecting...');
      if (onComplete) onComplete();
    },
    onError: () => {
      toast.error('Failed to update account type');
    }
  });

  const handleSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      updateAccountMutation.mutate(selectedType);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">
          Choose Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Account Type</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the account type that best fits your needs. You can change this later in settings.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACCOUNT_TYPES.map((accountType, idx) => {
          const Icon = accountType.icon;
          const isSelected = selectedType === accountType.type;

          return (
            <motion.div
              key={accountType.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-4 ring-purple-500 shadow-2xl' 
                    : 'hover:shadow-xl border-2 border-gray-200'
                }`}
                onClick={() => handleSelect(accountType.type)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${accountType.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span>{accountType.name}</span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-purple-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{accountType.description}</p>
                  <div className="space-y-2">
                    {accountType.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={updateAccountMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-2xl"
          >
            {updateAccountMutation.isPending ? 'Setting up...' : 'Continue'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}