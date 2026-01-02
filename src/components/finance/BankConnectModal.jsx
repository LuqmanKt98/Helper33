import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Building2, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function BankConnectModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      initializePlaid();
    }
  }, [open]);

  const initializePlaid = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('plaidCreateLinkToken');
      setLinkToken(response.data.link_token);
    } catch (error) {
      console.error('Failed to initialize Plaid:', error);
      toast.error('Failed to initialize bank connection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPlaidLink = () => {
    if (!linkToken) return;

    // Load Plaid Link script if not already loaded
    if (!window.Plaid) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.onload = () => initPlaidLink();
      document.body.appendChild(script);
    } else {
      initPlaidLink();
    }
  };

  const initPlaidLink = () => {
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token, metadata) => {
        try {
          setLoading(true);
          const response = await base44.functions.invoke('plaidExchangeToken', {
            public_token
          });

          if (response.data.success) {
            toast.success(response.data.message);
            queryClient.invalidateQueries(['bankConnections']);
            onClose();
          } else {
            throw new Error('Failed to connect bank account');
          }
        } catch (error) {
          console.error('Bank connection error:', error);
          toast.error('Failed to connect bank account. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      onExit: (err, metadata) => {
        if (err) {
          console.error('Plaid Link error:', err);
          toast.error('Bank connection cancelled or failed');
        }
      },
      onEvent: (eventName, metadata) => {
        console.log('Plaid event:', eventName, metadata);
      },
    });

    handler.open();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6 text-blue-600" />
            Connect Your Bank
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Secure Connection</h3>
                <p className="text-sm text-blue-700">
                  Your banking credentials are encrypted and never stored by Helper33.
                  We use Plaid's bank-level security.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              What you can do:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 ml-7">
              <li>• Auto-detect recurring subscriptions</li>
              <li>• Track all your expenses automatically</li>
              <li>• Monitor account balances in real-time</li>
              <li>• Get alerts before payments are due</li>
              <li>• Categorize transactions with AI</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Read-Only Access:</strong> Helper33 can only view your transactions and balances. 
                We cannot move money or make changes to your accounts.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={openPlaidLink}
              disabled={loading || !linkToken}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Connect Bank
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Powered by <strong>Plaid</strong> - Trusted by millions of users worldwide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}