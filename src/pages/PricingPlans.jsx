import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubscriptionPlansComparison from '@/components/SubscriptionPlans';

export default function PricingPlans() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button asChild variant="ghost">
            <Link to={createPageUrl('Home')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <SubscriptionPlansComparison />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">What happens to my data if I cancel?</h4>
              <p className="text-gray-600">Your data is never deleted. If you cancel, you'll be moved to the Free plan with continued access to your core features and all saved content.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">Are the books included in subscriptions?</h4>
              <p className="text-gray-600">
                • <strong>Free & Pro:</strong> Books are available as separate purchases ($14.99-$24)<br/>
                • <strong>Executive:</strong> All books included at no extra cost, plus early access to new releases
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">Is my data secure and private?</h4>
              <p className="text-gray-600">Absolutely. We use bank-level encryption and never share your personal information. Executive plan includes HIPAA-compliant features for healthcare-level security.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}