import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Server, CheckCircle, ExternalLink } from 'lucide-react';

export default function SSLFixGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL Configuration Error</h1>
          <p className="text-lg text-red-600 font-semibold">ERR_SSL_VERSION_OR_CIPHER_MISMATCH</p>
        </div>

        {/* Critical Issue Alert */}
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">🚨 Critical Security Issue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-red-900">
              <p><strong>Domain:</strong> thedobrylife.com</p>
              <p><strong>Error:</strong> ERR_SSL_VERSION_OR_CIPHER_MISMATCH</p>
              <p><strong>Cause:</strong> Server SSL/TLS configuration problem</p>
              <p className="text-red-700 font-semibold">
                ⚠️ This CANNOT be fixed with code - it requires server configuration changes!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What This Means */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">What Does This Error Mean?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <p>This error occurs when:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The server is using outdated SSL/TLS protocols (SSLv3, TLS 1.0, TLS 1.1)</li>
                <li>The SSL certificate is improperly configured</li>
                <li>There's a mismatch between the certificate and domain</li>
                <li>The server's cipher suites are not compatible with modern browsers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Immediate Action Required */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">🔴 IMMEDIATE ACTION REQUIRED</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700 font-semibold">Contact your hosting provider IMMEDIATELY with this information:</p>
              
              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <p className="font-bold text-red-900 mb-3">📧 Email Template for Support:</p>
                <div className="bg-gray-50 p-4 rounded border text-sm space-y-2">
                  <p><strong>Subject:</strong> URGENT - SSL Configuration Error on thedobrylife.com</p>
                  <hr className="my-2" />
                  <p><strong>Message:</strong></p>
                  <div className="ml-4 space-y-2">
                    <p>Hello,</p>
                    <p>My domain <strong>thedobrylife.com</strong> is showing a critical SSL error:</p>
                    <p className="font-mono bg-red-50 p-2 rounded">ERR_SSL_VERSION_OR_CIPHER_MISMATCH</p>
                    <p>This prevents all users from accessing the site.</p>
                    <p>Please urgently:</p>
                    <ol className="list-decimal list-inside ml-4 space-y-1">
                      <li>Verify the SSL certificate is properly installed for thedobrylife.com</li>
                      <li>Enable TLS 1.2 and TLS 1.3 protocols</li>
                      <li>Disable outdated protocols (SSLv3, TLS 1.0, TLS 1.1)</li>
                      <li>Configure modern cipher suites</li>
                      <li>Restart the web server</li>
                    </ol>
                    <p className="mt-2">This is blocking my site from being accessible.</p>
                    <p>Thank you for your urgent assistance.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  asChild
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <a href="mailto:support@base44.com?subject=URGENT%20-%20SSL%20Error%20on%20thedobrylife.com&body=Hello%2C%0A%0AMy%20domain%20thedobrylife.com%20is%20showing%20this%20error%3A%0AERR_SSL_VERSION_OR_CIPHER_MISMATCH%0A%0APlease%20help%20urgently.">
                    📧 Email Base44 Support
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details for Support Team */}
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <CardTitle>Technical Details (For Support Team)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">Required Server Configuration:</p>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 ml-4">
                  <li><strong>Enable TLS 1.2 and TLS 1.3</strong> (mandatory)</li>
                  <li><strong>Disable</strong> SSLv2, SSLv3, TLS 1.0, TLS 1.1</li>
                  <li><strong>Cipher Suites:</strong> Use modern, secure ciphers only</li>
                  <li><strong>Certificate:</strong> Valid for thedobrylife.com (not expired, not self-signed)</li>
                  <li><strong>Certificate Chain:</strong> Include intermediate certificates</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold mb-2">Recommended Cipher Suites:</p>
                <code className="text-xs block bg-white p-3 rounded border overflow-x-auto">
                  TLS_AES_128_GCM_SHA256<br/>
                  TLS_AES_256_GCM_SHA384<br/>
                  TLS_CHACHA20_POLY1305_SHA256<br/>
                  ECDHE-RSA-AES128-GCM-SHA256<br/>
                  ECDHE-RSA-AES256-GCM-SHA384
                </code>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Important:</strong> After configuration changes, the web server must be restarted for changes to take effect.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Tools */}
        <Card className="mb-6 border-purple-200">
          <CardHeader>
            <CardTitle>🔍 SSL Testing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 mb-3">After your hosting provider fixes the issue, test with these tools:</p>
              
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <a href="https://www.ssllabs.com/ssltest/analyze.html?d=thedobrylife.com" target="_blank" rel="noopener noreferrer">
                  SSL Labs Test (Comprehensive)
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>

              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <a href="https://www.whynopadlock.com/" target="_blank" rel="noopener noreferrer">
                  Why No Padlock? (Quick Check)
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>

              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <a href="https://dnschecker.org/" target="_blank" rel="noopener noreferrer">
                  DNS Checker (Verify DNS)
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expected Timeline */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">⏰ Expected Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Initial Response: 1-4 hours</p>
                  <p className="text-sm text-gray-600">Support team acknowledgment</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Fix Implementation: 2-8 hours</p>
                  <p className="text-sm text-gray-600">Server configuration changes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Verification: 30 minutes</p>
                  <p className="text-sm text-gray-600">After fix, test and verify</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temporary Workaround */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>🔧 While Waiting for Fix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">You can continue development using:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Base44 preview URL (*.base44.app)</li>
                <li>HTTP version (not recommended for production)</li>
                <li>Localhost for local testing</li>
              </ul>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ DO NOT launch publicly</strong> until SSL is fixed. Users will not be able to access your site.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}