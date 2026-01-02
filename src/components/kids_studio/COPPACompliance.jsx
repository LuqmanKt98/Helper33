import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, Lock, Eye, UserX, CheckCircle, X } from 'lucide-react';

export default function COPPACompliance({ onAccept, onDecline, childAge }) {
  const [showDetails, setShowDetails] = useState(false);

  // COPPA compliance features
  const complianceFeatures = [
    {
      icon: Lock,
      title: 'No Personal Data Collection',
      description: 'We do not collect, store, or share personal information from children under 13'
    },
    {
      icon: Shield,
      title: 'Parent Verification Required',
      description: 'Parents must verify their identity before children can access the platform'
    },
    {
      icon: Eye,
      title: 'Parent Monitoring',
      description: 'Parents have full visibility and control over their child\'s activities and progress'
    },
    {
      icon: UserX,
      title: 'No External Sharing',
      description: 'Child data is never shared with third parties or used for advertising'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="max-w-2xl w-full my-8"
        >
          <Card className="border-4 border-blue-400 shadow-2xl max-h-[90vh] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Shield className="w-8 h-8" />
                  Parent Consent Required
                </CardTitle>
                <Button
                  onClick={onDecline}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">COPPA Compliance Notice</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Helper33 Kids Creative Studio is designed for children and complies with the 
                      Children's Online Privacy Protection Act (COPPA). We take your child's privacy and safety seriously.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Features */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 mb-3">How We Protect Your Child:</h4>
                {complianceFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <feature.icon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-900 text-sm">{feature.title}</p>
                      <p className="text-xs text-green-800">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h4 className="font-bold text-purple-900 mb-2">What Data We Store:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Learning progress (locally, tied to parent account)</li>
                  <li>✓ Points and achievements (for motivation)</li>
                  <li>✓ Created content (stories, drawings - visible to parents)</li>
                  <li>✗ NO email, phone, or personal identifiers from children</li>
                  <li>✗ NO third-party tracking or advertising</li>
                  <li>✗ NO external data sharing</li>
                </ul>
              </div>

              {/* Parent Controls Info */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <h4 className="font-bold text-amber-900 mb-2">Parent Controls Available:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• View all child activity and progress</li>
                  <li>• Review journal entries and creations</li>
                  <li>• Delete child data at any time</li>
                  <li>• Manage learning goals and time limits</li>
                  <li>• Full data export available</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="ghost"
                  className="w-full text-blue-600 hover:bg-blue-50"
                >
                  {showDetails ? '▲ Hide' : '▼ Read'} Full Privacy Policy
                </Button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 leading-relaxed mt-3 max-h-40 overflow-y-auto"
                    >
                      <p className="font-bold mb-2">Full COPPA Compliance Statement:</p>
                      <p className="mb-2">
                        Helper33 ("we," "us," or "our") operates the Kids Creative Studio in compliance with 
                        the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect 
                        personal information from children under 13 without verifiable parental consent.
                      </p>
                      <p className="mb-2">
                        All child accounts must be created and managed by a parent or legal guardian who is 
                        at least 18 years old. Parents maintain full control and visibility over all child 
                        activities, can review all content, and can delete all data at any time.
                      </p>
                      <p className="mb-2">
                        We implement technical and organizational measures to protect children's information, 
                        including encryption, access controls, and regular security audits.
                      </p>
                      <p>
                        For questions about our privacy practices, contact: privacy@helper33.com
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Consent Buttons - Sticky at bottom */}
              <div className="border-t border-gray-200 pt-4 bg-white sticky bottom-0 -mb-6 -mx-6 px-6 pb-6">
                <div className="flex gap-3 mb-3">
                  <Button
                    onClick={onDecline}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={onAccept}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I Agree (Parent/Guardian)
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By clicking "I Agree," you confirm you are the parent or legal guardian and consent to 
                  your child's use of this educational platform under the terms described above.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}