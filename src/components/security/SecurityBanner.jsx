
import React from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SecurityBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Your Data is Protected
              </h3>
              <div className="grid md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Private & Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>No Data Selling</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🔒 All your personal data, conversations, and files are encrypted and visible only to you. 
                <a href="mailto:security@helper33.com" className="text-blue-600 hover:underline ml-1">
                  Report security concerns
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
