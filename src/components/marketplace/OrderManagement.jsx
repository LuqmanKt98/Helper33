import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  Truck, 
  Search,
  Download,
  RefreshCw,
  Mail,
  XCircle,
  DollarSign,
  User,
  Eye,
  AlertCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function OrderManagement({ sellerProfile, orders = [] }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }) => base44.entities.MarketplaceOrder.update(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerOrders']);
      toast.success('✅ Order updated!');
      setShowDetailsModal(false);
    },
    onError: (error) => {
      toast.error('Failed to update order');
      console.error(error);
    }
  });

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'date_asc':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'amount_desc':
          return (b.seller_payout || 0) - (a.seller_payout || 0);
        case 'amount_asc':
          return (a.seller_payout || 0) - (b.seller_payout || 0);
        case 'buyer_name':
          return (a.buyer_name || '').localeCompare(b.buyer_name || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [orders, searchQuery, statusFilter, sortBy]);

  // Order statistics
  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.order_status === 'pending').length;
    const processing = orders.filter(o => o.order_status === 'processing').length;
    const completed = orders.filter(o => o.order_status === 'completed').length;
    const needsAttention = orders.filter(o => 
      o.order_status === 'pending' || 
      o.order_status === 'refund_requested' ||
      o.fulfillment_status === 'unfulfilled'
    ).length;

    return { total, pending, processing, completed, needsAttention };
  }, [orders]);

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderMutation.mutate({
      orderId,
      updates: { order_status: newStatus }
    });
  };

  const handleFulfillmentUpdate = (orderId, fulfillmentStatus, trackingNumber = '') => {
    const updates = {
      fulfillment_status: fulfillmentStatus
    };
    
    if (trackingNumber) {
      updates.tracking_number = trackingNumber;
      updates.shipped_at = new Date().toISOString();
    }
    
    if (fulfillmentStatus === 'fulfilled') {
      updates.order_status = 'completed';
    }

    updateOrderMutation.mutate({ orderId, updates });
  };

  const handleRefund = () => {
    if (!selectedOrder || !refundReason) {
      toast.error('Please enter a refund reason');
      return;
    }

    updateOrderMutation.mutate({
      orderId: selectedOrder.id,
      updates: {
        order_status: 'refunded',
        refund_amount: selectedOrder.total_amount,
        refund_reason: refundReason,
        payment_status: 'refunded'
      }
    });

    setShowRefundModal(false);
    setRefundReason('');
  };

  const exportOrders = () => {
    const csvData = filteredAndSortedOrders.map(order => ({
      OrderNumber: order.order_number,
      Date: new Date(order.created_date).toLocaleDateString(),
      BuyerName: order.buyer_name,
      BuyerEmail: order.buyer_email,
      Items: order.items?.map(i => i.item_name).join('; '),
      Total: order.total_amount,
      SellerPayout: order.seller_payout,
      Status: order.order_status,
      PaymentStatus: order.payment_status,
      FulfillmentStatus: order.fulfillment_status
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported!');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-teal-100 text-teal-800 border-teal-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
      refund_requested: 'bg-orange-100 text-orange-800 border-orange-300',
      refunded: 'bg-red-100 text-red-800 border-red-300',
      disputed: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Order Management
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage and fulfill your customer orders</p>
        </div>
        <Button onClick={exportOrders} variant="outline" disabled={filteredAndSortedOrders.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{orderStats.total}</p>
                <p className="text-xs text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{orderStats.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{orderStats.processing}</p>
                <p className="text-xs text-gray-600">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{orderStats.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders by number, buyer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="refund_requested">Refund Requested</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="buyer_name">Buyer Name (A-Z)</option>
            </select>

            <Button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSortBy('date_desc');
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Needs Attention Section */}
      {orderStats.needsAttention > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-orange-900 mb-1">Needs Your Attention</h4>
                <p className="text-sm text-orange-800">
                  You have {orderStats.needsAttention} order{orderStats.needsAttention !== 1 ? 's' : ''} that need action
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {orders.length === 0 ? 'No Orders Yet' : 'No Matching Orders'}
            </h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? 'Your orders will appear here once customers make purchases'
                : 'Try adjusting your filters or search query'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-xl text-gray-900 mb-1">
                            Order #{order.order_number}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.order_status)}>
                            {order.order_status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          {order.order_type === 'digital_download' && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Digital
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">Customer</p>
                            <p className="font-semibold text-gray-900">{order.buyer_name}</p>
                            <p className="text-sm text-gray-600">{order.buyer_email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-600">Your Payout</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${(order.seller_payout || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              from ${order.total_amount?.toFixed(2)} total
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-semibold text-gray-700">Order Items:</p>
                        {order.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Package className="w-4 h-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.item_name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price_per_unit?.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-bold text-blue-600">
                              ${item.total_price?.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Payment:</span>
                        <Badge className={
                          order.payment_status === 'released_to_seller' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'held_in_escrow' ? 'bg-blue-100 text-blue-800' :
                          order.payment_status === 'refunded' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {order.payment_status?.replace(/_/g, ' ')}
                        </Badge>
                        {order.escrow_release_date && order.payment_status === 'held_in_escrow' && (
                          <span className="text-xs text-gray-600">
                            (Releases: {new Date(order.escrow_release_date).toLocaleDateString()})
                          </span>
                        )}
                      </div>

                      {/* Shipping Address (if applicable) */}
                      {order.shipping_address && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-xs text-purple-700 font-semibold mb-1">Shipping Address:</p>
                              <p className="text-sm text-gray-900">{order.shipping_address.recipient_name}</p>
                              <p className="text-sm text-gray-700">{order.shipping_address.street}</p>
                              <p className="text-sm text-gray-700">
                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                              </p>
                              {order.shipping_address.phone && (
                                <p className="text-sm text-gray-700">📞 {order.shipping_address.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="lg:w-64 flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {/* Quick Actions based on status */}
                      {order.order_status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="w-full bg-blue-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Order
                        </Button>
                      )}

                      {order.order_status === 'confirmed' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          className="w-full bg-purple-600"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Start Processing
                        </Button>
                      )}

                      {(order.order_status === 'processing' || order.order_status === 'confirmed') && 
                       order.fulfillment_status === 'unfulfilled' && (
                        <Button
                          onClick={() => {
                            const tracking = prompt('Enter tracking number (optional):');
                            handleFulfillmentUpdate(order.id, 'fulfilled', tracking || '');
                          }}
                          className="w-full bg-green-600"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Mark as Shipped
                        </Button>
                      )}

                      {order.order_status === 'shipped' && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          className="w-full bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Completed
                        </Button>
                      )}

                      {order.order_status === 'refund_requested' && (
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRefundModal(true);
                          }}
                          className="w-full bg-orange-600"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Process Refund
                        </Button>
                      )}

                      {order.buyer_email && (
                        <Button
                          onClick={() => window.location.href = `mailto:${order.buyer_email}?subject=Order ${order.order_number}`}
                          variant="outline"
                          className="w-full"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email Customer
                        </Button>
                      )}

                      {order.tracking_number && (
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <p className="text-xs text-indigo-700 font-semibold mb-1">Tracking:</p>
                          <p className="text-sm font-mono text-gray-900">{order.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Order #{selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Complete order details and management options
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedOrder.order_status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold">Order Placed</p>
                      <p className="text-xs text-gray-600">
                        {new Date(selectedOrder.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      ['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(selectedOrder.order_status)
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold">Confirmed</p>
                      <p className="text-xs text-gray-600">Order confirmed by seller</p>
                    </div>
                  </div>

                  {selectedOrder.shipped_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-semibold">Shipped</p>
                        <p className="text-xs text-gray-600">
                          {new Date(selectedOrder.shipped_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.delivered_at && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-semibold">Delivered</p>
                        <p className="text-xs text-gray-600">
                          {new Date(selectedOrder.delivered_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Detail */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price_per_unit?.toFixed(2)}
                        </p>
                        <Badge className="mt-1 text-xs bg-purple-100 text-purple-800">
                          {item.item_type}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        ${item.total_price?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shipping:</span>
                      <span className="font-semibold">${selectedOrder.shipping_cost?.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <span className="font-semibold">${selectedOrder.tax_amount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-green-300">
                    <span className="text-gray-900 font-bold">Order Total:</span>
                    <span className="font-bold text-green-700">${selectedOrder.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-green-300">
                    <span className="text-gray-700">Platform Fee ({sellerProfile.platform_commission_rate || 10}%):</span>
                    <span className="text-red-600">-${selectedOrder.platform_fee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-green-400">
                    <span className="text-green-900 font-bold text-lg">Your Payout:</span>
                    <span className="font-bold text-green-700 text-lg">
                      ${selectedOrder.seller_payout?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.order_status !== 'confirmed' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  
                  {selectedOrder.order_status !== 'processing' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                      variant="outline"
                      size="sm"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Processing
                    </Button>
                  )}
                  
                  {selectedOrder.order_status !== 'shipped' && selectedOrder.fulfillment_status !== 'fulfilled' && (
                    <Button
                      onClick={() => {
                        const tracking = prompt('Enter tracking number (optional):');
                        handleFulfillmentUpdate(selectedOrder.id, 'fulfilled', tracking || '');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Truck className="w-4 h-4 mr-1" />
                      Mark Shipped
                    </Button>
                  )}
                  
                  {selectedOrder.order_status !== 'completed' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  
                  {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'completed' && (
                    <Button
                      onClick={() => {
                        if (confirm('Cancel this order? This action cannot be undone.')) {
                          handleStatusUpdate(selectedOrder.id, 'cancelled');
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  
                  {selectedOrder.order_status !== 'refunded' && selectedOrder.payment_status !== 'refunded' && (
                    <Button
                      onClick={() => setShowRefundModal(true)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Issue Refund
                    </Button>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {(selectedOrder.buyer_notes || selectedOrder.seller_notes) && (
                <div className="space-y-3">
                  {selectedOrder.buyer_notes && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Buyer Notes:</p>
                      <p className="text-sm text-gray-900">{selectedOrder.buyer_notes}</p>
                    </div>
                  )}
                  
                  {selectedOrder.seller_notes && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold mb-1">Your Notes:</p>
                      <p className="text-sm text-gray-900">{selectedOrder.seller_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-orange-600" />
              Process Refund
            </DialogTitle>
            <DialogDescription>
              Issue a full refund for order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
              <p className="text-sm text-orange-900 font-semibold mb-2">
                ⚠️ This will refund ${selectedOrder?.total_amount?.toFixed(2)} to the customer
              </p>
              <p className="text-xs text-orange-800">
                The funds will be returned to the customer's original payment method. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Refund Reason *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain why this order is being refunded..."
                className="w-full p-3 border rounded-lg"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                setShowRefundModal(false);
                setRefundReason('');
              }} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!refundReason || updateOrderMutation.isPending}
              className="bg-orange-600"
            >
              {updateOrderMutation.isPending ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}