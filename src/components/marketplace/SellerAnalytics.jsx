import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar,
  TrendingDown,
  Eye,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  MapPin,
  Download,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export default function SellerAnalytics({ sellerProfile, orders = [] }) {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: products = [] } = useQuery({
    queryKey: ['sellerProducts', sellerProfile?.id],
    queryFn: () => base44.entities.MarketplaceProduct.filter({ seller_id: sellerProfile.id }),
    enabled: !!sellerProfile?.id
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['payoutTransactions', sellerProfile?.id],
    queryFn: () => base44.entities.PayoutTransaction.filter({ seller_id: sellerProfile.id }),
    enabled: !!sellerProfile?.id
  });

  // Calculate time range filter
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return orders.filter(order => new Date(order.created_date) >= startDate);
  }, [orders, timeRange]);

  // Sales Performance Metrics
  const salesMetrics = useMemo(() => {
    const completedOrders = filteredOrders.filter(o => o.order_status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.seller_payout || 0), 0);
    const totalUnits = completedOrders.reduce((sum, o) => {
      return sum + (o.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 1);
    }, 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Previous period comparison
    const prevPeriodOrders = orders.filter(o => {
      const orderDate = new Date(o.created_date);
      const now = new Date();
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
      const prevStart = new Date(now.getTime() - (days * 2 * 24 * 60 * 60 * 1000));
      const prevEnd = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      return orderDate >= prevStart && orderDate <= prevEnd && o.order_status === 'completed';
    });
    const prevRevenue = prevPeriodOrders.reduce((sum, o) => sum + (o.seller_payout || 0), 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders: completedOrders.length,
      totalUnits,
      avgOrderValue,
      revenueChange,
      prevRevenue
    };
  }, [filteredOrders, orders, timeRange]);

  // Revenue Over Time (Daily)
  const revenueOverTime = useMemo(() => {
    const dailyRevenue = {};
    
    filteredOrders.forEach(order => {
      if (order.order_status === 'completed') {
        const date = new Date(order.created_date).toLocaleDateString();
        dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.seller_payout || 0);
      }
    });

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 data points
  }, [filteredOrders]);

  // Product Performance
  const productPerformance = useMemo(() => {
    const productStats = {};

    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!productStats[item.item_id]) {
          productStats[item.item_id] = {
            id: item.item_id,
            name: item.item_name,
            revenue: 0,
            units: 0,
            orders: 0
          };
        }
        productStats[item.item_id].revenue += (item.total_price || 0);
        productStats[item.item_id].units += (item.quantity || 1);
        productStats[item.item_id].orders += 1;
      });
    });

    const productsArray = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    // Add view/conversion data from products
    const enrichedProducts = productsArray.map(p => {
      const product = products.find(prod => prod.id === p.id);
      return {
        ...p,
        views: product?.view_count || 0,
        conversionRate: product?.view_count > 0 ? ((p.orders / product.view_count) * 100).toFixed(2) : 0
      };
    });

    return enrichedProducts;
  }, [filteredOrders, products]);

  // Customer Insights
  const customerInsights = useMemo(() => {
    const uniqueCustomers = new Set();
    const customerPurchaseCounts = {};
    const locationData = {};

    filteredOrders.forEach(order => {
      uniqueCustomers.add(order.buyer_email);
      
      // Track repeat customers
      customerPurchaseCounts[order.buyer_email] = (customerPurchaseCounts[order.buyer_email] || 0) + 1;
      
      // Track locations (from shipping address)
      const location = order.shipping_address?.state || order.shipping_address?.country || 'Unknown';
      locationData[location] = (locationData[location] || 0) + 1;
    });

    const newCustomers = Object.values(customerPurchaseCounts).filter(count => count === 1).length;
    const returningCustomers = Object.values(customerPurchaseCounts).filter(count => count > 1).length;

    const topLocations = Object.entries(locationData)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCustomers: uniqueCustomers.size,
      newCustomers,
      returningCustomers,
      repeatRate: uniqueCustomers.size > 0 ? ((returningCustomers / uniqueCustomers.size) * 100).toFixed(1) : 0,
      topLocations
    };
  }, [filteredOrders]);

  // Payout Analytics
  const payoutAnalytics = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalPayouts = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = completedTransactions.reduce((sum, t) => {
      const fees = t.fees_breakdown;
      return sum + (fees?.platform_commission || 0) + (fees?.stripe_processing_fee || 0) + (fees?.other_fees || 0);
    }, 0);

    const avgPayout = completedTransactions.length > 0 ? totalPayouts / completedTransactions.length : 0;

    // Fees breakdown
    const feesBreakdown = {
      platformCommission: completedTransactions.reduce((sum, t) => sum + (t.fees_breakdown?.platform_commission || 0), 0),
      stripeProcessing: completedTransactions.reduce((sum, t) => sum + (t.fees_breakdown?.stripe_processing_fee || 0), 0),
      otherFees: completedTransactions.reduce((sum, t) => sum + (t.fees_breakdown?.other_fees || 0), 0)
    };

    return {
      totalPayouts,
      payoutCount: completedTransactions.length,
      avgPayout,
      totalFees,
      feesBreakdown
    };
  }, [transactions]);

  // Category Performance
  const categoryPerformance = useMemo(() => {
    const categoryStats = {};

    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.item_id);
        const category = product?.category || 'other';
        
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            revenue: 0,
            units: 0
          };
        }
        categoryStats[category].revenue += (item.total_price || 0);
        categoryStats[category].units += (item.quantity || 1);
      });
    });

    return Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, products]);

  const exportAnalytics = () => {
    const data = {
      timeRange,
      generatedAt: new Date().toISOString(),
      salesMetrics,
      productPerformance: productPerformance.slice(0, 10),
      customerInsights,
      payoutAnalytics,
      categoryPerformance
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Analytics exported!');
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 text-sm mt-1">Comprehensive insights into your shop's performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="365days">Last Year</option>
          </select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {salesMetrics.revenueChange !== 0 && (
                <Badge className={salesMetrics.revenueChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {salesMetrics.revenueChange > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {Math.abs(salesMetrics.revenueChange).toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-700">${salesMetrics.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{salesMetrics.totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-blue-700">${salesMetrics.avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{salesMetrics.totalUnits} units sold</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-purple-700">{customerInsights.totalCustomers}</p>
            <p className="text-xs text-gray-500 mt-2">{customerInsights.repeatRate}% repeat rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-amber-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Shop Rating</p>
            <p className="text-3xl font-bold text-amber-700">
              {sellerProfile.average_rating?.toFixed(1) || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{sellerProfile.total_reviews || 0} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Analytics Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <DollarSign className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Daily revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueOverTime.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No sales data available for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueOverTime}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: '2px solid #10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Sales by Category
              </CardTitle>
              <CardDescription>Revenue distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No category data available</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={categoryPerformance}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.category.replace(/_/g, ' ')}: $${entry.revenue.toFixed(0)}`}
                        labelLine={false}
                      >
                        {categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </RechartsPie>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {categoryPerformance.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <div>
                            <p className="font-semibold text-sm capitalize">
                              {cat.category.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-600">{cat.units} units</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">${cat.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Top Performing Products
              </CardTitle>
              <CardDescription>Your best-selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {productPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No product sales data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productPerformance.slice(0, 10).map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold">
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <ShoppingCart className="w-3 h-3" />
                                {product.orders} orders
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {product.units} units
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {product.views} views
                              </span>
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {product.conversionRate}% conversion
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">${(product.revenue / product.units).toFixed(2)} per unit</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Performing Products */}
          {productPerformance.length > 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                  Products Needing Attention
                </CardTitle>
                <CardDescription>Products with low sales or conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productPerformance.slice(-5).reverse().map((product) => (
                    <div key={product.id} className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>{product.views} views</span>
                            <span>{product.orders} sales</span>
                            <Badge className="bg-orange-100 text-orange-800">
                              {product.conversionRate}% conversion
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-700">${product.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border border-orange-300">
                        <p className="text-xs text-orange-800">
                          💡 <strong>Tip:</strong> Consider updating product images, description, or pricing to boost conversions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-lg">Customer Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-blue-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">New Customers</span>
                      <span className="text-2xl font-bold text-blue-600">{customerInsights.newCustomers}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${(customerInsights.newCustomers / customerInsights.totalCustomers * 100) || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((customerInsights.newCustomers / customerInsights.totalCustomers * 100) || 0).toFixed(1)}% of total
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border-2 border-green-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Returning Customers</span>
                      <span className="text-2xl font-bold text-green-600">{customerInsights.returningCustomers}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(customerInsights.returningCustomers / customerInsights.totalCustomers * 100) || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((customerInsights.returningCustomers / customerInsights.totalCustomers * 100) || 0).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerInsights.topLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No location data available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerInsights.topLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-purple-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className="font-semibold text-gray-900">{loc.location}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{loc.count}</p>
                          <p className="text-xs text-gray-600">orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Value Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Insights</CardTitle>
              <CardDescription>Understanding your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Total Unique Customers</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">{customerInsights.totalCustomers}</p>
                  <p className="text-xs text-gray-600">across {salesMetrics.totalOrders} orders</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Repeat Purchase Rate</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">{customerInsights.repeatRate}%</p>
                  <p className="text-xs text-gray-600">{customerInsights.returningCustomers} returning customers</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-2">Avg Customer Value</p>
                  <p className="text-4xl font-bold text-purple-600 mb-1">
                    ${customerInsights.totalCustomers > 0 ? (salesMetrics.totalRevenue / customerInsights.totalCustomers).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-600">per customer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Comparison</CardTitle>
              <CardDescription>Revenue and units sold by product</CardDescription>
            </CardHeader>
            <CardContent>
              {productPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No product data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productPerformance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={120}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px' }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                        return [value, 'Units Sold'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="units" fill="#3b82f6" name="Units Sold" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Product Conversion Rates
              </CardTitle>
              <CardDescription>Views to sales conversion for each product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productPerformance.filter(p => p.views > 0).slice(0, 10).map((product) => (
                  <div key={product.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <Badge className={
                        parseFloat(product.conversionRate) >= 5 ? 'bg-green-100 text-green-800' :
                        parseFloat(product.conversionRate) >= 2 ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {product.conversionRate}% conversion
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{product.views} views</span>
                      <span>→</span>
                      <span>{product.orders} sales</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${Math.min(parseFloat(product.conversionRate), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab Detail */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Where your customers are located</CardDescription>
            </CardHeader>
            <CardContent>
              {customerInsights.topLocations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No location data available yet</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customerInsights.topLocations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="location" 
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#8b5cf6" name="Orders" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">Top 10 Locations</h4>
                    {customerInsights.topLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <span className="font-semibold text-gray-900">{loc.location}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{loc.count}</p>
                          <p className="text-xs text-gray-600">
                            {((loc.count / salesMetrics.totalOrders) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Loyalty Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Customer Loyalty Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 text-center">
                  <p className="text-gray-600 text-sm mb-2">New Customers</p>
                  <p className="text-4xl font-bold text-green-600 mb-2">{customerInsights.newCustomers}</p>
                  <Badge className="bg-blue-100 text-blue-800">First-time buyers</Badge>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 text-center">
                  <p className="text-gray-600 text-sm mb-2">Returning Customers</p>
                  <p className="text-4xl font-bold text-purple-600 mb-2">{customerInsights.returningCustomers}</p>
                  <Badge className="bg-green-100 text-green-800">Repeat buyers</Badge>
                </div>

                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 text-center">
                  <p className="text-gray-600 text-sm mb-2">Repeat Rate</p>
                  <p className="text-4xl font-bold text-amber-600 mb-2">{customerInsights.repeatRate}%</p>
                  <Badge className="bg-purple-100 text-purple-800">Customer loyalty</Badge>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2 text-sm">💡 Customer Retention Insights</h5>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• {customerInsights.repeatRate}% of your customers come back for more</li>
                  <li>• Industry average repeat rate is 20-30%</li>
                  {parseFloat(customerInsights.repeatRate) > 30 && (
                    <li className="font-semibold text-green-700">✨ Excellent! You're building strong customer loyalty</li>
                  )}
                  {parseFloat(customerInsights.repeatRate) < 20 && (
                    <li className="font-semibold text-orange-700">💪 Consider loyalty programs or follow-up campaigns</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 mb-2" />
                <p className="text-sm opacity-90 mb-1">Total Payouts</p>
                <p className="text-3xl font-bold">${payoutAnalytics.totalPayouts.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">{payoutAnalytics.payoutCount} transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 mb-2" />
                <p className="text-sm opacity-90 mb-1">Avg Payout</p>
                <p className="text-3xl font-bold">${payoutAnalytics.avgPayout.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">per transaction</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <TrendingDown className="w-8 h-8 mb-2" />
                <p className="text-sm opacity-90 mb-1">Total Fees</p>
                <p className="text-3xl font-bold">${payoutAnalytics.totalFees.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">platform + processing</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-sm opacity-90 mb-1">Net Earnings</p>
                <p className="text-3xl font-bold">
                  ${(payoutAnalytics.totalPayouts - payoutAnalytics.totalFees).toFixed(2)}
                </p>
                <p className="text-xs opacity-75 mt-2">after all fees</p>
              </CardContent>
            </Card>
          </div>

          {/* Fees Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-red-600" />
                Fees Breakdown
              </CardTitle>
              <CardDescription>Detailed breakdown of all fees paid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={[
                        { name: 'Platform Commission', value: payoutAnalytics.feesBreakdown.platformCommission },
                        { name: 'Stripe Processing', value: payoutAnalytics.feesBreakdown.stripeProcessing },
                        { name: 'Other Fees', value: payoutAnalytics.feesBreakdown.otherFees }
                      ].filter(item => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `$${entry.value.toFixed(2)}`}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#8b5cf6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="space-y-3">
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="font-semibold text-gray-900">Platform Commission</span>
                      </div>
                      <p className="font-bold text-red-600">${payoutAnalytics.feesBreakdown.platformCommission.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {((payoutAnalytics.feesBreakdown.platformCommission / payoutAnalytics.totalFees) * 100).toFixed(1)}% of total fees
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500" />
                        <span className="font-semibold text-gray-900">Stripe Processing</span>
                      </div>
                      <p className="font-bold text-orange-600">${payoutAnalytics.feesBreakdown.stripeProcessing.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {((payoutAnalytics.feesBreakdown.stripeProcessing / payoutAnalytics.totalFees) * 100).toFixed(1)}% of total fees
                    </p>
                  </div>

                  {payoutAnalytics.feesBreakdown.otherFees > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-purple-500" />
                          <span className="font-semibold text-gray-900">Other Fees</span>
                        </div>
                        <p className="font-bold text-purple-600">${payoutAnalytics.feesBreakdown.otherFees.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Total Fees Paid</span>
                      <p className="text-2xl font-bold text-gray-700">${payoutAnalytics.totalFees.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Effective fee rate: {((payoutAnalytics.totalFees / salesMetrics.totalRevenue) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout History Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Payout History Summary
              </CardTitle>
              <CardDescription>Overview of all completed payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.filter(t => t.status === 'completed').length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No completed payouts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.status === 'completed')
                    .slice(0, 10)
                    .map((transaction, idx) => (
                      <div key={transaction.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-green-100 text-green-800">
                                {transaction.transaction_type.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                              {transaction.requested_by_seller && (
                                <Badge className="bg-purple-100 text-purple-800">Manual Request</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-600">Amount</p>
                                <p className="font-bold text-green-700 text-lg">${transaction.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Date</p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(transaction.arrived_at || transaction.processed_at || transaction.created_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Orders</p>
                                <p className="font-semibold text-gray-900">{transaction.related_order_ids?.length || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights & Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesMetrics.revenueChange > 20 && (
              <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                <p className="text-sm font-semibold text-green-900 mb-1">📈 Strong Growth!</p>
                <p className="text-xs text-green-800">
                  Your revenue increased by {salesMetrics.revenueChange.toFixed(1)}% compared to the previous period. Keep up the great work!
                </p>
              </div>
            )}

            {parseFloat(customerInsights.repeatRate) > 30 && (
              <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
                <p className="text-sm font-semibold text-purple-900 mb-1">⭐ Excellent Customer Loyalty!</p>
                <p className="text-xs text-purple-800">
                  Your {customerInsights.repeatRate}% repeat rate is above industry average. Customers love your products!
                </p>
              </div>
            )}

            {productPerformance.length > 0 && productPerformance[0].revenue > salesMetrics.totalRevenue * 0.5 && (
              <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-sm font-semibold text-blue-900 mb-1">💎 Bestseller Alert!</p>
                <p className="text-xs text-blue-800">
                  "{productPerformance[0].name}" generates over 50% of your revenue. Consider creating similar products!
                </p>
              </div>
            )}

            {salesMetrics.avgOrderValue > 50 && (
              <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
                <p className="text-sm font-semibold text-amber-900 mb-1">💰 High-Value Orders!</p>
                <p className="text-xs text-amber-800">
                  Your average order value of ${salesMetrics.avgOrderValue.toFixed(2)} is strong. Consider upselling complementary products.
                </p>
              </div>
            )}

            {productPerformance.some(p => parseFloat(p.conversionRate) < 1 && p.views > 50) && (
              <div className="p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
                <p className="text-sm font-semibold text-orange-900 mb-1">🎯 Optimization Opportunity</p>
                <p className="text-xs text-orange-800">
                  Some products have high views but low conversions. Try improving product descriptions, images, or pricing.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}