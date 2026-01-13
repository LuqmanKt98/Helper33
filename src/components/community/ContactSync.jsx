import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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
  const [showConsent, setShowConsent] = useState(!user?.contacts_synced);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [uploadedContacts, setUploadedContacts] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const queryClient = useQueryClient();

  const syncContactsMutation = useMutation({
    mutationFn: async () => {
      // In a real app, we would store this preference in the profile
      // For now, we just acknowledge it locally or update profile if column exists
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Could not update profile preference', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setShowConsent(false);
      toast.success('Contact sync enabled! 🎉');
    }
  });

  const createConnectionMutation = useMutation({
    mutationFn: async ({ contactEmail, contactName, contactId }) => {
      // Create a friend request
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          receiver_id: contactId,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Friend request sent! ✨');
    },
    onError: (error) => {
      toast.error('Failed to send request');
      console.error(error);
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
        const { data: matchedUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', contact.email)
          .single();

        if (matchedUser) {
          // check if already friends?
          const { count } = await supabase
            .from('friend_requests')
            .select('*', { count: 'exact', head: true })
            .or(`and(requester_id.eq.${user.id},receiver_id.eq.${matchedUser.id}),and(requester_id.eq.${matchedUser.id},receiver_id.eq.${user.id})`);

          matches.push({
            ...contact,
            matchedUser,
            isOnPlatform: true,
            isConnected: count > 0 // rough check
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
      contactId: match.matchedUser.id
    });
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
              </ul>
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                            {match.isConnected && <p className="text-xs text-blue-500">Already Connected</p>}
                          </div>
                        </div>
                        {match.isConnected ? (
                          <Button size="sm" variant="outline" disabled>Connected</Button>
                        ) : (
                          <Button
                            onClick={() => connectWithMatched(match)}
                            disabled={createConnectionMutation.isLoading}
                            className="bg-green-600 hover:bg-green-700 shadow-lg"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
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