import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Globe, Lock, Shield, ExternalLink } from 'lucide-react';

export default function SSLSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL Certificate Setup Guide</h1>
          <p className="text-lg text-gray-600">Fix "Your connection isn't private" error</p>
        </div>

        {/* Current Issue Alert */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">Current Issue Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-red-800">
              <p><strong>Error:</strong> NET::ERR_CERT_COMMON_NAME_INVALID</p>
              <p><strong>Domain:</strong> dobrylife.com</p>
              <p><strong>Cause:</strong> SSL certificate doesn't match your domain name</p>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-6">
          
          {/* Step 1: Base44 Platform Setup */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <CardTitle>Configure Custom Domain in Base44</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Go to your <strong>Base44 Dashboard</strong></li>
                <li>Navigate to <strong>Settings → Custom Domain</strong></li>
                <li>Click <strong>"Add Custom Domain"</strong></li>
                <li>Enter your domain: <code className="bg-gray-100 px-2 py-1 rounded">dobrylife.com</code></li>
                <li>Also add: <code className="bg-gray-100 px-2 py-1 rounded">www.dobrylife.com</code></li>
                <li>Click <strong>"Verify Domain"</strong></li>
              </ol>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>📝 Note:</strong> Base44 will provide you with DNS records that you need to configure with your domain registrar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: DNS Configuration */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <CardTitle>Configure DNS Records</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 mb-4">Add these DNS records to your domain registrar (GoDaddy, Namecheap, etc.):</p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <p className="font-semibold mb-2">A Record:</p>
                  <code className="block bg-white p-2 rounded border text-sm">
                    Type: A<br/>
                    Name: @<br/>
                    Value: [IP provided by Base44]<br/>
                    TTL: 3600
                  </code>
                </div>
                
                <div>
                  <p className="font-semibold mb-2">CNAME Record (for www):</p>
                  <code className="block bg-white p-2 rounded border text-sm">
                    Type: CNAME<br/>
                    Name: www<br/>
                    Value: [provided by Base44]<br/>
                    TTL: 3600
                  </code>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-900">
                  <strong>⏱️ Propagation Time:</strong> DNS changes can take 1-48 hours to propagate globally. Usually it's faster (15-30 minutes).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: SSL Certificate Activation */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <CardTitle>Enable SSL Certificate</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">After DNS records are configured:</p>
              
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Return to Base44 Dashboard → <strong>Custom Domain</strong></li>
                <li>Click <strong>"Verify DNS"</strong> button</li>
                <li>If verification succeeds, click <strong>"Enable SSL"</strong></li>
                <li>Base44 will automatically provision a Let's Encrypt SSL certificate</li>
                <li>Wait 5-10 minutes for SSL activation</li>
              </ol>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900 font-semibold mb-1">Automatic SSL Renewal</p>
                    <p className="text-sm text-green-800">Base44 automatically renews your SSL certificate every 90 days.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Verification */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <CardTitle>Verify SSL Installation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 mb-4">Test your SSL certificate:</p>
              
              <div className="space-y-3">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <a href="https://www.ssllabs.com/ssltest/analyze.html?d=dobrylife.com" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Test SSL on SSL Labs
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>

                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href="https://www.whynopadlock.com/" target="_blank" rel="noopener noreferrer">
                    <Shield className="w-4 h-4 mr-2" />
                    Check Mixed Content Issues
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 font-semibold mb-2">Expected Results:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>SSL Labs Grade: A or A+</li>
                  <li>Certificate Status: Valid</li>
                  <li>No mixed content warnings</li>
                  <li>Secure padlock icon in browser</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Troubleshooting Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Issue: DNS not propagating</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Wait 24-48 hours for full propagation</li>
                    <li>Clear your DNS cache: <code className="bg-gray-100 px-1 rounded">ipconfig /flushdns</code> (Windows) or <code className="bg-gray-100 px-1 rounded">sudo dscacheutil -flushcache</code> (Mac)</li>
                    <li>Test DNS propagation at: https://dnschecker.org</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Issue: SSL still showing error</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Clear browser cache and cookies</li>
                    <li>Try in incognito/private browsing mode</li>
                    <li>Check if SSL is actually enabled in Base44 dashboard</li>
                    <li>Contact Base44 support if issue persists</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Issue: Mixed content warnings</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Ensure all resources (images, scripts, CSS) use HTTPS</li>
                    <li>Update any hardcoded HTTP URLs to HTTPS</li>
                    <li>Use protocol-relative URLs when possible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-gray-600 mb-4">If you're still experiencing issues after following these steps:</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <a href="mailto:support@base44.com">
                      Contact Base44 Support
                    </a>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline"
                  >
                    <a href="mailto:support@dobrylife.com">
                      Contact DobryLife Support
                    </a>
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Include this error code in your message: <code className="bg-gray-100 px-2 py-1 rounded">NET::ERR_CERT_COMMON_NAME_INVALID</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}