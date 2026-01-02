import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  CheckCircle,
  Upload,
  AlertCircle,
  Shield,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  Search,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactSync({ user, onClose }) {
  const [showConsent, setShowConsent] = useState(!user.contacts_synced);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [uploadedContacts, setUploadedContacts] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: syncedConnections = [] } = useQuery({
    queryKey: ['syncedContacts'],
    queryFn: () => base44.entities.ContactConnection.filter({ synced_from_contacts: true }),
    enabled: !!user
  });

  const syncContactsMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ 
        contacts_synced: true,
        contacts_sync_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowConsent(false);
      toast.success('Contact sync enabled! 🎉');
    }
  });

  const unsyncContactsMutation = useMutation({
    mutationFn: async () => {
      // Delete all synced connections
      for (const conn of syncedConnections) {
        await base44.entities.ContactConnection.delete(conn.id);
      }
      await base44.auth.updateMe({ 
        contacts_synced: false,
        contacts_sync_date: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['syncedContacts']);
      setUploadedContacts([]);
      setMatchResults(null);
      toast.success('Contacts unsynced and removed');
    }
  });

  const createConnectionMutation = useMutation({
    mutationFn: async ({ contactEmail, contactName, contactPhone }) => {
      return base44.entities.ContactConnection.create({
        connection_type: 'synced_contact',
        other_user_email: contactEmail,
        other_user_name: contactName,
        phone_number: contactPhone,
        synced_from_contacts: true,
        status: 'accepted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['syncedContacts']);
    }
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: (connectionId) => base44.entities.ContactConnection.delete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['syncedContacts']);
      toast.success('Contact removed');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        const contacts = lines.slice(1).map(line => {
          const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
          return {
            name: parts[0] || 'Unknown',
            phone: parts[1] || '',
            email: parts[2] || ''
          };
        }).filter(c => c.email || c.phone);

        setUploadedContacts(contacts);
        toast.success(`📥 Loaded ${contacts.length} contacts`);
      } catch (error) {
        toast.error('Failed to parse file. Use CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const handleManualAdd = () => {
    if (!manualEmail && !manualPhone) {
      toast.error('Enter at least an email or phone number');
      return;
    }

    const newContact = {
      name: manualName || 'Contact',
      phone: manualPhone,
      email: manualEmail
    };

    setUploadedContacts([...uploadedContacts, newContact]);
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    toast.success('Contact added!');
  };

  const matchContacts = async () => {
    if (uploadedContacts.length === 0) {
      toast.error('No contacts to match');
      return;
    }

    setIsMatching(true);
    const matches = [];
    const nonMatches = [];

    for (const contact of uploadedContacts) {
      if (contact.email) {
        const users = await base44.entities.User.filter({ email: contact.email });
        
        if (users.length > 0) {
          const matchedUser = users[0];
          const profiles = await base44.entities.UserCommunityProfile.filter({ 
            created_by: matchedUser.email 
          });
          
          matches.push({
            ...contact,
            matchedUser,
            profile: profiles[0],
            isOnPlatform: true
          });
        } else {
          nonMatches.push({
            ...contact,
            isOnPlatform: false
          });
        }
      } else {
        nonMatches.push({
          ...contact,
          isOnPlatform: false
        });
      }
    }

    setMatchResults({ matches, nonMatches });
    setIsMatching(false);
    toast.success(`Found ${matches.length} contacts on Helper33! ✨`);
  };

  const connectWithMatched = async (match) => {
    await createConnectionMutation.mutateAsync({
      contactEmail: match.matchedUser.email,
      contactName: match.name,
      contactPhone: match.phone
    });
    toast.success(`Connected with ${match.name}! 🎉`);
  };

  const inviteNonMatched = (contact) => {
    const message = encodeURIComponent(
      `Hey ${contact.name}! I'm using Helper33 - a wellness & support app. Join me! ${window.location.origin}?ref=${user.email}`
    );
    
    if (contact.phone) {
      window.open(`sms:${contact.phone}?body=${message}`, '_blank');
    } else if (contact.email) {
      const subject = encodeURIComponent('Join me on Helper33! 💜');
      window.open(`mailto:${contact.email}?subject=${subject}&body=${message}`, '_blank');
    }
    toast.success('Opening invite... 📧');
  };

  const downloadTemplate = () => {
    const csv = 'Name,Phone,Email\nJohn Doe,555-0123,john@example.com\nJane Smith,555-0124,jane@example.com';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded! 📥');
  };

  if (showConsent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className="border-4 border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-7 h-7 text-purple-600" />
              Privacy & Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-white rounded-xl border-2 border-purple-300">
              <h3 className="font-bold text-lg text-purple-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                How Contact Sync Works
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You upload or enter your contacts manually (names, emails, phone numbers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>We'll check which contacts are already on Helper33</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You can instantly connect with matched contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Invite non-users via text or email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You can unsync and delete all data anytime</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-bold mb-2">🔒 Your Privacy Matters</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Contact data is only used for matching and connecting</li>
                    <li>• We never sell or share your contacts with third parties</li>
                    <li>• Your contacts won't be notified unless you invite them</li>
                    <li>• You can delete all synced data anytime</li>
                    <li>• All data is encrypted and secure</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => syncContactsMutation.mutate()}
                disabled={syncContactsMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg py-6"
              >
                {syncContactsMutation.isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    I Understand, Continue
                  </>
                )}
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline" className="px-6">
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-1">Contact Sync</h2>
                  <p className="text-blue-700 text-sm">Find friends already on Helper33</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white shadow-lg">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Synced Contacts Summary */}
      {syncedConnections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-bold text-purple-900 text-lg">
                      {syncedConnections.length} Synced Contact{syncedConnections.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-purple-700">Connected via contact sync</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (confirm('Remove all synced contacts? You can re-sync later.')) {
                      unsyncContactsMutation.mutate();
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={unsyncContactsMutation.isLoading}
                >
                  {unsyncContactsMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Unsync All
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {syncedConnections.map((conn, idx) => (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {conn.other_user_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{conn.other_user_name}</p>
                        <p className="text-xs text-gray-600">{conn.phone_number || conn.other_user_email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteConnectionMutation.mutate(conn.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      disabled={deleteConnectionMutation.isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upload/Add Contacts */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-green-600" />
            Add Contacts to Sync
          </CardTitle>
          <CardDescription>
            Upload a CSV file or add contacts manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="p-4 bg-white rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 transition-all">
            <label className="cursor-pointer block text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-green-900 mb-1">Upload CSV File</p>
              <p className="text-xs text-green-700 mb-2">
                Format: Name, Phone, Email
              </p>
              <Button size="sm" variant="outline" className="border-green-400">
                Choose File
              </Button>
            </label>
          </div>

          <Button
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="w-full border-green-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>

          {/* Manual Add */}
          <div className="p-4 bg-white rounded-xl border-2 border-blue-300">
            <p className="font-bold text-blue-900 mb-3">➕ Add Contact Manually</p>
            <div className="space-y-2">
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Name"
                className="border-2"
              />
              <Input
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="Phone (optional)"
                type="tel"
                className="border-2"
              />
              <Input
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="border-2"
              />
              <Button
                onClick={handleManualAdd}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          {/* Uploaded Contacts Preview */}
          {uploadedContacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-purple-50 rounded-xl border-2 border-purple-300"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-purple-900">
                  📋 {uploadedContacts.length} Contact{uploadedContacts.length !== 1 ? 's' : ''} Ready
                </p>
                <Button
                  onClick={() => setUploadedContacts([])}
                  size="sm"
                  variant="ghost"
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto mb-3">
                {uploadedContacts.slice(0, 5).map((contact, idx) => (
                  <div key={idx} className="text-xs text-purple-800 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {contact.name} • {contact.email || contact.phone}
                  </div>
                ))}
                {uploadedContacts.length > 5 && (
                  <p className="text-xs text-purple-600 font-semibold">
                    + {uploadedContacts.length - 5} more...
                  </p>
                )}
              </div>
              <Button
                onClick={matchContacts}
                disabled={isMatching}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Find Contacts on Helper33
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Match Results */}
      <AnimatePresence>
        {matchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Matches */}
            {matchResults.matches.length > 0 && (
              <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Sparkles className="w-6 h-6 text-green-600" />
                    ✨ {matchResults.matches.length} Contact{matchResults.matches.length !== 1 ? 's' : ''} on Helper33!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matchResults.matches.map((match, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-white rounded-xl border-2 border-green-200 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                            {match.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{match.name}</p>
                            <p className="text-xs text-green-600">✓ On Helper33</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => connectWithMatched(match)}
                          disabled={createConnectionMutation.isLoading}
                          className="bg-green-600 hover:bg-green-700 shadow-lg"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Non-Matches - Invite */}
            {matchResults.nonMatches.length > 0 && (
              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Send className="w-6 h-6 text-blue-600" />
                    Invite {matchResults.nonMatches.length} Contact{matchResults.nonMatches.length !== 1 ? 's' : ''} to Helper33
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {matchResults.nonMatches.map((contact, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-white rounded-xl border-2 border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {contact.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-600">{contact.email || contact.phone}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => inviteNonMatched(contact)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setUploadedContacts([]);
            setMatchResults(null);
          }}
          variant="outline"
          className="flex-1"
        >
          Reset
        </Button>
        {onClose && (
          <Button onClick={onClose} className="flex-1 bg-purple-600">
            Done
          </Button>
        )}
      </div>
    </div>
  );
}