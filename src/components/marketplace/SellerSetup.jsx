
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Store, 
  Loader2, 
  Upload,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SellerSetup({ onComplete }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    refetchOnWindowFocus: false
  });

  const [formData, setFormData] = useState({
    shop_name: '',
    shop_bio: '',
    shop_logo_url: '',
    shop_banner_url: '',
    seller_type: 'product_seller',
    expertise_areas: [],
    product_categories: ['digital_planners'],
    contact_email: '',
    contact_phone: '',
    business_address: {
      city: '',
      state: '',
      country: 'US'
    }
  });

  // Initialize contact_email when user loads
  useEffect(() => {
    if (user?.email && !formData.contact_email) {
      setFormData(prev => ({ ...prev, contact_email: user.email }));
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🛍️ === STARTING SHOP CREATION ===');
      console.log('📝 Form data:', JSON.stringify(data, null, 2));
      
      const currentUser = await base44.auth.me();
      console.log('👤 Current user:', currentUser.email);
      console.log('📧 User email will be set to:', currentUser.email);
      
      const slug = data.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('🔗 Generated slug:', slug);
      
      const profileData = {
        shop_name: data.shop_name,
        shop_bio: data.shop_bio,
        shop_slug: slug,
        shop_logo_url: data.shop_logo_url || '',
        shop_banner_url: data.shop_banner_url || '',
        seller_type: data.seller_type,
        product_categories: data.product_categories,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || '',
        business_address: data.business_address,
        user_email: currentUser.email,
        owner_name: currentUser.full_name,
        shop_opened_date: new Date().toISOString().split('T')[0],
        verification_status: 'pending',
        is_active: true,
        total_sales: 0,
        total_orders: 0,
        average_rating: 0,
        total_reviews: 0,
        seller_level: 'new',
        shop_theme: 'emerald_zen',
        shop_colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#34d399',
          background: '#f0fdf4'
        },
        shop_layout: 'grid',
        shop_font: 'modern'
      };
      
      console.log('💾 === CREATING SELLER PROFILE ===');
      
      const profile = await base44.entities.SellerProfile.create(profileData);
      
      console.log('✅ === PROFILE CREATED SUCCESSFULLY ===');
      console.log('🆔 Profile ID:', profile.id);
      console.log('🏪 Shop name:', profile.shop_name);
      console.log('📧 User email:', profile.user_email);
      console.log('👤 Created by:', profile.created_by);

      console.log('⚙️ === CREATING COMMISSION SETTINGS ===');
      const commissionSettings = await base44.entities.CommissionSettings.create({
        seller_id: profile.id,
        default_commission_rate: 10,
        payout_schedule: 'biweekly',
        minimum_payout_threshold: 50,
        hold_period_days: 7,
        current_balance: 0,
        total_commissions_paid: 0
      });
      console.log('✅ Commission settings created:', commissionSettings.id);

      console.log('🎉 === SHOP CREATION COMPLETE ===');
      console.log('✅ Shop ID:', profile.id);
      console.log('✅ Shop will be available immediately!');
      
      return profile;
    },
    onSuccess: async (profile) => {
      console.log('🎊 === ON SUCCESS TRIGGERED ===');
      console.log('✅ Profile object received:', profile.id);
      
      toast.success('🎉 Your shop is ready! Loading...', { duration: 2000 });
      
      // Wait a moment for database to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the page to freshly load the seller dashboard
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ === ERROR CREATING SHOP ===');
      console.error('Error:', error);
      console.error('Message:', error.message);
      toast.error(`Failed to create shop: ${error.message || 'Please try again'}`);
    }
  });

  const handleImageUpload = async (file, type) => {
    setUploading({ ...uploading, [type]: true });
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [`shop_${type}_url`]: file_url });
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded!`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}: ${error.message || 'Please try again.'}`);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.shop_name) {
      toast.error('Please enter your shop name');
      return;
    }

    if (!formData.contact_email) {
      toast.error('Please enter your contact email');
      return;
    }

    console.log('📝 Submitting form...');
    console.log('Form data:', formData);
    saveMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl border-t-4 border-green-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create Your Digital Shop</CardTitle>
            <CardDescription>
              Sell digital products, life stories, courses, mentorship, and wellness tools
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Step {step} of 3</p>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Shop Name *</label>
                <Input
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  placeholder="Your Shop Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shop Bio *</label>
                <Textarea
                  value={formData.shop_bio}
                  onChange={(e) => setFormData({ ...formData, shop_bio: e.target.value })}
                  placeholder="Tell buyers about your digital products, life stories, courses, or mentorship programs..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Email *</label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@yourshop.com"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Digital Products:</strong> Sell planners, journals, ebooks, courses, life stories, mentor advice, how-to guides, templates, and wellness tools with instant digital access!
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.shop_name || !formData.shop_bio || !formData.contact_email}
                className="w-full bg-green-600"
              >
                Next: Add Shop Images
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Shop Logo (Optional)</label>
                <div className="space-y-3">
                  {formData.shop_logo_url && (
                    <img 
                      src={formData.shop_logo_url} 
                      alt="Logo preview"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) handleImageUpload(e.target.files[0], 'logo');
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      {uploading.logo ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload shop logo</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shop Banner (Optional)</label>
                <div className="space-y-3">
                  {formData.shop_banner_url && (
                    <img 
                      src={formData.shop_banner_url} 
                      alt="Banner preview"
                      className="w-full h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) handleImageUpload(e.target.files[0], 'banner');
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      {uploading.banner ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload shop banner</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-green-600"
                >
                  Next: Location
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City (Optional)</label>
                  <Input
                    value={formData.business_address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      business_address: { ...formData.business_address, city: e.target.value }
                    })}
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State/Province (Optional)</label>
                  <Input
                    value={formData.business_address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      business_address: { ...formData.business_address, state: e.target.value }
                    })}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h5 className="font-bold text-green-900 mb-2">✨ You're Almost Ready to Sell!</h5>
                <p className="text-sm text-green-800">
                  Your digital shop will be created with instant access to upload products, courses, life stories, mentor programs, and more.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-lg py-6"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Your Shop...
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5 mr-2" />
                      Complete Setup & Start Selling
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
