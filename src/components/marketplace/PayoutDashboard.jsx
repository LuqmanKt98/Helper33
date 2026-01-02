import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createStripeConnectAccount } from '@/functions/createStripeConnectAccount';
import { createStripeConnectLink } from '@/functions/createStripeConnectLink';
import { getStripeAccountStatus } from '@/functions/getStripeAccountStatus';
import { processSellerPayout } from '@/functions/processSellerPayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Loader2,
  TrendingUp,
  Calendar,
  RefreshCw,
  Package,
  Receipt,
  ArrowRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PayoutDashboard({ sellerId }) {
  const queryClient = useQueryClient();
  const [processingPayout, setProcessingPayout] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: async () => {
      const profiles = await base44.entities.SellerProfile.filter({ id: sellerId });
      return profiles[0];
    },
    enabled: !!sellerId
  });

  const { data: payouts = [], isLoading: isLoadingPayouts } = useQuery({
    queryKey: ['sellerPayouts', sellerId],
    queryFn: () => base44.entities.SellerPayout.filter({ seller_id: sellerId }),
    enabled: !!sellerId
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['payoutTransactions', sellerId],
    queryFn: () => base44.entities.PayoutTransaction.filter({ seller_id: sellerId }),
    enabled: !!sellerId,
    refetchInterval: 30000
  });

  const { data: commissionSettings } = useQuery({
    queryKey: ['commissionSettings', sellerId],
    queryFn: async () => {
      const settings = await base44.entities.CommissionSettings.filter({ seller_id: sellerId });
      return settings[0];
    },
    enabled: !!sellerId
  });

  const { data: stripeAccount, isLoading: isLoadingStripe, refetch: refetchStripe } = useQuery({
    queryKey: ['stripeAccount', sellerProfile?.payout_information?.stripe_account_id],
    queryFn: async () => {
      const { data } = await getStripeAccountStatus({ 
        account_id: sellerProfile.payout_information.stripe_account_id 
      });
      return data;
    },
    enabled: !!sellerProfile?.payout_information?.stripe_account_id,
    refetchInterval: 30000
  });

  const createConnectAccountMutation = useMutation({
    mutationFn: async () => {
      const { data } = await createStripeConnectAccount({
        seller_id: sellerId,
        email: sellerProfile.contact_email || user.email,
        business_type: 'individual'
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerProfile']);
      toast.success('Stripe account created!');
    }
  });

  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await createStripeConnectLink({
        account_id: sellerProfile.payout_information.stripe_account_id,
        return_url: window.location.href + '?stripe_onboarding=success',
        refresh_url: window.location.href
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    }
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (payoutId) => {
      const payout = payouts.find(p => p.id === payoutId);
      const { data } = await processSellerPayout({
        seller_id: sellerId,
        amount: payout.net_payout,
        payout_id: payoutId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerPayouts']);
      queryClient.invalidateQueries(['payoutTransactions']);
      queryClient.invalidateQueries(['stripeAccount']);
      toast.success('💰 Payout initiated! Funds will arrive in 2-5 business days.');
      setProcessingPayout(null);
    },
    onError: (error) => {
      toast.error('Failed to process payout');
      console.error(error);
      setProcessingPayout(null);
    }
  });

  const handleConnectStripe = async () => {
    await createConnectAccountMutation.mutateAsync();
    
    setTimeout(() => {
      startOnboardingMutation.mutate();
    }, 1000);
  };

  if (isLoadingProfile || isLoadingPayouts) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const hasStripeAccount = !!sellerProfile?.payout_information?.stripe_account_id;
  const isStripeVerified = stripeAccount?.account?.payouts_enabled;
  const pendingPayouts = payouts.filter(p => p.payout_status === 'pending');
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.net_payout, 0);
  const totalEarningsAllTime = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'processing');
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const failedTransactions = transactions.filter(t => t.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Stripe Connection Status */}
      {!hasStripeAccount ? (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Bank Account</h3>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Set up your Stripe account to receive payouts securely and automatically
            </p>
            <Button
              onClick={handleConnectStripe}
              disabled={createConnectAccountMutation.isPending || startOnboardingMutation.isPending}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-amber-600"
            >
              {(createConnectAccountMutation.isPending || startOnboardingMutation.isPending) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Connect Stripe Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : !isStripeVerified ? (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Complete Your Stripe Setup</h4>
                <p className="text-gray-700 mb-4">
                  Finish setting up your Stripe account to start receiving payouts
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => startOnboardingMutation.mutate()}
                    disabled={startOnboardingMutation.isPending}
                    className="bg-blue-600"
                  >
                    {startOnboardingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Complete Setup
                  </Button>
                  <Button
                    onClick={() => refetchStripe()}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900">✅ Stripe Connected</h4>
                <p className="text-gray-700">Your account is ready to receive payouts</p>
              </div>
              <Button
                onClick={() => startOnboardingMutation.mutate()}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <DollarSign className="w-8 h-8 mb-2" />
            <div className="text-3xl font-bold mb-1">${totalPending.toFixed(2)}</div>
            <div className="text-sm opacity-90">Pending Payouts</div>
            <div className="text-xs opacity-75 mt-2">{pendingPayouts.length} pending</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 mb-2" />
            <div className="text-3xl font-bold mb-1">${totalEarningsAllTime.toFixed(2)}</div>
            <div className="text-sm opacity-90">Total Earnings</div>
            <div className="text-xs opacity-75 mt-2">{completedTransactions.length} payouts</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <Clock className="w-8 h-8 mb-2" />
            <div className="text-3xl font-bold mb-1">{pendingTransactions.length}</div>
            <div className="text-sm opacity-90">Processing</div>
            <div className="text-xs opacity-75 mt-2">In progress</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 mb-2" />
            <div className="text-3xl font-bold mb-1 text-sm">
              {commissionSettings?.payout_schedule || 'Biweekly'}
            </div>
            <div className="text-sm opacity-90">Payout Schedule</div>
            <div className="text-xs opacity-75 mt-2">
              Min: ${commissionSettings?.minimum_payout_threshold || 50}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Balance */}
      {stripeAccount?.balance && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Balance</CardTitle>
                <CardDescription>Funds ready for payout from Stripe</CardDescription>
              </div>
              <Button
                onClick={() => refetchStripe()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {stripeAccount.balance.available.map((balance, idx) => (
                <div key={idx} className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div className="text-sm text-gray-600 mb-2">💰 Available Now</div>
                  <div className="text-4xl font-bold text-green-700 mb-1">
                    ${(balance.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">{balance.currency.toUpperCase()}</div>
                  {totalPending >= (commissionSettings?.minimum_payout_threshold || 50) && isStripeVerified && (
                    <Button
                      onClick={() => {
                        const payout = pendingPayouts[0];
                        if (payout) {
                          setProcessingPayout(payout.id);
                          requestPayoutMutation.mutate(payout.id);
                        }
                      }}
                      disabled={requestPayoutMutation.isPending}
                      className="w-full mt-4 bg-green-600"
                      size="sm"
                    >
                      {requestPayoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      Request Payout Now
                    </Button>
                  )}
                </div>
              ))}
              {stripeAccount.balance.pending.map((balance, idx) => (
                <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300">
                  <div className="text-sm text-gray-600 mb-2">⏳ Pending Release</div>
                  <div className="text-4xl font-bold text-blue-700 mb-1">
                    ${(balance.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">In escrow hold period</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout Transactions</CardTitle>
              <CardDescription>Complete history of all payouts and transfers</CardDescription>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries(['payoutTransactions'])}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h4 className="font-bold text-lg text-gray-700 mb-2">No Transactions Yet</h4>
              <p className="text-gray-600">Your payout history will appear here once you make sales</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {transactions.slice(0, 20).map((transaction) => {
                  const statusConfig = {
                    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
                    processing: { color: 'bg-blue-100 text-blue-800', icon: Loader2, label: 'Processing', spin: true },
                    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
                    failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' },
                    on_hold: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'On Hold' }
                  };

                  const config = statusConfig[transaction.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  const isExpanded = selectedTransaction?.id === transaction.id;

                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white"
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setSelectedTransaction(isExpanded ? null : transaction)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={config.color}>
                                <StatusIcon className={`w-3 h-3 mr-1 ${config.spin ? 'animate-spin' : ''}`} />
                                {config.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {transaction.transaction_type.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                              {transaction.requested_by_seller && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  Manual Request
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Amount</p>
                                <p className="font-bold text-green-600 text-xl">
                                  ${transaction.amount.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Initiated</p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(transaction.initiated_at || transaction.created_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Expected Arrival</p>
                                <p className="font-semibold text-blue-600">
                                  {transaction.expected_arrival_date 
                                    ? new Date(transaction.expected_arrival_date).toLocaleDateString()
                                    : transaction.status === 'completed' && transaction.arrived_at
                                    ? 'Arrived'
                                    : '2-5 days'
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Orders</p>
                                <p className="font-semibold text-gray-900 flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {transaction.related_order_ids?.length || 0}
                                </p>
                              </div>
                            </div>

                            {transaction.failure_reason && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-red-800">
                                  <AlertCircle className="w-4 h-4 inline mr-1" />
                                  {transaction.failure_reason}
                                </p>
                              </div>
                            )}

                            {transaction.hold_reason && (
                              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-orange-800">
                                  <AlertCircle className="w-4 h-4 inline mr-1" />
                                  {transaction.hold_reason}
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-4"
                          >
                            <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t-2 border-gray-100"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Timeline */}
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Payout Timeline
                                </h5>
                                {transaction.initiated_at && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                    <div>
                                      <p className="text-xs text-gray-600">Initiated</p>
                                      <p className="font-semibold text-sm">
                                        {new Date(transaction.initiated_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {transaction.processed_at && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                                    <div>
                                      <p className="text-xs text-gray-600">Processed by Stripe</p>
                                      <p className="font-semibold text-sm">
                                        {new Date(transaction.processed_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {transaction.arrived_at ? (
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                    <div>
                                      <p className="text-xs text-gray-600">Arrived in Account</p>
                                      <p className="font-semibold text-sm text-green-700">
                                        {new Date(transaction.arrived_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ) : transaction.expected_arrival_date && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
                                    <div>
                                      <p className="text-xs text-gray-600">Expected Arrival</p>
                                      <p className="font-semibold text-sm text-blue-600">
                                        {new Date(transaction.expected_arrival_date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Fee Breakdown */}
                              {transaction.fees_breakdown && (
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Fee Breakdown
                                  </h5>
                                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Platform Commission:</span>
                                      <span className="font-semibold text-red-600">
                                        -${transaction.fees_breakdown.platform_commission?.toFixed(2) || '0.00'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Stripe Processing:</span>
                                      <span className="font-semibold text-red-600">
                                        -${transaction.fees_breakdown.stripe_processing_fee?.toFixed(2) || '0.00'}
                                      </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold">
                                      <span>Net Payout:</span>
                                      <span className="text-green-700 text-lg">
                                        ${transaction.amount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Order Details */}
                            {transaction.order_details && transaction.order_details.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  Included Orders ({transaction.order_details.length})
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                  {transaction.order_details.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                      <div>
                                        <p className="font-semibold text-gray-900">{order.order_number}</p>
                                        <p className="text-xs text-gray-600">
                                          {new Date(order.order_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <p className="font-bold text-green-600">
                                        ${order.seller_payout_portion?.toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Stripe Reference */}
                            {transaction.stripe_transfer_id && (
                              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-xs text-gray-600 mb-1">Stripe Reference</p>
                                <code className="text-sm font-mono text-purple-800">
                                  {transaction.stripe_transfer_id}
                                </code>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
          <CardDescription>Configure your payout preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Schedule</p>
              <p className="font-semibold text-gray-900">
                {commissionSettings?.payout_schedule || 'Biweekly'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Minimum Threshold</p>
              <p className="font-semibold text-gray-900">
                ${commissionSettings?.minimum_payout_threshold || 50}.00
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
              <p className="font-semibold text-gray-900">
                {commissionSettings?.default_commission_rate || 10}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Escrow Hold Period</p>
              <p className="font-semibold text-gray-900">
                {commissionSettings?.hold_period_days || 7} days
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              How Payouts Work
            </h5>
            <ul className="text-xs text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Orders are held in escrow for {commissionSettings?.hold_period_days || 7} days after delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>After escrow release, funds are added to your available balance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Automatic payouts process {commissionSettings?.payout_schedule || 'biweekly'} once minimum threshold (${commissionSettings?.minimum_payout_threshold || 50}) is met</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Platform fee: {commissionSettings?.default_commission_rate || 10}% per sale</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Payouts typically arrive in 2-5 business days via Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-800">You can request manual payouts anytime once you meet the minimum threshold!</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}