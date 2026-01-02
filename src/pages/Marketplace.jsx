
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Store,
  ShoppingBag,
  Star,
  Package,
  BookOpen,
  Loader2,
  Sparkles,
  Grid,
  List,
  ArrowRight,
  User,
  Shield, // New icon for admin check
  ArrowLeft // New icon for admin check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom'; // Added Link
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';
import SearchAndFilter from '@/components/marketplace/SearchAndFilter';
import RecommendationsCarousel from '@/components/marketplace/RecommendationsCarousel';
import FlashSaleBanner from '@/components/marketplace/FlashSaleBanner';
import FeaturedCollections from '@/components/marketplace/FeaturedCollections';
import LoyaltyProgramDashboard from '@/components/marketplace/LoyaltyProgramDashboard';

export default function Marketplace() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Use a distinct loading state for the current user query to avoid conflicts
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null), // Added catch for null user if not authenticated
    retry: false
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['marketplace-products', activeTab, selectedCategory],
    queryFn: async () => {
      const allProducts = await base44.entities.MarketplaceProduct.filter({ status: 'active' });

      let filtered = allProducts;

      if (activeTab === 'digital') {
        filtered = allProducts.filter(p => p.product_type === 'digital_download');
      } else if (activeTab === 'physical') {
        filtered = allProducts.filter(p => p.product_type === 'physical');
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }

      return filtered;
    },
    initialData: []
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['marketplace-courses'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }),
    initialData: []
  });

  const { data: sellers = [], isLoading: sellersLoading } = useQuery({
    queryKey: ['marketplace-sellers'],
    queryFn: () => base44.entities.SellerProfile.filter({ verification_status: 'verified' }),
    initialData: []
  });

  // Combine all loading states
  const isLoading = userLoading || productsLoading || coursesLoading || sellersLoading;

  // Redirect non-admin users based on the new outline requirements
  useEffect(() => {
    if (!userLoading && user && user.role !== 'admin') {
      toast.error("You don't have permission to access this page.");
      navigate(createPageUrl('Home'));
    }
  }, [user, userLoading, navigate]);

  // Show a loading spinner specifically for the user data
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
      </div>
    );
  }

  // Display access denied message for non-admin users
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-2 border-red-300">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">This page is only accessible to administrators.</p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesPrice;
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery ||
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];

    return matchesSearch && matchesPrice;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'wellness_tools', label: 'Wellness Tools' },
    { value: 'digital_planners', label: 'Digital Planners' },
    { value: 'ebooks', label: 'E-Books' },
    { value: 'meditation_guides', label: 'Meditation Guides' },
    { value: 'journals', label: 'Journals' },
    { value: 'art_prints', label: 'Art Prints' }
  ];

  return (
    <>
      <SEO
        title="Marketplace - Helper33 | Wellness Courses, Tools & Digital Products"
        description="Discover wellness courses, digital planners, meditation guides, therapeutic tools, and more from verified creators. Shop mindfully for your personal growth journey."
        keywords="wellness marketplace, online courses, digital wellness products, meditation guides, therapeutic tools, wellness ebooks, mental health resources"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Store className="w-12 h-12" />
                <h1 className="text-5xl font-bold">Helper33 Marketplace</h1>
              </div>
              <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
                Discover wellness products and courses from verified creators
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold">{products.length}</div>
                  <div className="text-green-100 text-sm">Digital Products</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold">{courses.length}</div>
                  <div className="text-green-100 text-sm">Wellness Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold">{sellers.length}</div>
                  <div className="text-green-100 text-sm">Verified Sellers</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Become a Seller CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Share Your Wellness Creations</h3>
                    <p className="text-gray-700">Sell digital products, courses, and tools to the Helper33 community</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('SellerDashboard'))}
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                >
                  <Store className="w-5 h-5 mr-2" />
                  Start Selling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Loyalty Program Dashboard (for logged in users) */}
          {user && (
            <div className="mb-8">
              <LoyaltyProgramDashboard />
            </div>
          )}

          {/* Flash Sales */}
          <FlashSaleBanner />

          {/* Featured Collections */}
          <FeaturedCollections />

          {/* Search and Filters */}
          <div className="mb-8">
            <SearchAndFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              categories={categories}
            />
          </div>

          {/* Personalized Recommendations */}
          {user && (
            <div className="mb-8">
              <RecommendationsCarousel userId={user.email} />
            </div>
          )}

          {/* Products & Courses Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <TabsList className="bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  All Products
                </TabsTrigger>
                <TabsTrigger value="digital" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Digital
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="sellers" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sellers
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : filteredProducts.length === 0 && filteredCourses.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-6">Be the first to list a product on our marketplace!</p>
                    <Button
                      onClick={() => navigate(createPageUrl('SellerDashboard'))}
                      className="bg-green-600"
                    >
                      <Store className="w-5 h-5 mr-2" />
                      Become a Seller
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} navigate={navigate} />
                  ))}
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} viewMode={viewMode} navigate={navigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="digital">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Digital Products Found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or be the first to sell!</p>
                    <Button
                      onClick={() => navigate(createPageUrl('SellerDashboard'))}
                      className="bg-green-600"
                    >
                      Start Selling
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} navigate={navigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : filteredCourses.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-gray-600 mb-6">Check back soon for new wellness courses or create your own!</p>
                    <Button
                      onClick={() => navigate(createPageUrl('SellerDashboard'))}
                      className="bg-green-600"
                    >
                      Create a Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} viewMode={viewMode} navigate={navigate} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sellers">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : sellers.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Verified Sellers Yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to join our marketplace!</p>
                    <Button
                      onClick={() => navigate(createPageUrl('SellerDashboard'))}
                      className="bg-green-600"
                    >
                      Become a Seller
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellers.map((seller) => (
                    <SellerCard key={seller.id} seller={seller} navigate={navigate} />
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

// Product Card Component
function ProductCard({ product, viewMode, navigate }) {
  const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url;

  if (viewMode === 'list') {
    return (
      <Card
        className="hover:shadow-lg transition-all cursor-pointer bg-white"
        onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${product.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {primaryImage && (
              <img
                src={primaryImage}
                alt={product.product_name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{product.product_name}</h3>
                  <p className="text-sm text-gray-600">{product.seller_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${product.price}</div>
                  {product.compare_at_price && (
                    <div className="text-sm text-gray-500 line-through">${product.compare_at_price}</div>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                {product.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{product.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({product.review_count})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => navigate(createPageUrl('ProductDetail') + `?id=${product.id}`)}
    >
      <Card className="h-full hover:shadow-xl transition-all bg-white overflow-hidden">
        {primaryImage ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={primaryImage}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
            {product.product_type === 'digital_download' && (
              <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                Digital
              </Badge>
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{product.product_name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.seller_name}</p>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-green-600">${product.price}</div>
              {product.compare_at_price && (
                <div className="text-xs text-gray-500 line-through">${product.compare_at_price}</div>
              )}
            </div>
            {product.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{product.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Course Card Component
function CourseCard({ course, viewMode, navigate }) {
  if (viewMode === 'list') {
    return (
      <Card
        className="hover:shadow-lg transition-all cursor-pointer bg-white"
        onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${course.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-purple-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge className="bg-purple-100 text-purple-800 mb-2">Course</Badge>
                  <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.seller_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">${course.price}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">{course.tagline}</p>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {course.total_modules} modules • {course.total_duration_minutes} min
                </div>
                {course.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${course.id}`)}
    >
      <Card className="h-full hover:shadow-xl transition-all bg-white overflow-hidden">
        {course.cover_image_url ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
              Course
            </Badge>
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-purple-400" />
            <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
              Course
            </Badge>
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{course.seller_name}</p>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{course.tagline}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              {course.total_modules} modules
            </div>
            {course.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="text-xl font-bold text-purple-600">${course.price}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Seller Card Component
function SellerCard({ seller, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => navigate(createPageUrl('SellerProfile') + `?id=${seller.id}`)}
    >
      <Card className="h-full hover:shadow-xl transition-all bg-white overflow-hidden">
        {seller.shop_banner_url && (
          <div className="h-32 overflow-hidden">
            <img
              src={seller.shop_banner_url}
              alt={seller.shop_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-3 -mt-12">
            {seller.shop_logo_url ? (
              <img
                src={seller.shop_logo_url}
                alt={seller.shop_name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Store className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          <h3 className="font-bold text-lg text-gray-900 mb-1">{seller.shop_name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{seller.shop_bio}</p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-3">
            {seller.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{seller.average_rating.toFixed(1)}</span>
              </div>
            )}
            <div>{seller.total_orders || 0} sales</div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(createPageUrl('SellerProfile') + `?id=${seller.id}`);
            }}
            variant="outline"
            className="w-full"
          >
            Visit Shop
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
