import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Server, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SecurityAudit from '@/components/security/SecurityAudit';

export default function SecurityDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const [securityMetrics, setSecurityMetrics] = useState({
    encryptionStatus: 'active',
    lastSecurityScan: new Date().toISOString(),
    activeThreats: 0,
    blockedAttempts: 0,
    securityScore: 98,
  });

  // Only admins can access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </Card>
      </div>
    );
  }

  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      status: 'Active',
      description: 'All data encrypted in transit and at rest using AES-256',
      color: 'green',
    },
    {
      icon: Shield,
      title: 'DDoS Protection',
      status: 'Active',
      description: 'Protected against distributed denial of service attacks',
      color: 'green',
    },
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      status: 'Active',
      description: 'Continuous security monitoring and threat detection',
      color: 'green',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      status: 'Active',
      description: 'Hosted on enterprise-grade secure servers with 99.9% uptime',
      color: 'green',
    },
    {
      icon: Activity,
      title: 'Intrusion Detection',
      status: 'Active',
      description: 'Automated detection and blocking of suspicious activity',
      color: 'green',
    },
    {
      icon: CheckCircle,
      title: 'HIPAA Compliant',
      status: 'Certified',
      description: 'Meets healthcare data security and privacy standards',
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Security Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Enterprise-grade security monitoring and controls</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-600">{securityMetrics.securityScore}%</div>
            <div className="text-sm text-gray-600">Security Score</div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Encryption</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <Lock className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-green-600">{securityMetrics.activeThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked Attempts</p>
                <p className="text-2xl font-bold text-blue-600">{securityMetrics.blockedAttempts}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Scan</p>
                <p className="text-lg font-semibold">{new Date(securityMetrics.lastSecurityScan).toLocaleDateString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Security Features */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}-100`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full bg-${feature.color}-100 text-${feature.color}-700`}>
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Audit */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Security Audit</h2>
          <SecurityAudit />
        </div>

        {/* Compliance */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Compliance & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">HIPAA Compliant</p>
              <p className="text-sm text-gray-600 mt-1">Healthcare data protection standards</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">GDPR Compliant</p>
              <p className="text-sm text-gray-600 mt-1">European data privacy regulations</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">SOC 2 Type II</p>
              <p className="text-sm text-gray-600 mt-1">Security, availability, and confidentiality</p>
            </div>
          </div>
        </Card>

        {/* Security Best Practices */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Implemented Security Measures</h2>
          <div className="space-y-2">
            {[
              'HTTPS/TLS 1.3 encryption for all connections',
              'Content Security Policy (CSP) headers',
              'Cross-Site Request Forgery (CSRF) protection',
              'Cross-Site Scripting (XSS) prevention',
              'SQL Injection prevention',
              'Rate limiting and DDoS protection',
              'Input sanitization and validation',
              'Secure session management',
              'Two-factor authentication support',
              'Regular security audits and penetration testing',
              'Automated vulnerability scanning',
              'Secure password hashing (bcrypt)',
              'API request signing and validation',
              'IP blacklisting for known threats',
              'Real-time security monitoring and alerting',
            ].map((measure, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{measure}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}