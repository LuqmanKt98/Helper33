import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, TrendingDown, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RateLimitInfo() {
  const [status, setStatus] = useState('checking');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRefresh = () => {
    setCountdown(60);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rate Limit Error</h1>
          <p className="text-lg text-gray-600">Too Many Requests to Render API</p>
        </div>

        {/* Main Alert */}
        <Alert className="mb-6 border-orange-300 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-bold text-orange-900">The Base44 rendering API has received too many requests.</p>
              <p className="text-sm text-orange-800">
                This happens when the app is deployed/previewed multiple times in a short period, or when there are too many concurrent users accessing the preview.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* What This Means */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              What Does This Mean?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <p>The Base44 platform limits the number of API requests to prevent abuse and ensure stability. You've hit this limit because:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Multiple deployments in quick succession</li>
                <li>Too many preview refreshes</li>
                <li>High number of concurrent API calls</li>
                <li>Security scanning/automated testing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Immediate Solutions */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✅ Immediate Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900">Wait 1-2 Minutes</h4>
                  <p className="text-sm text-gray-700">Rate limits reset automatically after a short cooling period.</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg border-2 border-green-300">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Auto-refresh in:</p>
                  <div className="text-4xl font-bold text-green-600">
                    {countdown}s
                  </div>
                </div>
                <Button
                  onClick={handleRefresh}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🎯 Best Practices to Avoid This</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Reduce Deploy Frequency</h4>
                  <p className="text-sm text-gray-600">Wait 2-3 minutes between deployments</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Use Local Development</h4>
                  <p className="text-sm text-gray-600">Test changes locally before deploying to preview</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Batch Changes</h4>
                  <p className="text-sm text-gray-600">Make multiple changes in one deployment instead of many small deployments</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Optimize API Calls</h4>
                  <p className="text-sm text-gray-600">Use caching and reduce unnecessary data fetches</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Avoid Rapid Refreshing</h4>
                  <p className="text-sm text-gray-600">Don't repeatedly refresh the preview page</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Error Code:</p>
                  <p className="text-gray-600">429 Too Many Requests</p>
                </div>
                <div>
                  <p className="font-semibold">Service:</p>
                  <p className="text-gray-600">Base44 Render API</p>
                </div>
                <div>
                  <p className="font-semibold">Reset Time:</p>
                  <p className="text-gray-600">1-2 minutes</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <p className="text-orange-600 font-semibold">Rate Limited</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-900">
                  <strong>💡 Tip:</strong> If you continue to experience rate limiting, contact Base44 support to discuss increasing your API quota for production use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="mt-6 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
          >
            <a href="mailto:support@base44.com?subject=Rate%20Limit%20Issue%20-%20DobryLife">
              Contact Support
            </a>
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            If rate limiting persists, contact Base44 support
          </p>
        </div>
      </div>
    </div>
  );
}