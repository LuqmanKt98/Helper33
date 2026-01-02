import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Send } from 'lucide-react';
import { toast } from "sonner";

export default function SMSComposer({ member, isOpen, onClose, prefilledMessage = '', onSmsSent }) {
  const [message, setMessage] = useState(prefilledMessage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessage(prefilledMessage || '');
  }, [prefilledMessage, isOpen]);

  const handleSend = async () => {
    if (!member || !member.phone_number) {
      toast.error("Recipient phone number is missing.");
      return;
    }
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('sendSMS', {
        to: member.phone_number,
        body: message,
      });

      if (response.data.success) {
        toast.success("Message sent successfully!");
        if (onSmsSent) {
          onSmsSent();
        }
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send SMS to {member?.name}</DialogTitle>
          <DialogDescription>
            Compose your message below. It will be sent from the app's shared phone number.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32"
            placeholder="Type your message here..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}