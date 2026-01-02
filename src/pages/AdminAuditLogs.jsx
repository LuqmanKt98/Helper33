import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Shield, Search, Clock, User, FileText,
  CheckCircle, X, Trash2, Settings, AlertCircle
} from 'lucide-react';
import SEO from '@/components/SEO';

export default function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 500),
    initialData: []
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    
    const matchesDate = filterDate === 'all' || (() => {
      const logDate = new Date(log.created_date);
      const now = new Date();
      const daysDiff = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));
      
      if (filterDate === 'today') return daysDiff === 0;
      if (filterDate === 'week') return daysDiff <= 7;
      if (filterDate === 'month') return daysDiff <= 30;
      return true;
    })();
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const actionTypes = [...new Set(logs.map(l => l.action_type))];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Admin Access Required</h2>
            <p className="text-gray-600">You need admin privileges to access audit logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Audit Logs | Helper33" />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-800">Admin Audit Logs</h1>
            </div>
            <p className="text-gray-600">Track all administrative actions and changes</p>
          </motion.div>

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 mb-6 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by admin, entity, or action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-purple-300"
                  />
                </div>
                
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Actions</option>
                  {actionTypes.map(action => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                Showing {filteredLogs.length} of {logs.length} log entries
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredLogs.map((log, idx) => (
              <LogEntry key={log.id} log={log} index={idx} />
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">No logs found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function LogEntry({ log, index }) {
  const getActionIcon = (actionType) => {
    if (actionType.includes('approved')) return CheckCircle;
    if (actionType.includes('rejected')) return X;
    if (actionType.includes('deleted')) return Trash2;
    if (actionType.includes('settings')) return Settings;
    return FileText;
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('approved')) return 'from-green-500 to-emerald-500';
    if (actionType.includes('rejected')) return 'from-red-500 to-rose-500';
    if (actionType.includes('deleted')) return 'from-orange-500 to-red-500';
    if (actionType.includes('settings')) return 'from-blue-500 to-indigo-500';
    return 'from-purple-500 to-pink-500';
  };

  const Icon = getActionIcon(log.action_type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActionColor(log.action_type)} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 capitalize mb-1">
                    {log.action_type.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {log.admin_name || log.admin_email}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.entity_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_date).toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                {log.entity_name && (
                  <p>
                    <span className="font-semibold">Entity:</span> {log.entity_name}
                  </p>
                )}
                {log.notes && (
                  <p>
                    <span className="font-semibold">Notes:</span> {log.notes}
                  </p>
                )}
                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-purple-600 hover:text-purple-700 font-semibold">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}