import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const triggerTypes = [
  {
    id: 'task_created',
    name: 'Task Created',
    description: 'Triggers when a new task is created',
    icon: '✅',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'task_completed',
    name: 'Task Completed',
    description: 'Triggers when a task is marked as complete',
    icon: '🎉',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'wellness_logged',
    name: 'Wellness Entry Logged',
    description: 'Triggers when wellness data is logged',
    icon: '💚',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'journal_entry',
    name: 'Journal Entry Created',
    description: 'Triggers when a new journal entry is created',
    icon: '📝',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'baby_milestone',
    name: 'Baby Milestone Achieved',
    description: 'Triggers when a baby milestone is logged',
    icon: '👶',
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'family_event',
    name: 'Family Event Created',
    description: 'Triggers when a family event is scheduled',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'habit_completed',
    name: 'Habit Completed',
    description: 'Triggers when a habit is marked complete',
    icon: '🔥',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'challenge_joined',
    name: 'Challenge Joined',
    description: 'Triggers when user joins a challenge',
    icon: '🏆',
    color: 'from-yellow-500 to-amber-500'
  }
];

export default function ZapierIntegration() {
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    webhook_url: '',
    trigger_type: '',
    enabled: true
  });
  const [showForm, setShowForm] = useState(false);
  const [showUrl, setShowUrl] = useState({});
  const [testingWebhook, setTestingWebhook] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user's Zapier configurations (stored in user metadata or separate entity)
  const { data: zapierConfigs, isLoading } = useQuery({
    queryKey: ['zapierConfigs', user?.email],
    queryFn: async () => {
      if (!user) return [];
      // You could create a ZapierConfig entity or store in user metadata
      // For now, using localStorage as a simple solution
      const stored = localStorage.getItem(`zapier_configs_${user.email}`);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user
  });

  const saveConfigs = (configs) => {
    if (user) {
      localStorage.setItem(`zapier_configs_${user.email}`, JSON.stringify(configs));
      queryClient.invalidateQueries(['zapierConfigs', user.email]);
    }
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.webhook_url || !newWebhook.trigger_type) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedConfigs = [
      ...(zapierConfigs || []),
      {
        ...newWebhook,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
    ];

    saveConfigs(updatedConfigs);
    setNewWebhook({ name: '', webhook_url: '', trigger_type: '', enabled: true });
    setShowForm(false);
    toast.success('Zapier webhook added! 🎉');
  };

  const deleteWebhook = (id) => {
    const updatedConfigs = (zapierConfigs || []).filter(config => config.id !== id);
    saveConfigs(updatedConfigs);
    toast.success('Webhook removed');
  };

  const toggleWebhook = (id) => {
    const updatedConfigs = (zapierConfigs || []).map(config =>
      config.id === id ? { ...config, enabled: !config.enabled } : config
    );
    saveConfigs(updatedConfigs);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const testWebhook = async (webhook) => {
    setTestingWebhook(webhook.id);
    
    try {
      const response = await base44.functions.invoke('sendToZapier', {
        webhook_url: webhook.webhook_url,
        trigger_type: webhook.trigger_type,
        data: {
          test: true,
          message: 'This is a test from Helper33',
          trigger_name: webhook.name,
          timestamp: new Date().toISOString()
        }
      });

      if (response.data.success) {
        toast.success('Test successful! Check your Zap. ✅');
      } else {
        toast.error('Test failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Test failed: ' + error.message);
    } finally {
      setTestingWebhook(null);
    }
  };

  const selectedTrigger = triggerTypes.find(t => t.id === newWebhook.trigger_type);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-2xl"
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Zapier Integration
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Connect Helper33 to 6,000+ apps with Zapier! Automate your workflows and sync data across your favorite tools.
        </p>
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-orange-600" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold text-sm mb-1">Create a Zap</h3>
                <p className="text-xs text-gray-600">Go to Zapier and create a new Zap with a Webhook trigger</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold text-sm mb-1">Get Webhook URL</h3>
                <p className="text-xs text-gray-600">Copy the webhook URL from your Zap and paste it here</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold text-sm mb-1">Choose Trigger</h3>
                <p className="text-xs text-gray-600">Select what Helper33 event should trigger your Zap</p>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg border-2 border-orange-300">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <p className="text-xs text-orange-900">
                <strong>Pro Tip:</strong> Test your webhook after adding it to make sure everything works!
              </p>
            </div>

            <Button
              onClick={() => window.open('https://zapier.com/apps/webhooks/integrations', '_blank')}
              variant="outline"
              className="w-full border-2 border-orange-300 hover:bg-orange-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Zapier Webhooks Guide
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Webhook Button */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Zapier Webhook
          </Button>
        </motion.div>
      )}

      {/* Add Webhook Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-orange-300 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                  New Zapier Webhook
                </CardTitle>
                <CardDescription>Connect a new Zap to Helper33</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="e.g., Send to Slack, Create Google Calendar Event"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={newWebhook.webhook_url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, webhook_url: e.target.value })}
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get this URL from your Zap's Webhook trigger step
                  </p>
                </div>

                <div>
                  <Label>Trigger Event</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-2">
                    {triggerTypes.map((trigger) => (
                      <motion.button
                        key={trigger.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNewWebhook({ ...newWebhook, trigger_type: trigger.id })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          newWebhook.trigger_type === trigger.id
                            ? `bg-gradient-to-br ${trigger.color} text-white border-transparent shadow-lg`
                            : 'bg-white border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{trigger.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm mb-1 ${
                              newWebhook.trigger_type === trigger.id ? 'text-white' : 'text-gray-900'
                            }`}>
                              {trigger.name}
                            </h4>
                            <p className={`text-xs ${
                              newWebhook.trigger_type === trigger.id ? 'text-white/90' : 'text-gray-500'
                            }`}>
                              {trigger.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={addWebhook}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setNewWebhook({ name: '', webhook_url: '', trigger_type: '', enabled: true });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Webhooks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Your Zaps ({zapierConfigs?.length || 0})
        </h2>

        {isLoading && (
          <Card className="p-8">
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading webhooks...</span>
            </div>
          </Card>
        )}

        {!isLoading && (!zapierConfigs || zapierConfigs.length === 0) && (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Zaps Yet</h3>
            <p className="text-gray-500 mb-6">
              Connect your first Zap to start automating!
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Zap
            </Button>
          </Card>
        )}

        {zapierConfigs && zapierConfigs.length > 0 && (
          <div className="grid gap-4">
            {zapierConfigs.map((webhook, index) => {
              const trigger = triggerTypes.find(t => t.id === webhook.trigger_type);
              return (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-2 hover:shadow-lg transition-all ${
                    webhook.enabled ? 'border-orange-200' : 'border-gray-200 opacity-60'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {trigger && (
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${trigger.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                            {trigger.icon}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 truncate">{webhook.name}</h3>
                              {trigger && (
                                <p className="text-sm text-gray-600">{trigger.name}</p>
                              )}
                            </div>
                            <Badge className={webhook.enabled ? 'bg-green-500' : 'bg-gray-400'}>
                              {webhook.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded-lg truncate font-mono">
                              {showUrl[webhook.id] ? webhook.webhook_url : '••••••••••••••••••••'}
                            </code>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setShowUrl({ ...showUrl, [webhook.id]: !showUrl[webhook.id] })}
                              className="h-8 w-8"
                            >
                              {showUrl[webhook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(webhook.webhook_url)}
                              className="h-8 w-8"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleWebhook(webhook.id)}
                              className="border-orange-300"
                            >
                              {webhook.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testWebhook(webhook)}
                              disabled={!webhook.enabled || testingWebhook === webhook.id}
                              className="border-blue-300"
                            >
                              {testingWebhook === webhook.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Test
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteWebhook(webhook.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Example Use Cases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Example Automation Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '📧', title: 'Task → Email', desc: 'Send email when task completed' },
                { icon: '📅', title: 'Event → Calendar', desc: 'Add family events to Google Calendar' },
                { icon: '💬', title: 'Milestone → Slack', desc: 'Share baby milestones with team' },
                { icon: '📊', title: 'Wellness → Sheets', desc: 'Log wellness data to spreadsheet' },
                { icon: '🔔', title: 'Habit → SMS', desc: 'Get text when habit streak breaks' },
                { icon: '🎯', title: 'Journal → Notion', desc: 'Sync journal entries to Notion' }
              ].map((example, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-purple-200"
                >
                  <span className="text-2xl">{example.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{example.title}</p>
                    <p className="text-xs text-gray-600">{example.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}