import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Star, BookOpen, Package, MapPin, Mail, ArrowLeft, Loader2, CheckCircle, Users } from 'lucide-react';
import SEO from '@/components/SEO';

export default function SellerProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const sellerId = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('courses');

  const { data: seller, isLoading: isLoadingSeller } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      const allSellers = await base44.entities.SellerProfile.list();
      return allSellers.find(s => s.id === sellerId) || null;
    },
    enabled: !!sellerId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['sellerCourses', sellerId],
    queryFn: () => base44.entities.Course.filter({ seller_id: sellerId, status: 'published' }),
    enabled: !!sellerId && !!seller
  });

  const { data: products = [] } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => base44.entities.MarketplaceProduct.filter({ seller_id: sellerId, status: 'active' }),
    enabled: !!sellerId && !!seller
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['sellerReviews', sellerId],
    queryFn: () => base44.entities.MarketplaceReview.filter({ seller_id: sellerId, status: 'approved' }),
    enabled: !!sellerId && !!seller
  });

  if (isLoadingSeller) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading shop...</p>
      </div>
    );
  }

  if (!sellerId || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Seller Not Found</h2>
          <p className="text-gray-600 mb-6">This seller doesn't exist or is no longer active.</p>
          <Button onClick={() => navigate(createPageUrl('Marketplace'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const shopColors = seller.shop_colors || { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#f0fdf4' };

  return (
    <>
      <SEO title={`${seller.shop_name} - Helper33 Marketplace`} description={seller.shop_slogan || seller.shop_bio} />
      <div className="min-h-screen" style={{ backgroundColor: shopColors.background }}>
        <div className="relative h-64 overflow-hidden">
          {seller.shop_banner_url ? (
            <img src={seller.shop_banner_url} alt={seller.shop_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${shopColors.primary}, ${shopColors.secondary})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Button onClick={() => navigate(createPageUrl('Marketplace'))} variant="outline" className="absolute top-6 left-6 bg-white/90">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 pb-12">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {seller.shop_logo_url ? (
                    <img src={seller.shop_logo_url} alt={seller.shop_name} className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${shopColors.primary}, ${shopColors.secondary})` }}>
                      <Store className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">{seller.shop_name}</h1>
                      {seller.shop_slogan && <p className="text-xl mb-3 font-semibold" style={{ color: shopColors.secondary }}>{seller.shop_slogan}</p>}
                      {seller.shop_bio && <p className="text-lg text-gray-700">{seller.shop_bio}</p>}
                    </div>
                    <Badge className="text-white px-4 py-2" style={{ backgroundColor: shopColors.primary }}>
                      <CheckCircle className="w-4 h-4 mr-2" />Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: shopColors.primary + '15' }}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold">{seller.average_rating > 0 ? seller.average_rating.toFixed(1) : 'New'}</span>
                      </div>
                      <p className="text-xs text-gray-600">{seller.total_reviews || 0} Reviews</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: shopColors.secondary + '15' }}>
                      <BookOpen className="w-5 h-5 mx-auto mb-1" style={{ color: shopColors.secondary }} />
                      <span className="text-2xl font-bold block">{courses.length}</span>
                      <p className="text-xs text-gray-600">Courses</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: shopColors.accent + '15' }}>
                      <Package className="w-5 h-5 mx-auto mb-1" style={{ color: shopColors.accent }} />
                      <span className="text-2xl font-bold block">{products.length}</span>
                      <p className="text-xs text-gray-600">Products</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: shopColors.primary + '20' }}>
                      <Users className="w-5 h-5 mx-auto mb-1" style={{ color: shopColors.primary }} />
                      <span className="text-2xl font-bold block">{courses.reduce((s, c) => s + (c.enrollment_count || 0), 0)}</span>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
                    {seller.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${seller.contact_email}`}>{seller.contact_email}</a>
                      </div>
                    )}
                    {seller.business_address?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{seller.business_address.city}, {seller.business_address.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 p-1 shadow-lg rounded-2xl">
              {[
                { value: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
                { value: 'products', label: `Products (${products.length})`, icon: Package },
                { value: 'reviews', label: `Reviews (${reviews.length})`, icon: Star }
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl" style={{ backgroundColor: activeTab === tab.value ? shopColors.primary : 'transparent', color: activeTab === tab.value ? 'white' : 'inherit' }}>
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="courses">
              {courses.length === 0 ? (
                <Card><CardContent className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Courses Yet</h3>
                </CardContent></Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <Card key={course.id} className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${course.id}`)}>
                      {course.cover_image_url && <img src={course.cover_image_url} alt={course.title} className="w-full h-48 object-cover" />}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">${course.price}</span>
                          <Button size="sm" style={{ backgroundColor: shopColors.primary }} className="text-white">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="products">
              {products.length === 0 ? (
                <Card><CardContent className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Yet</h3>
                </CardContent></Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${product.id}`)}>
                      {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.product_name} className="w-full h-48 object-cover" />}
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{product.product_name}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">${product.price}</span>
                          <Button size="sm" style={{ backgroundColor: shopColors.accent }} className="text-white">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <Card><CardContent className="text-center py-20">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                </CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {review.reviewer_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold">{review.reviewer_name}</p>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.created_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{review.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}