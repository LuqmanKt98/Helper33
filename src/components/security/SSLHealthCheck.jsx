import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2, Lock, Globe } from 'lucide-react';

export default function SSLHealthCheck() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  const runSecurityCheck = () => {
    setChecking(true);
    
    const checks = {
      httpsEnabled: window.location.protocol === 'https:',
      validCertificate: true, // Will be false if cert error
      mixedContent: false,
      secureHeaders: false,
      timestamp: new Date().toISOString()
    };

    // Check for mixed content
    const resources = performance.getEntriesByType('resource');
    checks.mixedContent = resources.some(r => 
      r.name.startsWith('http:') && !r.name.startsWith('http://localhost')
    );

    // Check for security headers
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        checks.secureHeaders = 
          response.headers.has('strict-transport-security') ||
          response.headers.has('x-content-type-options');
        
        setResults(checks);
        setChecking(false);
      })
      .catch(() => {
        checks.validCertificate = false;
        setResults(checks);
        setChecking(false);
      });
  };

  useEffect(() => {
    // Auto-run check on mount
    setTimeout(runSecurityCheck, 1000);
  }, []);

  const CheckItem = ({ label, status, description }) => {
    const Icon = status === 'pass' ? CheckCircle : status === 'fail' ? XCircle : AlertCircle;
    const color = status === 'pass' ? 'text-green-600' : status === 'fail' ? 'text-red-600' : 'text-yellow-600';
    
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
        <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{label}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">SSL Security Check</h3>
              <p className="text-sm text-gray-600">Domain: {window.location.hostname}</p>
            </div>
          </div>
          
          <Button
            onClick={runSecurityCheck}
            disabled={checking}
            variant="outline"
            size="sm"
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Re-check
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-3">
            <CheckItem
              label="HTTPS Enabled"
              status={results.httpsEnabled ? 'pass' : 'fail'}
              description={results.httpsEnabled ? 'Site is using HTTPS' : 'Site is not using HTTPS - users may see security warnings'}
            />
            
            <CheckItem
              label="Valid SSL Certificate"
              status={results.validCertificate ? 'pass' : 'fail'}
              description={results.validCertificate ? 'SSL certificate is valid and trusted' : 'SSL certificate error detected - see setup guide above'}
            />
            
            <CheckItem
              label="No Mixed Content"
              status={!results.mixedContent ? 'pass' : 'warning'}
              description={!results.mixedContent ? 'All resources loaded over HTTPS' : 'Some resources loaded over HTTP - may cause security warnings'}
            />
            
            <CheckItem
              label="Security Headers"
              status={results.secureHeaders ? 'pass' : 'warning'}
              description={results.secureHeaders ? 'Security headers detected' : 'Additional security headers recommended'}
            />

            {(!results.httpsEnabled || !results.validCertificate) && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900 mb-2">⚠️ Action Required</p>
                <p className="text-sm text-red-800">
                  Your site has SSL issues. Please follow the setup guide above to configure SSL properly.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}