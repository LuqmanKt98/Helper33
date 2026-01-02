import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  FileCheck,
  Key,
  Database,
  Code,
  Users,
  Bell,
  FileText,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityFramework() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'rls', name: 'Row-Level Security', icon: Lock },
    { id: 'encryption', name: 'Encryption', icon: Key },
    { id: 'auth', name: 'Authentication', icon: Users },
    { id: 'api', name: 'API Security', icon: Code },
    { id: 'compliance', name: 'Compliance', icon: FileCheck },
    { id: 'incident', name: 'Incident Response', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">DobryLife Security Framework</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive security measures protecting 89 entities and all user data
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-sm">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      Security Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                      <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        All 89 Entities Secured
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">Row-Level Security (RLS)</p>
                            <p className="text-sm text-gray-600">Users can only access their own data</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">Data Isolation</p>
                            <p className="text-sm text-gray-600">Complete privacy between users</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">AES-256 Encryption</p>
                            <p className="text-sm text-gray-600">Military-grade data protection</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">Admin-Only Access</p>
                            <p className="text-sm text-gray-600">Sensitive operations protected</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <Lock className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-bold text-gray-900 mb-1">Create</h4>
                        <p className="text-sm text-gray-600">Only authenticated users via created_by</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <Eye className="w-8 h-8 text-purple-600 mb-2" />
                        <h4 className="font-bold text-gray-900 mb-1">Read</h4>
                        <p className="text-sm text-gray-600">Users see only their own records</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <Shield className="w-8 h-8 text-green-600 mb-2" />
                        <h4 className="font-bold text-gray-900 mb-1">Update/Delete</h4>
                        <p className="text-sm text-gray-600">Modify only own data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Protected Entity Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { category: 'Personal Data', count: 25, items: 'Journals, Tasks, Wellness, Notes' },
                        { category: 'Family Data', count: 18, items: 'Members, Events, Chat, Documents' },
                        { category: 'AI Interactions', count: 12, items: 'Conversations, Agents, Responses' },
                        { category: 'Professional', count: 10, items: 'Caregivers, Consultants, Bookings' },
                        { category: 'Content', count: 15, items: 'Templates, Memories, Stories' },
                        { category: 'System', count: 9, items: 'Settings, Badges, Rewards' },
                      ].map((cat) => (
                        <div key={cat.category} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-gray-900">{cat.category}</h5>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                              {cat.count} entities
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{cat.items}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'rls' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-6 h-6 text-blue-600" />
                      Row-Level Security (RLS)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-bold text-lg text-blue-900 mb-3">What is RLS?</h3>
                      <p className="text-gray-700 mb-4">
                        Row-Level Security ensures that each user can only access their own data. 
                        Every database query automatically filters results based on the authenticated user's email.
                      </p>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono">
{`{
  "rls": {
    "create": { "created_by": "{{user.email}}" },
    "read": { "created_by": "{{user.email}}" },
    "update": { "created_by": "{{user.email}}" },
    "delete": { "created_by": "{{user.email}}" }
  }
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">RLS Implementation Across Entities:</h4>
                      <div className="space-y-2">
                        {[
                          'Journal entries - Users see only their own entries',
                          'Tasks & wellness logs - Complete privacy',
                          'Family data - Shared within family group only',
                          'AI conversations - Private to user',
                          'Payment records - User-specific via Stripe',
                          'Support coaches - Creator ownership',
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'encryption' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-6 h-6 text-purple-600" />
                      Encryption Standards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Data at Rest
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>AES-256 encryption</strong> for all database records</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Encrypted backups</strong> stored securely</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>File encryption</strong> for uploads and media</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Data in Transit
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>TLS 1.3</strong> for all API communication</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>HTTPS enforced</strong> on all connections</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Secure WebSocket</strong> connections for real-time data</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Key Management
                      </h5>
                      <p className="text-sm text-gray-700">
                        All encryption keys are managed by Base44/Supabase infrastructure with automatic rotation, 
                        hardware security modules (HSM), and multi-region redundancy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'auth' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-green-600" />
                      Authentication & Authorization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-4">Authentication Flow</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            1
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">User Login</p>
                            <p className="text-sm text-gray-600">Secure JWT token issued after email/password or OAuth verification</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            2
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Token Validation</p>
                            <p className="text-sm text-gray-600">Every API request validates the JWT token and extracts user identity</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            3
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">RLS Enforcement</p>
                            <p className="text-sm text-gray-600">Database automatically filters data based on authenticated user</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            4
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Session Expiration</p>
                            <p className="text-sm text-gray-600">Tokens expire after 24 hours, requiring re-authentication</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Role-Based Access Control (RBAC)</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                          <h5 className="font-bold text-blue-900 mb-2">👤 Regular User</h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Access own data only</li>
                            <li>• Create journal entries, tasks</li>
                            <li>• Manage own profile</li>
                            <li>• Join family groups</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                          <h5 className="font-bold text-purple-900 mb-2">👑 Admin User</h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• All user permissions</li>
                            <li>• Approve caregivers/mentors</li>
                            <li>• Manage content and blog</li>
                            <li>• View feedback and analytics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'api' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-6 h-6 text-indigo-600" />
                      API Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-4">Backend Function Security</h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                        <pre className="text-green-400 text-xs font-mono">
{`// ✅ SECURE: Always validate authentication
const user = await base44.auth.me();
if (!user) {
  return Response.json(
    { error: 'Unauthorized' }, 
    { status: 401 }
  );
}

// ✅ SECURE: Validate all inputs
if (!email || !email.includes('@')) {
  return Response.json(
    { error: 'Invalid email' }, 
    { status: 400 }
  );
}

// ✅ SECURE: Use service role carefully
// Only for admin-level operations
if (user.role === 'admin') {
  const data = await base44.asServiceRole
    .entities.SomeEntity.list();
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Security Measures</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Rate Limiting', desc: '100 requests/min per user, 10 failed logins max' },
                          { title: 'Input Validation', desc: 'All user inputs sanitized to prevent SQL injection and XSS' },
                          { title: 'CORS Protection', desc: 'Only allowed origins can access the API' },
                          { title: 'Webhook Verification', desc: 'All webhooks verify signatures (Stripe, etc.)' },
                          { title: 'File Upload Limits', desc: '50MB max, type validation, virus scanning' },
                          { title: 'Error Handling', desc: 'Never expose stack traces or internal details to users' },
                        ].map((measure, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-gray-900">{measure.title}</p>
                                <p className="text-sm text-gray-600">{measure.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'compliance' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="w-6 h-6 text-blue-600" />
                      Compliance & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                          <h4 className="font-bold text-blue-900">GDPR Compliant</h4>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>✓ User data export functionality</li>
                          <li>✓ Right to be forgotten (account deletion)</li>
                          <li>✓ Clear privacy policy and consent</li>
                          <li>✓ 72-hour breach notification</li>
                          <li>✓ Data minimization practices</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <h4 className="font-bold text-green-900">COPPA Guidelines</h4>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>✓ Parental consent for under-13</li>
                          <li>✓ Kids journal entries are private</li>
                          <li>✓ Age-appropriate content filtering</li>
                          <li>✓ No marketing to children</li>
                          <li>✓ Guardian access controls</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                          <h4 className="font-bold text-purple-900">PCI DSS (Stripe)</h4>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>✓ No card data stored in our database</li>
                          <li>✓ Stripe handles all payment processing</li>
                          <li>✓ Webhook signature verification</li>
                          <li>✓ Secure checkout sessions</li>
                          <li>✓ PCI Level 1 certified via Stripe</li>
                        </ul>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                          <h4 className="font-bold text-amber-900">SOC 2 (In Progress)</h4>
                        </div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>⏳ Security controls documentation</li>
                          <li>⏳ Third-party audit scheduled</li>
                          <li>✓ Access control policies</li>
                          <li>✓ Incident response procedures</li>
                          <li>✓ Regular security assessments</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'incident' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-6 h-6 text-red-600" />
                      Incident Response Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                      <h4 className="font-bold text-red-900 mb-4">If Security Breach Detected</h4>
                      <div className="space-y-3">
                        {[
                          { step: 1, action: 'Immediate', detail: 'Lock down affected accounts and systems' },
                          { step: 2, action: 'Notify', detail: 'Contact users within 72 hours (GDPR requirement)' },
                          { step: 3, action: 'Investigate', detail: 'Review audit logs and access patterns' },
                          { step: 4, action: 'Patch', detail: 'Fix vulnerability immediately' },
                          { step: 5, action: 'Report', detail: 'File incident report to authorities if required' },
                          { step: 6, action: 'Learn', detail: 'Update security measures to prevent recurrence' },
                        ].map((item) => (
                          <div key={item.step} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-200">
                            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                              {item.step}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.action}</p>
                              <p className="text-sm text-gray-600">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3">Emergency Contacts</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <strong>Security Lead:</strong> contact@dobrylife.com
                        </p>
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <strong>Legal Team:</strong> contact@dobrylife.com
                        </p>
                        <p className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <strong>Base44 Support:</strong> support@base44.com
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">Response Times</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>🚨 <strong>Critical security issues:</strong> &lt; 1 hour</p>
                        <p>🔒 <strong>Privacy concerns:</strong> &lt; 24 hours</p>
                        <p>💬 <strong>General issues:</strong> &lt; 48 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                <p className="mb-4 opacity-90">
                  Contact our security team for questions or to report concerns
                </p>
                <a href="mailto:contact@dobrylife.com">
                  <Button size="lg" variant="secondary" className="font-bold">
                    📧 contact@dobrylife.com
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}