
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Download, Trash2, FileText, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DataPrivacyNotice() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Your Data Rights & Privacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Private by Default</h4>
                <p className="text-sm text-gray-600">Only you can see your personal data, journals, and conversations. We never share or sell your information.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Bank-Level Encryption</h4>
                <p className="text-sm text-gray-600">All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Export Your Data</h4>
                <p className="text-sm text-gray-600 mb-2">Download all your data anytime in standard formats.</p>
                <Link to={createPageUrl('ExportData')}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Export Now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Right to be Forgotten</h4>
                <p className="text-sm text-gray-600 mb-2">Delete your account and all associated data permanently.</p>
                <Link to={createPageUrl('Account')}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Manage Account →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Compliance & Certifications
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              COPPA Guidelines
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              PCI DSS (Stripe)
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              SOC 2 (In Progress)
            </span>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs p-0 h-auto"
          >
            {showDetails ? 'Hide' : 'Learn more about our security practices'}
          </Button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 rounded-lg p-4 border border-blue-200"
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h5 className="font-semibold mb-1">🔐 Data Protection</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All data encrypted at rest (AES-256)</li>
                    <li>TLS/SSL encryption for data in transit</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Multi-factor authentication available</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">👥 Access Control</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Row-level security on all database tables</li>
                    <li>Users can only access their own data</li>
                    <li>Admin access logged and monitored</li>
                    <li>Automatic session expiration</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">🛡️ Your Rights</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Right to access your data</li>
                    <li>Right to correct inaccurate data</li>
                    <li>Right to delete your data</li>
                    <li>Right to export your data</li>
                    <li>Right to object to processing</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Questions about security or privacy? Email us at{' '}
                    <a href="mailto:privacy@helper33.com" className="text-blue-600 hover:underline font-medium">
                      privacy@helper33.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
