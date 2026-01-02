import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Rocket,
  Globe,
  Lock,
  BarChart3,
  Users,
  CreditCard,
  Zap,
  ExternalLink,
  AlertTriangle,
  CheckCheck,
  PartyPopper
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionChecklist() {
  const [checks, setChecks] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  const checkSSL = () => {
    const isSecure = window.location.protocol === 'https:';
    setChecks(prev => ({ ...prev, ssl: isSecure }));
    return isSecure;
  };

  const checkAnalytics = () => {
    const hasGtag = typeof window.gtag === 'function';
    const hasDataLayer = Array.isArray(window.dataLayer);
    const analyticsWorking = hasGtag && hasDataLayer;
    setChecks(prev => ({ ...prev, analytics: analyticsWorking }));
    return analyticsWorking;
  };

  const checkDomain = () => {
    const domain = window.location.hostname;
    const isProduction = !domain.includes('localhost') && !domain.includes('127.0.0.1');
    setChecks(prev => ({ ...prev, domain: isProduction }));
    return { isProduction, domain };
  };

  const runAllChecks = async () => {
    setIsVerifying(true);
    
    // SSL Check
    const sslOk = checkSSL();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Analytics Check
    const analyticsOk = checkAnalytics();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Domain Check
    const domainInfo = checkDomain();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Database Connection Check
    try {
      await base44.auth.me();
      setChecks(prev => ({ ...prev, database: true }));
    } catch (error) {
      setChecks(prev => ({ ...prev, database: false }));
    }
    
    setIsVerifying(false);
    
    if (sslOk && analyticsOk && domainInfo.isProduction) {
      toast.success('🎉 All critical checks passed! Your app is ready for launch!');
    } else {
      toast.warning('Some checks need attention before launch');
    }
  };

  const deploymentSteps = [
    {
      title: '✅ Domain Connected',
      description: `Your custom domain is now connected!`,
      status: 'completed',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Verify HTTPS/SSL',
      description: 'Ensure your site loads with https:// and shows a padlock icon',
      action: () => {
        const isSecure = checkSSL();
        if (isSecure) {
          toast.success('✅ SSL Certificate is active!');
        } else {
          toast.error('⚠️ SSL not detected. Please check your domain settings.');
        }
      },
      check: 'ssl',
      icon: Lock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Verify Google Analytics',
      description: 'Confirm GA is tracking visits (G-J76WM97PVF)',
      action: () => {
        const analyticsOk = checkAnalytics();
        if (analyticsOk) {
          toast.success('✅ Google Analytics is working!');
          window.open('https://analytics.google.com/', '_blank');
        } else {
          toast.error('⚠️ Google Analytics not detected');
        }
      },
      check: 'analytics',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Test User Registration',
      description: 'Create a test account and verify email flows',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Test Payment Flow',
      description: 'Verify Stripe checkout and webhooks work correctly',
      action: () => {
        window.open('/upgrade', '_blank');
      },
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Test Core Features',
      description: 'Quick test of main features (Organizer, Journal, Wellness)',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const criticalChecks = [
    {
      name: 'SSL/HTTPS Active',
      key: 'ssl',
      description: 'Secure connection established',
      critical: true
    },
    {
      name: 'Google Analytics Tracking',
      key: 'analytics',
      description: 'GA tracking visitors correctly',
      critical: true
    },
    {
      name: 'Database Connected',
      key: 'database',
      description: 'Base44 backend operational',
      critical: true
    },
    {
      name: 'Custom Domain Active',
      key: 'domain',
      description: 'Production domain configured',
      critical: true
    }
  ];

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalChecks = criticalChecks.length;
  const progress = (completedCount / totalChecks) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 Domain Connected!
          </h1>
          <p className="text-xl text-gray-600">
            Your app is almost ready to launch. Complete these final checks.
          </p>
        </motion.div>

        {/* Quick Verification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Verification Check</h3>
                  <p className="text-sm text-gray-600">Run automated tests on critical systems</p>
                </div>
                <Button
                  onClick={runAllChecks}
                  disabled={isVerifying}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isVerifying ? (
                    <>
                      <Circle className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Run All Checks
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              {Object.keys(checks).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {completedCount} of {totalChecks} checks passed
                    </span>
                    <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Check Results */}
              {Object.keys(checks).length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {criticalChecks.map(check => (
                    <div
                      key={check.key}
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        checks[check.key] ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {checks[check.key] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${checks[check.key] ? 'text-green-900' : 'text-red-900'}`}>
                          {check.name}
                        </p>
                        <p className={`text-xs ${checks[check.key] ? 'text-green-700' : 'text-red-700'}`}>
                          {check.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Deployment Steps */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Final Launch Checklist</h2>
          
          {deploymentSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className={`${step.bgColor} border-2 ${step.status === 'completed' ? 'border-green-300' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${step.bgColor}`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                        {step.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {step.check && checks[step.check] && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{step.description}</p>
                      {step.action && (
                        <Button
                          onClick={step.action}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          {step.check ? 'Verify Now' : 'Test Now'}
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Launch Button */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-2xl">
              <CardContent className="p-8">
                <PartyPopper className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  🎉 Ready to Launch!
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  All critical systems are verified. Your app is ready for users!
                </p>
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 text-xl px-8 py-6"
                  onClick={() => {
                    toast.success('🚀 DobryLife is now LIVE!');
                    window.gtag?.('event', 'app_launched', {
                      timestamp: new Date().toISOString()
                    });
                  }}
                >
                  <Rocket className="w-6 h-6 mr-2" />
                  Launch DobryLife!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Domain Information */}
        <Alert className="bg-blue-50 border-blue-200">
          <Globe className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Your Domain:</strong> {window.location.hostname}
            <br />
            <strong>Protocol:</strong> {window.location.protocol}
            <br />
            <strong>Full URL:</strong> {window.location.origin}
          </AlertDescription>
        </Alert>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Post-Launch Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <BarChart3 className="w-4 h-4" />
              Google Analytics Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://dashboard.stripe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <CreditCard className="w-4 h-4" />
              Stripe Payment Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}