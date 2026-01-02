import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import userCache from '@/components/UserCache';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, ShieldAlert, Loader2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/components/SoundManager';
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmergencyAlert() {
  const [user, setUser] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sendResults, setSendResults] = useState([]);
  const { playSound } = useNotifications();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userCache.getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!user) return;

    const emergencyContactEmail = user.emergency_contact_email;
    const providerEmail = user.designated_provider_email;
    
    if (!emergencyContactEmail && !providerEmail) {
      toast.warning("No emergency contacts set.", {
        description: "Please add an emergency contact in your Account page.",
        action: {
          label: "Go to Account",
          onClick: () => window.location.href = createPageUrl('Account')
        }
      });
      setIsConfirming(false);
      return;
    }

    setIsSending(true);
    setSendResults([]);
    playSound('click');

    const results = [];

    try {
      const recipients = [];
      
      if (emergencyContactEmail) {
        recipients.push({
          email: emergencyContactEmail,
          name: user.emergency_contact_name || 'Emergency Contact',
          phone: user.emergency_contact_phone,
          type: 'emergency_contact'
        });
      }
      
      if (providerEmail && providerEmail !== emergencyContactEmail) {
        recipients.push({
          email: providerEmail,
          name: 'Healthcare Provider',
          phone: null,
          type: 'provider'
        });
      }

      // Send email to all recipients
      for (const recipient of recipients) {
        try {
          console.log('Sending emergency alert to:', recipient.email);
          
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd; border: 2px solid #ff6b6b; border-radius: 10px;">
              <h1 style="color: #dc3545; text-align: center;">🚨 Emergency Support Alert</h1>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 16px; color: #333;">Hello ${recipient.name !== 'Healthcare Provider' ? recipient.name : ''},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  This is an <strong>automated urgent alert</strong> from the DobryLife wellness platform.
                </p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
                  <p style="font-size: 18px; color: #dc3545; font-weight: bold; margin: 0;">
                    <strong>${user.full_name}</strong> has requested immediate support by activating their emergency alert button.
                  </p>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                  <strong>Please attempt to contact them as soon as possible</strong> to check on their well-being.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="color: #495057; margin-top: 0;">Contact Information:</h3>
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${user.full_name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
                  ${user.phone_number ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${user.phone_number}</p>` : ''}
                </div>
                
                <p style="font-size: 14px; color: #666; line-height: 1.6;">
                  This message was sent to you because you are listed as ${recipient.type === 'provider' ? 'their designated healthcare provider' : 'their emergency contact'} in the DobryLife app.
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; background-color: white; border-radius: 8px;">
                <p style="font-size: 14px; color: #666; margin: 0;">
                  If you believe this is a life-threatening emergency, please call emergency services immediately.
                </p>
                <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">
                  Location: ${user.location_settings?.country || 'Unknown'} | Emergency: ${user.location_settings?.emergency_number || '911'}
                </p>
              </div>
              
              <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                Sent from DobryLife Wellness Platform
              </p>
            </div>
          `;

          const response = await base44.integrations.Core.SendEmail({
            from_name: "DobryLife Emergency Alert",
            to: recipient.email,
            subject: `🚨 URGENT: Support Request from ${user.full_name}`,
            body: emailBody
          });

          console.log('Email sent successfully:', response);
          
          results.push({
            recipient: recipient.name,
            email: recipient.email,
            success: true
          });

        } catch (error) {
          console.error(`Failed to send alert to ${recipient.email}:`, error);
          results.push({
            recipient: recipient.name,
            email: recipient.email,
            success: false,
            error: error.message
          });
        }
      }

      setSendResults(results);

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        setIsSent(true);
        playSound('success');
        
        if (failedCount > 0) {
          toast.warning(`Alert sent to ${successCount} contact(s)`, {
            description: `${failedCount} email(s) failed to send. Please contact them directly.`
          });
        } else {
          toast.success("✅ Alert Sent Successfully!", {
            description: `Emergency notification sent to ${successCount} contact(s)`
          });
        }
      } else {
        playSound('error');
        toast.error("Failed to send alerts", {
          description: "Please contact your emergency contacts directly."
        });
      }

    } catch (error) {
      console.error("Failed to send alert:", error);
      toast.error("Failed to send alert.", {
        description: "Please try again or contact your support person directly."
      });
      playSound('error');
    }

    setIsSending(false);
    
    // Keep dialog open longer to show results
    setTimeout(() => {
      setIsConfirming(false);
      setIsSent(false);
      setSendResults([]);
    }, 6000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      </div>
    );
  }

  const emergencyNumber = user?.location_settings?.emergency_number || '911';
  const crisisHotline = user?.location_settings?.crisis_hotline || '988';
  const crisisHotlineNumberOnly = crisisHotline.match(/\d+/)?.[0] || crisisHotline;
  const hasEmergencyContact = user?.emergency_contact_email || user?.designated_provider_email;

  return (
    <>
      <div className="space-y-3">
        
        <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
          <a href={`tel:${emergencyNumber.match(/\d+/)?.[0] || emergencyNumber}`}>
            <Phone className="w-5 h-5 mr-2" /> 
            Call {emergencyNumber}
          </a>
        </Button>
        
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <a href={`tel:${crisisHotlineNumberOnly}`}>
            <Phone className="w-5 h-5 mr-2" /> 
            Call {crisisHotline}
          </a>
        </Button>
        
        <Button
          onClick={() => {
            if (!hasEmergencyContact) {
              toast.warning("Please set up an emergency contact first", {
                action: {
                  label: "Go to Account",
                  onClick: () => window.location.href = createPageUrl('Account')
                }
              });
              return;
            }
            playSound('pop');
            setIsConfirming(true);
          }}
          className="w-full"
          variant="outline"
          disabled={!hasEmergencyContact}
        >
          <ShieldAlert className="w-5 h-5 mr-2" />
          Alert Personal Contact
        </Button>

        {!hasEmergencyContact && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Setup Required:</strong> Please{' '}
              <Link to={createPageUrl('Account')} className="underline font-semibold">
                add an emergency contact
              </Link>{' '}
              to use this feature.
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-center text-gray-500 pt-2 flex items-center justify-center gap-2">
          <Info className="w-4 h-4"/> For more resources, ask the AI Assistant.
        </p>
      </div>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Personal Alert</DialogTitle>
            <DialogDescription>
              This will send an urgent email to:
              <ul className="mt-2 space-y-1">
                {user?.emergency_contact_name && user?.emergency_contact_email && (
                  <li className="font-semibold">• {user.emergency_contact_name} ({user.emergency_contact_email})</li>
                )}
                {user?.designated_provider_email && (
                  <li className="font-semibold">• Your Provider ({user.designated_provider_email})</li>
                )}
              </ul>
              <p className="mt-2">Are you sure?</p>
            </DialogDescription>
          </DialogHeader>
          
          {isSent && sendResults.length > 0 ? (
            <div className="my-4 space-y-2">
              {sendResults.map((result, index) => (
                <Alert key={index} className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.success ? `✅ Sent to ${result.recipient}` : `❌ Failed: ${result.recipient}`}
                  </AlertTitle>
                  {result.success ? (
                    <AlertDescription className="text-green-700">
                      Emergency alert sent to {result.email}
                    </AlertDescription>
                  ) : (
                    <AlertDescription className="text-red-700">
                      Could not send to {result.email}. Please contact them directly.
                    </AlertDescription>
                  )}
                </Alert>
              ))}
            </div>
          ) : isSending ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
              <span>Sending emergency alerts...</span>
            </div>
          ) : (
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleSendAlert}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Send Alert
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}