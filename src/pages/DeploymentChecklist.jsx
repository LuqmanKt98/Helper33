import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  CheckCircle2,
  Circle,
  Rocket,
  Shield,
  Globe,
  Database,
  Key,
  Users,
  FileText,
  Settings,
  Zap,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function DeploymentChecklist() {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistCategories = [
    {
      title: 'Security & Authentication',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      items: [
        {
          id: 'sec-1',
          text: 'Run full security audit',
          link: createPageUrl('SecurityAudit'),
          critical: true
        },
        {
          id: 'sec-2',
          text: 'Verify all RLS policies are active on entities',
          critical: true
        },
        {
          id: 'sec-3',
          text: 'Confirm HTTPS is enforced on production domain',
          critical: true
        },
        {
          id: 'sec-4',
          text: 'Verify authentication redirects work correctly',
          critical: false
        },
        {
          id: 'sec-5',
          text: 'Test admin-only pages are properly protected',
          critical: true
        }
      ]
    },
    {
      title: 'Analytics & Tracking',
      icon: Globe,
      color: 'from-blue-500 to-cyan-600',
      items: [
        {
          id: 'ana-1',
          text: 'Google Analytics (G-J76WM97PVF) is installed on all pages',
          critical: true,
          verified: true
        },
        {
          id: 'ana-2',
          text: 'Test GA tracking in Google Analytics Real-time dashboard',
          link: 'https://analytics.google.com/',
          external: true,
          critical: true
        },
        {
          id: 'ana-3',
          text: 'Consent banner is working and respects user choices',
          critical: true
        },
        {
          id: 'ana-4',
          text: 'Conversion tracking is set up for key actions',
          critical: false
        }
      ]
    },
    {
      title: 'Payment & Subscriptions',
      icon: Key,
      color: 'from-green-500 to-emerald-600',
      items: [
        {
          id: 'pay-1',
          text: 'Stripe webhook is configured and tested',
          critical: true
        },
        {
          id: 'pay-2',
          text: 'All subscription plans are properly configured',
          critical: true
        },
        {
          id: 'pay-3',
          text: 'Test successful payment flow',
          critical: true
        },
        {
          id: 'pay-4',
          text: 'Test failed payment handling',
          critical: false
        },
        {
          id: 'pay-5',
          text: 'Verify subscription cancellation works',
          critical: false
        }
      ]
    },
    {
      title: 'User Experience',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
      items: [
        {
          id: 'ux-1',
          text: 'Test guest user experience (no signup required)',
          critical: true
        },
        {
          id: 'ux-2',
          text: 'Test new user onboarding flow',
          critical: true
        },
        {
          id: 'ux-3',
          text: 'Verify all main features are accessible',
          critical: true
        },
        {
          id: 'ux-4',
          text: 'Test mobile responsiveness on real devices',
          critical: true
        },
        {
          id: 'ux-5',
          text: 'Verify PWA installation works',
          critical: false
        },
        {
          id: 'ux-6',
          text: 'Test Kids Mode activation and restrictions',
          critical: true
        }
      ]
    },
    {
      title: 'Core Features',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      items: [
        {
          id: 'feat-1',
          text: 'Test Infinity Book (Ruby\'s Life Story) is prominently displayed',
          critical: true,
          verified: true
        },
        {
          id: 'feat-2',
          text: 'Verify AI coaches (Grief, Life, SoulLink) are working',
          critical: true
        },
        {
          id: 'feat-3',
          text: 'Test journal creation and saving',
          critical: true
        },
        {
          id: 'feat-4',
          text: 'Test task creation and reminders',
          critical: true
        },
        {
          id: 'feat-5',
          text: 'Verify wellness tracking saves correctly',
          critical: true
        },
        {
          id: 'feat-6',
          text: 'Test family hub and member management',
          critical: false
        }
      ]
    },
    {
      title: 'Legal & Compliance',
      icon: FileText,
      color: 'from-slate-500 to-gray-600',
      items: [
        {
          id: 'leg-1',
          text: 'Privacy Policy is up to date and accessible',
          critical: true
        },
        {
          id: 'leg-2',
          text: 'Terms of Service are up to date and accessible',
          critical: true
        },
        {
          id: 'leg-3',
          text: 'Legal Disclaimer is displayed appropriately',
          critical: true
        },
        {
          id: 'leg-4',
          text: 'GDPR compliance verified (data export available)',
          critical: true
        },
        {
          id: 'leg-5',
          text: 'COPPA compliance verified (Kids Mode)',
          critical: true
        }
      ]
    },
    {
      title: 'Infrastructure',
      icon: Database,
      color: 'from-teal-500 to-cyan-600',
      items: [
        {
          id: 'inf-1',
          text: 'All environment variables are set in production',
          critical: true
        },
        {
          id: 'inf-2',
          text: 'Database backups are configured',
          critical: true
        },
        {
          id: 'inf-3',
          text: 'Error monitoring is set up (optional but recommended)',
          critical: false
        },
        {
          id: 'inf-4',
          text: 'Domain SSL certificate is valid',
          critical: true
        },
        {
          id: 'inf-5',
          text: 'CDN/caching is configured for assets',
          critical: false
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Settings,
      color: 'from-pink-500 to-rose-600',
      items: [
        {
          id: 'not-1',
          text: 'OneSignal push notifications are configured',
          critical: false
        },
        {
          id: 'not-2',
          text: 'Email notifications are working (SendGrid)',
          critical: true
        },
        {
          id: 'not-3',
          text: 'SMS notifications are working (Twilio)',
          critical: false
        },
        {
          id: 'not-4',
          text: 'Users can manage notification preferences',
          critical: true
        }
      ]
    }
  ];

  const totalItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const criticalItems = checklistCategories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.critical).length,
    0
  );
  const checkedCriticalCount = checklistCategories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.critical && checkedItems[item.id]).length,
    0
  );

  const isReadyToLaunch = checkedCriticalCount === criticalItems;
  const completionPercentage = Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-xl">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Launch Readiness Checklist</h1>
          <p className="text-lg text-gray-600">Complete all critical items before going live</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{completionPercentage}%</div>
                  <div className="text-sm opacity-90">Overall Progress</div>
                  <div className="mt-2 text-xs opacity-75">{checkedCount} of {totalItems} items</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{checkedCriticalCount}/{criticalItems}</div>
                  <div className="text-sm opacity-90">Critical Items</div>
                  <div className="mt-2 text-xs opacity-75">Must complete all</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {isReadyToLaunch ? '✅' : '⏳'}
                  </div>
                  <div className="text-sm opacity-90">Launch Status</div>
                  <div className="mt-2 text-xs opacity-75">
                    {isReadyToLaunch ? 'Ready to Deploy!' : 'Complete critical items'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Launch Status Alert */}
        {isReadyToLaunch ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong className="font-bold">🎉 Ready for Launch!</strong> All critical items are complete. Your app is ready to be published to production!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong className="font-bold">Action Required:</strong> Complete all {criticalItems - checkedCriticalCount} remaining critical items before launching.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Links */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="justify-start">
              <Link to={createPageUrl('SecurityAudit')}>
                <Shield className="w-4 h-4 mr-2" />
                Security Audit
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4 mr-2" />
                Google Analytics
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to={createPageUrl('Home')}>
                <Rocket className="w-4 h-4 mr-2" />
                Test Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Checklist Categories */}
        <div className="space-y-6">
          {checklistCategories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${category.color} rounded-lg shadow-md`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    {category.title}
                    <span className="ml-auto text-sm font-normal text-gray-600">
                      {category.items.filter(item => checkedItems[item.id]).length}/{category.items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                          checkedItems[item.id]
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                        }`}
                        onClick={() => toggleCheck(item.id)}
                      >
                        <button
                          className="mt-0.5 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCheck(item.id);
                          }}
                        >
                          {checkedItems[item.id] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${checkedItems[item.id] ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                              {item.text}
                            </span>
                            {item.critical && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                                CRITICAL
                              </span>
                            )}
                            {item.verified && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                                ✓ VERIFIED
                              </span>
                            )}
                          </div>
                          {item.link && (
                            <div className="mt-1">
                              {item.external ? (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Open in new tab
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <Link
                                  to={item.link}
                                  className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Go to page
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Deployment Instructions */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Rocket className="w-5 h-5" />
              Ready to Deploy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-purple-900 space-y-2">
              <p className="font-semibold">Once all critical items are checked:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Ensure you're on the latest version of your code</li>
                <li>Deploy to production via Base44 dashboard</li>
                <li>Verify the production URL is accessible</li>
                <li>Test key user flows on production</li>
                <li>Monitor Google Analytics for the first 24 hours</li>
                <li>Keep error logs handy for any issues</li>
              </ol>
            </div>
            
            {isReadyToLaunch && (
              <div className="pt-4 border-t border-purple-200">
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg text-lg py-6"
                  size="lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy to Production
                </Button>
                <p className="text-xs text-center text-purple-600 mt-2">
                  This will publish DobryLife to your production domain
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Footer */}
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center text-sm text-gray-600">
            <p>Need help with deployment? Contact support or review the Base44 documentation.</p>
            <div className="flex justify-center gap-4 mt-3">
              <a href="https://base44.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="mailto:contact@dobrylife.com" className="text-blue-600 hover:underline">
                Get Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}