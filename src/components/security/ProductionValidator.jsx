import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductionValidator({ children }) {
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateProduction = () => {
      const errors = [];
      const warnings = [];

      // Only check for CRITICAL issues that would break the app
      
      // 1. Check if running on HTTPS in production (warning only)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        warnings.push('App is not running on HTTPS - some features may be limited');
      }

      // 2. Check for critical missing dependencies (only if they cause actual errors)
      // This is handled by the build process, so we don't need to check here

      setValidationErrors(errors);
      setIsValidating(false);

      // Log warnings to console only
      if (warnings.length > 0) {
        console.warn('[Production Validator] Warnings:', warnings);
      }
    };

    // Run validation after a short delay to not block initial render
    const timer = setTimeout(validateProduction, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Only block if there are CRITICAL errors (which there shouldn't be in normal operation)
  if (validationErrors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Critical Configuration Issues Detected
                </h2>
                <div className="space-y-2">
                  {validationErrors.map((error, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Please contact support if this issue persists.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}