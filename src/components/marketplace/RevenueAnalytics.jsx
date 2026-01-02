import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Calendar,
  Users,
  Repeat
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueAnalytics({ sellerId }) {
  const { data: orders = [] } = useQuery({
    queryKey: ['sellerOrders', sellerId],
    queryFn: () => base44.entities.MarketplaceOrder.filter({ seller_id: sellerId }),
    enabled: !!sellerId
  });

  const { data: commissionSettings } = useQuery({
    queryKey: ['commissionSettings', sellerId],
    queryFn: async () => {
      const settings = await base44.entities.CommissionSettings.filter({ seller_id: sellerId });
      return settings[0];
    },
    enabled: !!sellerId
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['allSubscriptionPlans', sellerId],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ seller_id: sellerId }),
    enabled: !!sellerId
  });

  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCommissions = completedOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);
  const netRevenue = completedOrders.reduce((sum, o) => sum + (o.seller_payout || 0), 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const totalMRR = plans.reduce((sum, p) => sum + (p.monthly_recurring_revenue || 0), 0);
  const totalActiveSubscribers = plans.reduce((sum, p) => sum + (p.active_subscribers || 0), 0);

  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: 0,
        orders: 0
      });
    }
    
    completedOrders.forEach(order => {
      const orderDate = new Date(order.created_date);
      const monthIndex = months.findIndex(m => {
        const [monthName, year] = m.month.split(' ');
        const monthDate = new Date(`${monthName} 1, ${year}`);
        return orderDate.getMonth() === monthDate.getMonth() && 
               orderDate.getFullYear() === monthDate.getFullYear();
      });
      
      if (monthIndex !== -1) {
        months[monthIndex].revenue += order.seller_payout || 0;
        months[monthIndex].orders += 1;
      }
    });
    
    return months;
  };

  const monthlyData = getLast6Months();
  const commissionRate = commissionSettings?.default_commission_rate || 10;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8" />
                <Badge className="bg-white/20 text-white">Total</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">${netRevenue.toFixed(2)}</div>
              <div className="text-sm opacity-90">Net Revenue (After Fees)</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8" />
                <Badge className="bg-white/20 text-white">Orders</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{completedOrders.length}</div>
              <div className="text-sm opacity-90">Completed Orders</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8" />
                <Badge className="bg-white/20 text-white">Avg</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">${avgOrderValue.toFixed(2)}</div>
              <div className="text-sm opacity-90">Average Order Value</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Percent className="w-8 h-8" />
                <Badge className="bg-white/20 text-white">Fee</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{commissionRate}%</div>
              <div className="text-sm opacity-90">Platform Commission</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {totalActiveSubscribers > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8" />
                <Repeat className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalActiveSubscribers}</div>
              <div className="text-sm opacity-90">Active Subscribers</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold mb-1">${totalMRR.toFixed(0)}</div>
              <div className="text-sm opacity-90">Monthly Recurring Revenue</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Revenue Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                contentStyle={{ background: 'white', border: '1px solid #ddd' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-600" />
            Commission Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-800">Gross Sales</div>
                <div className="text-sm text-gray-600">{completedOrders.length} completed orders</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-800">Platform Fees</div>
                <div className="text-sm text-gray-600">{commissionRate}% commission</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                -${totalCommissions.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div>
                <div className="font-semibold text-gray-800">Your Earnings</div>
                <div className="text-sm text-gray-600">Available for payout</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ${netRevenue.toFixed(2)}
              </div>
            </div>

            {commissionSettings?.current_balance > 0 && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-800">Pending Balance</div>
                  <div className="text-sm text-gray-600">
                    Next payout: {commissionSettings.next_payout_date 
                      ? new Date(commissionSettings.next_payout_date).toLocaleDateString()
                      : 'TBD'
                    }
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ${commissionSettings.current_balance.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}