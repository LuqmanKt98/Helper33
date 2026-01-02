import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Info, Play,
  Loader2, Lock, Database, FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityAudit() {
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['securityAuditLogs'],
    queryFn: async () => {
      const logs = await base44.entities.SecurityAuditLog.list('-created_date', 10);
      return logs;
    },
    enabled: user?.role === 'admin'
  });

  const runAuditMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runSecurityAudit');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['securityAuditLogs'] });
      toast.success('Security audit completed!');
      setIsRunning(false);
    },
    onError: (error) => {
      toast.error('Audit failed: ' + error.message);
      setIsRunning(false);
    }
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-2 border-red-300">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600">Only administrators can access the security audit dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestAudit = auditLogs?.[0]?.audit_results;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Security Audit Dashboard</h1>
                <p className="text-blue-100">Comprehensive security monitoring and analysis</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsRunning(true);
                runAuditMutation.mutate();
              }}
              disabled={isRunning || runAuditMutation.isPending}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              {isRunning || runAuditMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Security Scan
            </Button>
          </div>
        </motion.div>

        {/* Latest Audit Results */}
        {latestAudit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Latest Audit Results
                  </CardTitle>
                  <Badge className={
                    latestAudit.overall_score >= 80 ? 'bg-green-500' :
                    latestAudit.overall_score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    Score: {latestAudit.overall_score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Performed at {new Date(latestAudit.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Critical Issues */}
                {latestAudit.critical_issues?.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                    <h3 className="font-bold text-red-900 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5" />
                      Critical Issues ({latestAudit.critical_issues.length})
                    </h3>
                    <ul className="space-y-2">
                      {latestAudit.critical_issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {latestAudit.warnings?.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <h3 className="font-bold text-yellow-900 flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5" />
                      Warnings ({latestAudit.warnings.length})
                    </h3>
                    <ul className="space-y-2">
                      {latestAudit.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Security Checks */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Security Checks</h3>
                  <div className="grid gap-3">
                    {latestAudit.checks?.map((check, idx) => {
                      const statusConfig = {
                        PASS: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                        FAIL: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                        WARNING: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        CRITICAL: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                        INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
                      };

                      const config = statusConfig[check.status] || statusConfig.INFO;
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                              <div>
                                <p className="font-semibold text-gray-900">{check.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{check.details}</p>
                              </div>
                            </div>
                            <Badge className={config.color.replace('text-', 'bg-').replace('-600', '-100')}>
                              {check.status}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {latestAudit.recommendations?.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {latestAudit.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Audit History */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-600" />
              Audit History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              </div>
            ) : auditLogs?.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{log.audit_type}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(log.created_date).toLocaleString()} by {log.performed_by}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          log.overall_score >= 80 ? 'bg-green-500' :
                          log.overall_score >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }>
                          {log.overall_score}%
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {log.critical_issues_count} critical • {log.warnings_count} warnings
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No audit logs yet. Run your first security scan!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}