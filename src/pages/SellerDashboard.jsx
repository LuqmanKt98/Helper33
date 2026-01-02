import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ShoppingBag, DollarSign, TrendingUp, Package, Star, Settings,
  BarChart3, CheckCircle, Clock, AlertCircle, Plus, Loader2, Award, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.SellerProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: products = [] } = useQuery({
    queryKey: ['sellerProducts'],
    queryFn: () => base44.entities.MarketplaceProduct.filter({ seller_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['sellerCourses'],
    queryFn: () => base44.entities.Course.filter({ instructor_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: () => base44.entities.MarketplaceOrder.filter({ seller_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['sellerPayouts'],
    queryFn: () => base44.entities.SellerPayout.filter({ seller_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const stats = {
    totalProducts: products.length + courses.length,
    activeListings: [...products, ...courses].filter(p => p.is_active || p.status === 'published').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_amount || 0), 0),
    pendingPayouts: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
    avgRating: profile.average_rating || 0,
    totalReviews: profile.total_reviews || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{profile.business_name || profile.seller_name}</h1>
                <p className="text-white/80">{profile.tagline || 'Marketplace Seller'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white">
                    {stats.totalProducts} Listings
                  </Badge>
                  {profile.verified_seller && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user?.subscription_add_ons?.includes('premium_seller_badge') && (
                    <Badge className="bg-amber-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('AccountManager')}>
                <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Account
                </Button>
              </Link>
              <Link to={createPageUrl('SellerProfile?id=' + profile.id)}>
                <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  View Shop
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Active Listings" value={stats.activeListings} color="from-purple-500 to-pink-500" />
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="from-blue-500 to-cyan-500" />
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="from-green-500 to-emerald-500" />
          <StatCard icon={Clock} label="Pending Payouts" value={`$${stats.pendingPayouts.toFixed(2)}`} color="from-amber-500 to-orange-500" />
        </div>

        {stats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-bold text-orange-900">
                      {stats.pendingOrders} Order{stats.pendingOrders !== 1 ? 's' : ''} Need Attention
                    </p>
                    <p className="text-sm text-orange-700">Review and process pending orders</p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Review Orders
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${orders.filter(o => {
                          const orderDate = new Date(o.created_date);
                          const now = new Date();
                          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                        }).reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      <p className="text-sm text-gray-600">Avg Order</p>
                      <p className="text-2xl font-bold text-purple-700">
                        ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Seller Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-blue-700">{stats.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Sales Report
                  </Button>
                  <Link to={createPageUrl('Marketplace')}>
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Visit Marketplace
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet. Keep promoting your listings!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="p-4 border-2 border-purple-200 rounded-lg hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{order.buyer_name}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600">${order.total_amount}</p>
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-500' :
                              order.status === 'processing' ? 'bg-blue-500' :
                              order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Listings</CardTitle>
                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="p-4 border-2 border-purple-200 rounded-lg">
                      <div className="flex gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">${product.price}</p>
                          <Badge className="mt-1" variant={product.is_active ? 'default' : 'outline'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {courses.map(course => (
                    <div key={course.id} className="p-4 border-2 border-blue-200 rounded-lg">
                      <div className="flex gap-3">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt={course.title} className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-sm text-gray-600">${course.price}</p>
                          <Badge className="mt-1" variant={course.status === 'published' ? 'default' : 'outline'}>
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 border-2 border-purple-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{order.buyer_name}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${order.total_amount}</p>
                            <Badge className={
                              order.status === 'completed' ? 'bg-green-500' :
                              order.status === 'processing' ? 'bg-blue-500' :
                              order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <p className="text-3xl font-bold text-gray-800">{stats.avgRating.toFixed(1)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(0) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Upgrade for Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get detailed insights with advanced analytics add-on</p>
                <ul className="space-y-2 mb-4">
                  {[
                    'Traffic source analysis',
                    'Customer demographics',
                    'Product performance metrics',
                    'Revenue forecasting',
                    'Competitor insights'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-purple-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('AccountManager')}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No payouts yet</p>
                ) : (
                  <div className="space-y-3">
                    {payouts.map(payout => (
                      <div key={payout.id} className="p-4 border-2 border-green-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">${payout.amount}</p>
                            <p className="text-sm text-gray-600">{new Date(payout.created_date).toLocaleDateString()}</p>
                          </div>
                          <Badge className={
                            payout.status === 'completed' ? 'bg-green-500' :
                            payout.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                          }>
                            {payout.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Subscription Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.subscription_add_ons?.map((addon, i) => (
                      <Badge key={i} className="bg-purple-100 text-purple-700">{addon}</Badge>
                    ))}
                    {(!user?.subscription_add_ons || user.subscription_add_ons.length === 0) && (
                      <p className="text-sm text-gray-500">No add-ons active</p>
                    )}
                  </div>
                </div>
                <Link to={createPageUrl('AccountManager')}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Manage Add-ons & Subscription
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}