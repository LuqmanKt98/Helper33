
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Plus,
  X,
  Wallet,
  Building2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Bell,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import CancellationGuideModal from '@/components/finance/CancellationGuideModal';
import BankConnectModal from '@/components/finance/BankConnectModal'; // Added

export default function SubscriptionTracker() {
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showBankConnect, setShowBankConnect] = useState(false);
  const [showCancellationGuide, setShowCancellationGuide] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.list('-next_billing_date'),
    enabled: !!user
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', user?.email],
    queryFn: () => base44.entities.Expense.list('-date', 50),
    enabled: !!user
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', user?.email],
    queryFn: () => base44.entities.Budget.list(),
    enabled: !!user
  });

  const { data: bankConnections = [] } = useQuery({
    queryKey: ['bankConnections', user?.email],
    queryFn: () => base44.entities.BankConnection.list(),
    enabled: !!user
  });

  const createSubscription = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setShowAddSubscription(false);
      toast.success('Subscription added successfully!');
    }
  });

  const updateSubscription = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      toast.success('Subscription updated!');
    }
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setShowAddExpense(false);
      toast.success('Expense logged successfully!');
    }
  });

  const deleteSubscription = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      toast.success('Subscription deleted');
    }
  });

  const handleOpenCancellationGuide = (subscription) => {
    setSelectedSubscription(subscription);
    setShowCancellationGuide(true);
  };

  const handleCancelSubscription = (updatedSub) => {
    updateSubscription.mutate({
      id: updatedSub.id,
      data: updatedSub
    });
  };

  // Calculate totals
  const activeSubscriptions = subscriptions.filter(s => s.cancellation_status !== 'cancelled');
  const monthlySubscriptionCost = activeSubscriptions
    .reduce((sum, sub) => {
      if (sub.billing_cycle === 'monthly') return sum + sub.amount;
      if (sub.billing_cycle === 'yearly') return sum + (sub.amount / 12);
      if (sub.billing_cycle === 'quarterly') return sum + (sub.amount / 3);
      if (sub.billing_cycle === 'weekly') return sum + (sub.amount * 4);
      return sum;
    }, 0);

  const thisMonthExpenses = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const upcomingPayments = activeSubscriptions
    .filter(s => s.next_billing_date)
    .filter(s => {
      const daysUntil = Math.ceil((new Date(s.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));

  const categoryColors = {
    streaming: 'from-red-400 to-pink-400',
    software: 'from-blue-400 to-cyan-400',
    music: 'from-purple-400 to-pink-400',
    gaming: 'from-green-400 to-emerald-400',
    fitness: 'from-orange-400 to-amber-400',
    food_delivery: 'from-yellow-400 to-orange-400',
    utilities: 'from-gray-400 to-slate-400',
    other: 'from-indigo-400 to-blue-400'
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              💳 Subscription & Budget Tracker
            </h1>
            <p className="text-gray-600">Manage subscriptions, track expenses, and stay within budget</p>
          </div>
          <Button
            onClick={() => setShowBankConnect(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Connect Bank
          </Button>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-rose-100 to-pink-100 border-2 border-rose-300 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-rose-500" />
                </div>
                <p className="text-sm text-rose-700 font-semibold mb-1">Monthly Subscriptions</p>
                <p className="text-3xl font-bold text-rose-900">${monthlySubscriptionCost.toFixed(2)}</p>
                <p className="text-xs text-rose-600 mt-2">{activeSubscriptions.length} active subscriptions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm text-purple-700 font-semibold mb-1">This Month Expenses</p>
                <p className="text-3xl font-bold text-purple-900">${thisMonthExpenses.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-2">{expenses.length} total expenses logged</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-amber-700 font-semibold mb-1">Upcoming Payments</p>
                <p className="text-3xl font-bold text-amber-900">{upcomingPayments.length}</p>
                <p className="text-xs text-amber-600 mt-2">In the next 7 days</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowAddSubscription(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
          <Button
            onClick={() => setShowAddExpense(true)}
            variant="outline"
            className="border-2 border-purple-300 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Expense
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Subscriptions List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Active Subscriptions
                </CardTitle>
                <CardDescription>Manage your recurring payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No subscriptions yet</p>
                    <p className="text-sm">Add your first subscription to start tracking</p>
                  </div>
                ) : (
                  subscriptions.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <Card className={`${
                        sub.cancellation_status === 'cancelled' 
                          ? 'bg-gradient-to-br from-gray-200 to-gray-300 opacity-75' 
                          : `bg-gradient-to-br ${categoryColors[sub.category] || categoryColors.other}`
                      } border-0 shadow-md`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                {sub.service_name}
                                {sub.cancellation_status === 'cancelled' && (
                                  <Badge className="bg-red-600 text-white text-xs">Cancelled</Badge>
                                )}
                              </h4>
                              <p className="text-white/80 text-sm capitalize">{sub.category?.replace('_', ' ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {sub.cancellation_status !== 'cancelled' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-white hover:bg-white/20"
                                  onClick={() => handleOpenCancellationGuide(sub)}
                                  title="Cancel Subscription"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                                onClick={() => deleteSubscription.mutate(sub.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold text-white">${sub.amount}</span>
                            <span className="text-white/80 text-sm">/{sub.billing_cycle}</span>
                          </div>
                          {sub.next_billing_date && sub.cancellation_status !== 'cancelled' && (
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <Calendar className="w-4 h-4" />
                              Next: {new Date(sub.next_billing_date).toLocaleDateString()}
                            </div>
                          )}
                          {sub.cancellation_date && (
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Cancelled: {new Date(sub.cancellation_date).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Expenses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  Recent Expenses
                </CardTitle>
                <CardDescription>Your latest spending activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No expenses logged yet</p>
                    <p className="text-sm">Start tracking your spending</p>
                  </div>
                ) : (
                  expenses.slice(0, 10).map((expense, idx) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-all"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{expense.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{expense.category?.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 capitalize">{expense.payment_method}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Payments Alert */}
        {upcomingPayments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900">Upcoming Payments</h3>
                    <p className="text-sm text-amber-700">You have {upcomingPayments.length} payments due this week</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {upcomingPayments.map(sub => (
                    <div key={sub.id} className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{sub.service_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(sub.next_billing_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-lg text-amber-900">${sub.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bank Connections */}
        {bankConnections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bankConnections.map(bank => (
                  <div key={bank.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{bank.bank_name}</p>
                        <p className="text-xs text-gray-500">•••• {bank.last_4_digits}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">${bank.balance?.toFixed(2) || '—'}</p>
                      <Badge className={bank.connection_status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
                        {bank.connection_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddSubscription && (
          <SubscriptionForm
            onClose={() => setShowAddSubscription(false)}
            onSubmit={(data) => createSubscription.mutate(data)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddExpense && (
          <ExpenseForm
            onClose={() => setShowAddExpense(false)}
            onSubmit={(data) => createExpense.mutate(data)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBankConnect && (
          <BankConnectModal 
            open={showBankConnect}
            onClose={() => setShowBankConnect(false)} 
          />
        )}
      </AnimatePresence>

      <CancellationGuideModal
        subscription={selectedSubscription}
        open={showCancellationGuide}
        onClose={() => {
          setShowCancellationGuide(false);
          setSelectedSubscription(null);
        }}
        onCancel={handleCancelSubscription}
      />
    </div>
  );
}

function SubscriptionForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    service_name: '',
    category: 'other',
    billing_cycle: 'monthly',
    amount: '',
    start_date: new Date().toISOString().split('T')[0],
    next_billing_date: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Subscription</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Service Name</Label>
            <Input
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Billing Cycle</Label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3"
            >
              <option value="streaming">Streaming</option>
              <option value="software">Software</option>
              <option value="fitness">Fitness</option>
              <option value="food">Food</option>
              <option value="shopping">Shopping</option>
              <option value="utilities">Utilities</option>
              <option value="insurance">Insurance</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label>Next Billing Date</Label>
            <Input
              type="date"
              value={formData.next_billing_date}
              onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600">
              Add Subscription
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ExpenseForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'credit_card',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Log Expense</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Description</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What did you buy?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3"
            >
              <option value="groceries">Groceries</option>
              <option value="food_dining">Food & Dining</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="housing">Housing</option>
              <option value="personal_care">Personal Care</option>
              <option value="education">Education</option>
              <option value="travel">Travel</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="insurance">Insurance</option>
              <option value="savings">Savings</option>
              <option value="debt_payment">Debt Payment</option>
              <option value="gifts_donations">Gifts & Donations</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label>Payment Method</Label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="digital_wallet">Digital Wallet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
              Log Expense
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
