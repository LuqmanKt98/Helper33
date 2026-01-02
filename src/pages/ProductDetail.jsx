
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Star,
  ArrowLeft,
  ShoppingCart,
  Truck,
  Download,
  Shield,
  CheckCircle,
  Store,
  MessageCircle,
  Ruler,
  Weight,
  FileText,
  Trophy // New import
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import ReviewForm from '@/components/marketplace/ReviewForm';
import BuyerSellerMessaging from '@/components/marketplace/BuyerSellerMessaging'; // New import

export default function ProductDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showMessaging, setShowMessaging] = useState(false); // New state

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    }
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.MarketplaceProduct.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => base44.entities.MarketplaceReview.filter({
      item_id: productId,
      item_type: 'product',
      status: 'approved'
    }),
    enabled: !!productId
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['sellerProfile', product?.seller_id],
    queryFn: async () => {
      const sellers = await base44.entities.SellerProfile.filter({ id: product.seller_id });
      return sellers[0];
    },
    enabled: !!product?.seller_id
  });

  const { data: userPurchase } = useQuery({
    queryKey: ['userProductPurchase', productId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const orders = await base44.entities.MarketplaceOrder.filter({
        buyer_email: user.email,
        order_status: 'completed'
      });

      // Check if user has purchased this product
      const purchasedOrder = orders.find(order =>
        order.items?.some(item => item.item_id === productId && item.item_type === 'product')
      );

      return purchasedOrder;
    },
    enabled: !!productId && !!user
  });

  const { data: userReview } = useQuery({
    queryKey: ['userProductReview', productId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const reviews = await base44.entities.MarketplaceReview.filter({
        item_id: productId,
        item_type: 'product',
        reviewer_email: user.email
      });
      return reviews[0];
    },
    enabled: !!productId && !!user
  });

  // New query for existing conversation
  const { data: existingConversation } = useQuery({
    queryKey: ['existingConversation', productId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const convs = await base44.entities.MarketplaceConversation.filter({
        buyer_email: user.email,
        item_id: productId,
        item_type: 'product'
      });
      return convs[0];
    },
    enabled: !!productId && !!user
  });

  // New query for loyalty points
  const { data: loyaltyPoints } = useQuery({
    queryKey: ['loyaltyPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.BuyerLoyaltyPoints.filter({ created_by: user.email });
      return points[0];
    },
    enabled: !!user
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productData) => {
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const cart = await base44.entities.ShoppingCart.filter({ created_by: user.email }).then(carts => carts[0]);

      const newItem = {
        item_id: productData.id,
        item_type: 'product',
        item_name: productData.product_name,
        item_image: productData.images?.[0]?.url,
        seller_id: productData.seller_id,
        seller_name: productData.seller_name,
        quantity: quantity,
        price: productData.price,
        variant_id: selectedVariant,
        added_at: new Date().toISOString()
      };

      if (cart) {
        const existingItems = cart.items || [];
        const existingIndex = existingItems.findIndex(item =>
          item.item_id === productData.id &&
          item.item_type === 'product' &&
          item.variant_id === selectedVariant
        );

        if (existingIndex >= 0) {
          existingItems[existingIndex].quantity += quantity;
          await base44.entities.ShoppingCart.update(cart.id, {
            items: existingItems,
            subtotal: (cart.subtotal || 0) + (productData.price * quantity),
            total: (cart.total || 0) + (productData.price * quantity)
          });
        } else {
          await base44.entities.ShoppingCart.update(cart.id, {
            items: [...existingItems, newItem],
            subtotal: (cart.subtotal || 0) + (productData.price * quantity),
            total: (cart.total || 0) + (productData.price * quantity)
          });
        }
      } else {
        await base44.entities.ShoppingCart.create({
          items: [newItem],
          subtotal: productData.price * quantity,
          total: productData.price * quantity
        });
      }

      toast.success('Added to cart!');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shoppingCart']);
    }
  });

  const pointsWillEarn = Math.floor((product?.price || 0) * (loyaltyPoints?.tier === 'diamond' ? 5 : loyaltyPoints?.tier === 'platinum' ? 3 : loyaltyPoints?.tier === 'gold' ? 2 : loyaltyPoints?.tier === 'silver' ? 1.5 : 1));


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Package className="w-8 h-8 text-green-600" />
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
          <Button onClick={() => navigate(createPageUrl('Marketplace'))}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.url || images[0]?.url;
  const inStock = !product.track_inventory || product.inventory_count > 0;

  return (
    <>
      <SEO
        title={`${product.product_name} - DobryLife Marketplace`}
        description={product.description}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate(createPageUrl('Marketplace'))}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Product Images */}
            <div className="space-y-4">
              {currentImage && (
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white"
                >
                  <img
                    src={currentImage}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-green-600 shadow-lg scale-105' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info & Purchase */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-green-100 text-green-800 text-sm">
                  {product.category.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.product_name}</h1>

                {product.average_rating > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(product.average_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-lg">{product.average_rating.toFixed(1)}</span>
                    <span className="text-gray-600">({product.review_count} reviews)</span>
                  </div>
                )}
              </div>

              {/* Pricing Card */}
              <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-3 mb-4">
                    <div className="text-5xl font-bold text-gray-900">
                      ${product.price}
                    </div>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <>
                        <div className="text-2xl text-gray-500 line-through">
                          ${product.compare_at_price}
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          Save ${(product.compare_at_price - product.price).toFixed(2)}
                        </Badge>
                      </>
                    )}
                  </div>

                  {inStock ? (
                    <div className="text-green-600 font-medium mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle className="w-5 h-5" />
                      In Stock
                      {product.track_inventory && product.inventory_count < 10 && (
                        <span className="text-sm text-orange-600">
                          (Only {product.inventory_count} left!)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600 font-medium mb-4 text-lg">
                      Out of Stock
                    </div>
                  )}

                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Select {product.variants[0].option_type || 'Option'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <Button
                            key={variant.variant_id}
                            variant={selectedVariant === variant.variant_id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedVariant(variant.variant_id)}
                            className={selectedVariant === variant.variant_id ? 'bg-green-600' : ''}
                          >
                            {variant.option_value}
                            {variant.price_adjustment !== 0 && (
                              <span className="ml-1">
                                ({variant.price_adjustment > 0 ? '+' : ''}${variant.price_adjustment})
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <label className="text-sm font-medium">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={product.track_inventory && quantity >= product.inventory_count}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => addToCartMutation.mutate(product)}
                    disabled={!inStock || addToCartMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-lg py-6 mb-3"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                  </Button>

                  {user && ( // Only show if user is logged in
                    <Button
                      onClick={() => setShowMessaging(true)}
                      variant="outline"
                      className="w-full border-2"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask Seller a Question
                    </Button>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 border-t pt-4 mt-4">
                    {product.product_type === 'digital_download' && (
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Instant digital download after purchase</span>
                      </div>
                    )}
                    {product.shipping_required && (
                      <>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-green-600" />
                          <span>Ships within 1-2 business days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Free shipping on orders over $50</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Buyer protection included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info */}
              {sellerProfile && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5 text-blue-600" />
                      Sold By
                    </h3>
                    <div className="flex items-start gap-4">
                      {sellerProfile.shop_logo_url && (
                        <img
                          src={sellerProfile.shop_logo_url}
                          alt={sellerProfile.shop_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">{sellerProfile.shop_name}</h4>
                        {sellerProfile.shop_bio && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{sellerProfile.shop_bio}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {sellerProfile.average_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{sellerProfile.average_rating.toFixed(1)}</span>
                              <span>({sellerProfile.total_reviews} reviews)</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => navigate(createPageUrl('SellerProfile') + `?id=${sellerProfile.id}`)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Store className="w-4 h-4 mr-2" />
                          View Seller's Shop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Add Loyalty Points Info */}
          {user && loyaltyPoints && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Earn {pointsWillEarn} loyalty points with this purchase!
                    </p>
                    <p className="text-sm text-gray-600">
                      You have {loyaltyPoints.available_points} points available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 shadow-lg">
              <TabsTrigger value="details" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Truck className="w-4 h-4 mr-2" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="qa" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-6 h-6 text-blue-600" />
                    Product Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Product Type</p>
                        <p className="font-semibold text-gray-900">
                          {product.product_type === 'digital_download' ? 'Digital Download' : 'Physical Product'}
                        </p>
                      </div>
                    </div>

                    {product.subcategory && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-semibold text-gray-900">{product.subcategory}</p>
                        </div>
                      </div>
                    )}

                    {product.shipping_weight_oz && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Weight className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Weight</p>
                          <p className="font-semibold text-gray-900">{product.shipping_weight_oz} oz</p>
                        </div>
                      </div>
                    )}

                    {product.shipping_dimensions && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <Ruler className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Dimensions</p>
                          <p className="font-semibold text-gray-900">
                            {product.shipping_dimensions.length} x {product.shipping_dimensions.width} x {product.shipping_dimensions.height} {product.shipping_dimensions.unit}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.sku && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">SKU</p>
                          <p className="font-semibold text-gray-900">{product.sku}</p>
                        </div>
                      </div>
                    )}

                    {product.digital_files && product.digital_files.length > 0 && (
                      <div className="sm:col-span-2 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Download className="w-5 h-5 text-blue-600" />
                          Included Digital Files
                        </h4>
                        <div className="space-y-2">
                          {product.digital_files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-800">{file.filename}</span>
                              <Badge className="ml-auto text-xs">
                                {file.file_type} • {file.file_size_mb}MB
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-6 mt-6">
              {product.shipping_required ? (
                <>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-6 h-6 text-green-600" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Standard Shipping</p>
                          <p className="text-2xl font-bold text-gray-900">$4.99</p>
                          <p className="text-xs text-gray-600 mt-1">5-7 business days</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border-2 border-green-400">
                          <p className="text-sm text-gray-600 mb-1">Free Shipping</p>
                          <p className="text-2xl font-bold text-green-600">$0.00</p>
                          <p className="text-xs text-gray-600 mt-1">On orders over $50</p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-lg space-y-3">
                        <h4 className="font-semibold text-gray-900">Shipping Details</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Orders ship within 1-2 business days</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Tracking number provided for all shipments</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Ships to US addresses only</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Secure packaging to prevent damage</span>
                          </div>
                        </div>
                      </div>

                      {sellerProfile?.policies?.shipping_policy && (
                        <div className="p-4 bg-white rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Seller's Shipping Policy</h4>
                          <p className="text-sm text-gray-700">{sellerProfile.policies.shipping_policy}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-purple-600" />
                        Return & Refund Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sellerProfile?.policies?.refund_policy ? (
                        <p className="text-gray-700 leading-relaxed">{sellerProfile.policies.refund_policy}</p>
                      ) : (
                        <div className="space-y-2 text-gray-700">
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>30-day money-back guarantee</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Return shipping covered for defective items</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Full refund if item not as described</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <CardContent className="text-center py-20">
                    <Download className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Digital Product</h3>
                    <p className="text-gray-700 text-lg mb-6">
                      This is a digital download - no shipping required!
                    </p>
                    <div className="max-w-md mx-auto space-y-3 text-left">
                      <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Instant Access</p>
                          <p className="text-sm text-gray-600">Download immediately after purchase</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Lifetime Access</p>
                          <p className="text-sm text-gray-600">Re-download anytime from your account</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">All File Formats Included</p>
                          <p className="text-sm text-gray-600">
                            {product.digital_files?.length || 0} files ready to use
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="qa" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                    Customer Questions & Answers
                  </CardTitle>
                  <CardDescription>Get answers from the seller and other customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Questions Yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to ask a question about this product!</p>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!user}
                      onClick={() => setShowMessaging(true)} // Open messaging when "Ask a Question" is clicked
                    >
                      Ask a Question
                    </Button>
                    {!user && (
                      <p className="text-xs text-gray-500 mt-2">Sign in to ask questions</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6 mt-6">
              {/* Review Form for Verified Buyers */}
              {userPurchase && !userReview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ReviewForm
                    itemId={productId}
                    itemType="product"
                    itemTitle={product.product_name}
                    sellerId={product.seller_id}
                    orderId={userPurchase.id}
                    onSuccess={() => {
                      queryClient.invalidateQueries(['userProductReview', productId, user?.email]);
                      queryClient.invalidateQueries(['productReviews', productId]);
                    }}
                  />
                </motion.div>
              )}

              {/* User's Existing Review */}
              {userReview && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Your Review</h4>
                      <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">
                        {userReview.status === 'approved' ? 'Published' : 'Pending Moderation'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < userReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    {userReview.title && (
                      <h5 className="font-semibold text-gray-900 mb-2">{userReview.title}</h5>
                    )}
                    <p className="text-gray-700 leading-relaxed">{userReview.content}</p>
                    {userReview.images && userReview.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {userReview.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Not Purchased Message */}
              {!userPurchase && !userReview && user && (
                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardContent className="text-center py-12">
                    <Star className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase to Leave a Review</h3>
                    <p className="text-gray-700 mb-4">
                      Only verified buyers can write reviews for this product
                    </p>
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Purchase Protection
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {!user && (
                <Card className="bg-purple-50 border-2 border-purple-200">
                  <CardContent className="text-center py-12">
                    <Star className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In to Review</h3>
                    <p className="text-gray-700 mb-4">
                      Please sign in and purchase to leave a review
                    </p>
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Existing Reviews */}
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">
                      {userPurchase || userReview ? 'Be the first to review this product!' : 'Purchase to see and write reviews'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Rating Summary */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-gray-900 mb-2">
                            {product.average_rating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${i < Math.round(product.average_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{product.review_count} reviews</p>
                        </div>

                        <div className="flex-1 w-full">
                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-1 w-20">
                                  <span className="text-sm font-medium">{rating}</span>
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: rating * 0.1 }}
                                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {review.reviewer_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-semibold text-gray-900">{review.reviewer_name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                          />
                                        ))}
                                      </div>
                                      {review.verified_purchase && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified Purchase
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.created_date).toLocaleDateString()}
                                  </span>
                                </div>

                                {review.title && (
                                  <h5 className="font-semibold text-gray-900 mb-2 text-lg">{review.title}</h5>
                                )}
                                <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>

                                {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mb-3">
                                    {review.images.map((img, imgIdx) => (
                                      <img
                                        key={imgIdx}
                                        src={img}
                                        alt=""
                                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                                      />
                                    ))}
                                  </div>
                                )}

                                {review.seller_response && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Store className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold text-blue-900">Seller Response</span>
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {new Date(review.seller_responded_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700">{review.seller_response}</p>
                                  </div>
                                )}

                                {review.helpful_count > 0 && (
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                      {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Messaging Modal */}
      <AnimatePresence>
        {showMessaging && user && product && sellerProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl"
            >
              <BuyerSellerMessaging
                conversationId={existingConversation?.id}
                sellerId={product.seller_id}
                sellerName={product.seller_name}
                itemId={productId}
                itemType="product"
                itemName={product.product_name}
                itemImage={product.images?.[0]?.url}
                onClose={() => setShowMessaging(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
