
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client'; // Added missing import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, UserPlus, Upload, Check } from 'lucide-react';
import { toast } from 'sonner'; // Added for toast notifications

// Assuming 'base44' is an available global object or imported from a framework/SDK.
// If not, you would need to import it or define it, e.g.:
// import * as base44 from '@/lib/base44';
// The original 'inviteContact' import is removed as the outline suggests using base44.functions.invoke
// import { inviteContact } from '@/functions/inviteContact';

export default function ContactInviter() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [inviteMethod, setInviteMethod] = useState('email');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);
  const [csvContacts, setCsvContacts] = useState([]);

  const handleSingleInvite = async (e) => {
    e.preventDefault();

    // Validation as per outline
    if (!contactName.trim() || (inviteMethod === 'sms' && !contactPhone.trim()) || (inviteMethod === 'email' && !contactEmail.trim())) {
      toast.error("Please provide a contact name and a valid contact method (phone for SMS, email for Email).");
      return;
    }

    setIsSending(true);

    try {
      // Modified to use base44.functions.invoke as per outline, and existing state variables
      // The "fix" for SMS testing error is to ensure contactPhone/contactEmail are conditionally passed
      await base44.functions.invoke('inviteContact', {
        contactName: contactName,
        contactPhone: inviteMethod === 'sms' ? contactPhone : null, // Conditional passing for SMS
        contactEmail: inviteMethod === 'email' ? contactEmail : null, // Conditional passing for Email
        inviteMethod: inviteMethod,
        personalMessage: personalMessage
      });

      setSentInvites([...sentInvites, { name: contactName, method: inviteMethod }]);
      
      // Reset form
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setPersonalMessage('');

      toast.success(`Invitation sent to ${contactName} via ${inviteMethod}!`); // Using toast for success
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation. Please try again.'); // Using toast for error
    } finally {
      setIsSending(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const rows = text.split('\n').slice(1); // Skip header
      
      const contacts = rows.map(row => {
        const [name, phone, email] = row.split(',');
        return { name: name?.trim(), phone: phone?.trim(), email: email?.trim() };
      }).filter(c => c.name); // Filter out rows without a name

      setCsvContacts(contacts);
    };
    reader.readAsText(file);
  };

  const handleBulkInvite = async () => {
    setIsSending(true);
    let successCount = 0;
    let failedContacts = [];

    for (const contact of csvContacts) {
      // Determine invite method for bulk based on available contact info
      const method = contact.email ? 'email' : (contact.phone ? 'sms' : null);

      if (!contact.name || !method) {
        console.warn(`Skipping invite for contact ${contact.name || 'Unknown'}: Missing name or contact method.`);
        failedContacts.push(contact.name || 'Unknown');
        continue;
      }

      try {
        // Modified to use base44.functions.invoke for consistency
        await base44.functions.invoke('inviteContact', {
          contactName: contact.name,
          contactPhone: method === 'sms' ? contact.phone : null, // Conditional passing for SMS
          contactEmail: method === 'email' ? contact.email : null, // Conditional passing for Email
          inviteMethod: method,
          personalMessage: personalMessage // Use the personal message from the form for bulk invites
        });
        successCount++;
        setSentInvites([...sentInvites, { name: contact.name, method }]);
      } catch (error) {
        console.error(`Failed to invite ${contact.name}:`, error);
        failedContacts.push(contact.name);
      }
    }

    setCsvContacts([]);
    setIsSending(false);

    if (successCount > 0) {
      toast.success(`Successfully sent ${successCount} invitations!`);
    }
    if (failedContacts.length > 0) {
      toast.error(`Failed to send invitations to: ${failedContacts.join(', ')}. Check console for details.`);
    }
    if (successCount === 0 && failedContacts.length === 0) {
      toast.info('No valid contacts were processed for bulk invitation.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            Invite Family & Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSingleInvite} className="space-y-4">
            <div>
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <Label htmlFor="inviteMethod">Invitation Method</Label>
              <Select value={inviteMethod} onValueChange={setInviteMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      SMS / Text Message
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inviteMethod === 'sms' ? (
              <div>
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="personalMessage">Personal Message (Optional)</Label>
              <Textarea
                id="personalMessage"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Add a personal touch to your invitation..."
                className="h-20"
              />
            </div>

            <Button
              type="submit"
              disabled={isSending}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isSending ? 'Sending...' : `Send Invitation via ${inviteMethod === 'email' ? 'Email' : 'SMS'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Bulk Invite from CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with columns: Name, Phone, Email
          </p>
          
          <Input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            disabled={isSending}
          />

          {csvContacts.length > 0 && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {csvContacts.length} contacts loaded
                </p>
              </div>

              <Button
                onClick={handleBulkInvite}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {isSending ? 'Sending...' : `Send ${csvContacts.length} Invitations`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sent Invites */}
      {sentInvites.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Sent Invitations ({sentInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentInvites.map((invite, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium">{invite.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {invite.method}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
