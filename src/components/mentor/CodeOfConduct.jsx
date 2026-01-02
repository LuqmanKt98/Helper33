import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Heart,
  Shield,
  Users,
  MessageCircle,
  Award,
  Eye,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const principles = [
  {
    id: 'compassion',
    title: '1. Compassion First',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    content: 'I will approach every interaction with empathy, patience, and kindness. I will honor each family\'s journey and meet every learner where they are.'
  },
  {
    id: 'integrity',
    title: '2. Professional Integrity',
    icon: Award,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    content: 'I will maintain professional boundaries and provide guidance only within my area of training or expertise. I will never claim to offer medical or psychological treatment beyond my qualifications.'
  },
  {
    id: 'safety',
    title: '3. Safety & Privacy',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    content: 'I will respect all privacy laws, including HIPAA and data protection standards. I will never share personal or identifying information outside the platform. I understand all communication with families and children must remain transparent and visible to parents.'
  },
  {
    id: 'communication',
    title: '4. Positive Communication',
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    content: 'I will use language that uplifts, encourages, and guides — never shames or criticizes. Feedback will focus on effort, growth, and learning, not comparison or judgment.'
  },
  {
    id: 'inclusion',
    title: '5. Respect & Inclusion',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    content: 'I will create a supportive environment for families of all backgrounds, cultures, and abilities. I will promote respect, kindness, and understanding in every exchange.'
  },
  {
    id: 'accountability',
    title: '6. Accountability',
    icon: Eye,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    content: 'I understand that DobryLife monitors mentor interactions to ensure safety and quality. I agree to uphold this Code at all times and understand that violations may result in review or removal from the platform.'
  },
  {
    id: 'mission',
    title: '7. Shared Mission',
    icon: Sparkles,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    content: 'I recognize that being part of DobryLife means carrying forward Dr. Yuriy Dobry\'s vision — one built on compassion, wellness, and the belief that every act of care strengthens a family\'s story.'
  }
];

export default function CodeOfConduct({ onAccept, isLoading = false }) {
  const [hasRead, setHasRead] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom) {
      setHasRead(true);
    }
  };

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-indigo-200">
        <CardHeader className="text-center bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            DobryLife Mentor Code of Conduct & Compassion Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 text-center">
            <p className="text-gray-700 leading-relaxed">
              Welcome to the DobryLife Mentor Network.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Our mission is to create a safe, supportive, and empowering environment where families, 
              mentors, and children grow through compassion, creativity, and connection.
            </p>
            <p className="text-gray-800 font-semibold mt-4">
              By joining DobryLife as a mentor, I agree to uphold the following principles:
            </p>
          </div>

          <ScrollArea 
            className="h-[400px] rounded-lg border border-gray-200 p-4 bg-gray-50"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${principle.bgColor} border-l-${principle.color.replace('text-', '')}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${principle.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <principle.icon className={`w-5 h-5 ${principle.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">{principle.title}</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{principle.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {!hasRead && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Please scroll to read the full agreement</span>
              </div>
            )}
          </ScrollArea>

          <div className="mt-6 space-y-4">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-800 leading-relaxed text-center">
                  By selecting <strong>"I Agree"</strong>, I affirm my commitment to compassion, 
                  ethical practice, and the emotional safety of every family I serve through DobryLife.
                </p>
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Checkbox
                id="agree-checkbox"
                checked={agreed}
                onCheckedChange={setAgreed}
                disabled={!hasRead}
                className="mt-1"
              />
              <label
                htmlFor="agree-checkbox"
                className={`text-sm leading-relaxed cursor-pointer ${!hasRead ? 'text-gray-400' : 'text-gray-700'}`}
              >
                <strong>I Agree</strong> to the DobryLife Mentor Code of Conduct & Compassion Agreement. 
                I understand and commit to upholding these principles in all my interactions with families and children.
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                size="lg"
                onClick={handleAccept}
                disabled={!agreed || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}