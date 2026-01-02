import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  MessageSquare, 
  Send,
  Copy,
  Share2,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { inviteContact } from '@/functions/inviteContact';

export default function ContactInviter({ onClose }) {
  const [inviteMethod, setInviteMethod] = useState('phone'); // phone, email, link
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Demo contacts for simulation
  const demoContacts = [
    { id: 1, name: 'Sarah Johnson', phone: '+1 (555) 123-4567', email: 'sarah.j@email.com', hasApp: false },
    { id: 2, name: 'Mike Chen', phone: '+1 (555) 234-5678', email: 'mike.c@email.com', hasApp: true },
    { id: 3, name: 'Emma Davis', phone: '+1 (555) 345-6789', email: 'emma.d@email.com', hasApp: false },
    { id: 4, name: 'James Wilson', phone: '+1 (555) 456-7890', email: 'james.w@email.com', hasApp: false },
  ];

  const handleImportContacts = async () => {
    // In a real app, this would access device contacts
    // For demo, we'll use mock data
    try {
      // Simulated contact access
      alert('Contact access requested. In a real app, this would access your phone contacts.');
      setContacts(demoContacts);
    } catch (error) {
      alert('Contact access denied or not available in web browser.');
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getInviteLink = () => {
    return `${window.location.origin}/join`;
  };

  const getInviteMessage = () => {
    const defaultMessage = `Hi! I've been using DobryLife - it's an amazing compassionate AI platform that's helped me so much with daily support and wellness. I think you'd really benefit from it too. It's completely free to join! ${getInviteLink()}`;
    
    return customMessage || defaultMessage;
  };

  const handleSendInvites = async () => {
    setIsSending(true);
    
    try {
      const message = getInviteMessage();
      
      if (inviteMethod === 'phone' || inviteMethod === 'sms') {
        if (selectedContacts.length > 0) {
          for (const contactId of selectedContacts) {
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
              await inviteContact({
                contactName: contact.name,
                contactPhone: contact.phone,
                inviteMethod: 'sms',
                personalMessage: customMessage
              });
            }
          }
          alert(`✅ Sent ${selectedContacts.length} SMS invitation(s)!`);
        } else if (phoneNumber && contactName) {
          await inviteContact({
            contactName,
            contactPhone: phoneNumber,
            inviteMethod: 'sms',
            personalMessage: customMessage
          });
          alert('✅ SMS invitation sent!');
        } else {
          alert('Please enter a contact name and phone number.');
          setIsSending(false);
          return;
        }
      } else if (inviteMethod === 'email') {
        if (selectedContacts.length > 0) {
          for (const contactId of selectedContacts) {
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
              await inviteContact({
                contactName: contact.name,
                contactEmail: contact.email,
                inviteMethod: 'email',
                personalMessage: customMessage
              });
            }
          }
          alert(`✅ Sent ${selectedContacts.length} email invitation(s)!`);
        } else if (email && contactName) {
          await inviteContact({
            contactName,
            contactEmail: email,
            inviteMethod: 'email',
            personalMessage: customMessage
          });
          alert('✅ Email invitation sent!');
        } else {
          alert('Please enter a contact name and email address.');
          setIsSending(false);
          return;
        }
      }
      
      // Reset form
      setSelectedContacts([]);
      setPhoneNumber('');
      setEmail('');
      setContactName('');
      setCustomMessage('');
      
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('❌ Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    alert('Invite link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DobryLife - Compassionate AI Care',
        text: 'Join me on DobryLife for compassionate AI support and wellness guidance.',
        url: getInviteLink()
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Invite Friends & Family
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={inviteMethod === 'phone' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('phone')}
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Text/SMS
            </Button>
            <Button
              variant={inviteMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('email')}
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              variant={inviteMethod === 'link' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('link')}
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>

          {/* Contact Import */}
          {(inviteMethod === 'phone' || inviteMethod === 'email') && (
            <div>
              <Button onClick={handleImportContacts} variant="outline" className="w-full mb-4">
                <Users className="w-4 h-4 mr-2" />
                Import from Contacts
              </Button>
              
              {contacts.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {contacts.map(contact => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedContacts.includes(contact.id)
                          ? 'bg-emerald-100 border-emerald-300'
                          : 'bg-white/50 hover:bg-white/70'
                      } ${contact.hasApp ? 'opacity-50' : ''}`}
                      onClick={() => !contact.hasApp && toggleContactSelection(contact.id)}
                    >
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-500">
                          {inviteMethod === 'phone' ? contact.phone : contact.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.hasApp && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Already joined
                          </Badge>
                        )}
                        {!contact.hasApp && (
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContactSelection(contact.id)}
                            className="form-checkbox"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Entry */}
          {inviteMethod === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Contact Name:</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number:</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {inviteMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Contact Name:</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address:</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Share Link */}
          {inviteMethod === 'link' && (
            <div className="space-y-4">
              <div>
                <Label>Your personal invite link:</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={getInviteLink()} readOnly />
                  <Button onClick={handleCopyLink} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </Button>
            </div>
          )}

          {/* Custom Message */}
          {inviteMethod !== 'link' && (
            <div>
              <Label htmlFor="message">Personal message (optional):</Label>
              <Textarea
                id="message"
                placeholder="Add a personal touch to your invitation..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="h-20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use the default message with your invite link.
              </p>
            </div>
          )}

          {/* Send Button */}
          {inviteMethod !== 'link' && (
            <Button
              onClick={handleSendInvites}
              disabled={
                isSending ||
                (inviteMethod === 'phone' && !phoneNumber && selectedContacts.length === 0) ||
                (inviteMethod === 'email' && !email && selectedContacts.length === 0)
              }
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitations
                  {selectedContacts.length > 0 && (
                    <Badge className="ml-2 bg-white/20">
                      {selectedContacts.length}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}