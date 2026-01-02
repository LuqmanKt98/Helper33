import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Palette, 
  Image, 
  Type, 
  Layout,
  Sparkles,
  Save,
  Eye,
  Upload,
  Loader2,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SHOP_THEMES = [
  {
    id: 'emerald_zen',
    name: 'Emerald Zen',
    description: 'Calming green tones for wellness products',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#f0fdf4'
    },
    preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    id: 'ocean_calm',
    name: 'Ocean Calm',
    description: 'Soothing blue palette',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      background: '#f0f9ff'
    },
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
  },
  {
    id: 'sunset_warmth',
    name: 'Sunset Warmth',
    description: 'Warm oranges and reds',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#fff7ed'
    },
    preview: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  },
  {
    id: 'lavender_dream',
    name: 'Lavender Dream',
    description: 'Soft purple and pink hues',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      background: '#faf5ff'
    },
    preview: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
  },
  {
    id: 'forest_peace',
    name: 'Forest Peace',
    description: 'Deep greens and earthy tones',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ecfdf5'
    },
    preview: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  },
  {
    id: 'rose_garden',
    name: 'Rose Garden',
    description: 'Romantic pinks and roses',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#fdf2f8'
    },
    preview: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  {
    id: 'custom',
    name: 'Custom Colors',
    description: 'Design your own palette',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      background: '#eef2ff'
    },
    preview: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  }
];

const LAYOUT_STYLES = [
  { id: 'grid', name: 'Grid View', icon: '📱', description: 'Clean grid layout' },
  { id: 'masonry', name: 'Masonry', icon: '🧱', description: 'Pinterest-style layout' },
  { id: 'showcase', name: 'Showcase', icon: '✨', description: 'Large featured items' },
  { id: 'minimal', name: 'Minimal', icon: '⚪', description: 'Simple and clean' }
];

const FONT_STYLES = [
  { id: 'modern', name: 'Modern', description: 'Clean sans-serif' },
  { id: 'classic', name: 'Classic', description: 'Traditional serif' },
  { id: 'playful', name: 'Playful', description: 'Fun and friendly' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated script' }
];

export default function ShopCustomizer({ sellerProfile }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('theme');
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [customization, setCustomization] = useState({
    shop_theme: sellerProfile.shop_theme || 'emerald_zen',
    shop_colors: sellerProfile.shop_colors || SHOP_THEMES[0].colors,
    shop_slogan: sellerProfile.shop_slogan || '',
    shop_banner_url: sellerProfile.shop_banner_url || '',
    shop_logo_url: sellerProfile.shop_logo_url || '',
    shop_layout: sellerProfile.shop_layout || 'grid',
    shop_font: sellerProfile.shop_font || 'modern'
  });

  const updateShopMutation = useMutation({
    mutationFn: (data) => base44.entities.SellerProfile.update(sellerProfile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerProfile']);
      toast.success('✅ Shop customization saved!');
    },
    onError: (error) => {
      toast.error('Failed to save customization');
      console.error(error);
    }
  });

  const handleThemeSelect = (themeId) => {
    const theme = SHOP_THEMES.find(t => t.id === themeId);
    if (theme) {
      setCustomization({
        ...customization,
        shop_theme: themeId,
        shop_colors: theme.colors
      });
    }
  };

  const handleColorChange = (colorType, value) => {
    setCustomization({
      ...customization,
      shop_colors: {
        ...customization.shop_colors,
        [colorType]: value
      }
    });
  };

  const handleBannerUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCustomization({ ...customization, shop_banner_url: file_url });
    toast.success('Banner uploaded!');
    setUploading(false);
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCustomization({ ...customization, shop_logo_url: file_url });
    toast.success('Logo uploaded!');
    setUploading(false);
  };

  const handleSave = () => {
    updateShopMutation.mutate(customization);
  };

  const handleReset = () => {
    setCustomization({
      shop_theme: sellerProfile.shop_theme || 'emerald_zen',
      shop_colors: sellerProfile.shop_colors || SHOP_THEMES[0].colors,
      shop_slogan: sellerProfile.shop_slogan || '',
      shop_banner_url: sellerProfile.shop_banner_url || '',
      shop_logo_url: sellerProfile.shop_logo_url || '',
      shop_layout: sellerProfile.shop_layout || 'grid',
      shop_font: sellerProfile.shop_font || 'modern'
    });
    toast.success('Reset to saved settings');
  };

  const currentTheme = SHOP_THEMES.find(t => t.id === customization.shop_theme) || SHOP_THEMES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Shop Customization
          </h2>
          <p className="text-gray-600 text-sm mt-1">Personalize your shop's appearance and brand identity</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateShopMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {updateShopMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Preview Banner */}
      {previewMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-2xl overflow-hidden shadow-2xl border-4"
          style={{ borderColor: customization.shop_colors.primary }}
        >
          {customization.shop_banner_url ? (
            <img 
              src={customization.shop_banner_url} 
              alt="Shop banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ background: currentTheme.preview }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            {customization.shop_logo_url && (
              <img 
                src={customization.shop_logo_url} 
                alt="Logo"
                className="w-20 h-20 rounded-xl border-4 border-white shadow-xl object-cover"
              />
            )}
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{sellerProfile.shop_name}</h3>
              {customization.shop_slogan && (
                <p className="text-lg text-white/90">{customization.shop_slogan}</p>
              )}
            </div>
          </div>

          <Badge 
            className="absolute top-4 right-4 text-white border-white"
            style={{ backgroundColor: customization.shop_colors.primary }}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Preview Mode
          </Badge>
        </motion.div>
      )}

      {/* Customization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Choose Your Theme
              </CardTitle>
              <CardDescription>Select a pre-designed color scheme or create your own</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_THEMES.map((theme) => (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      customization.shop_theme === theme.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div 
                      className="w-full h-24 rounded-lg mb-3 shadow-md"
                      style={{ background: theme.preview }}
                    />
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900">{theme.name}</h4>
                      {customization.shop_theme === theme.id && (
                        <Badge className="bg-purple-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          {customization.shop_theme === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Color Palette</CardTitle>
                <CardDescription>Design your own unique color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
                    { key: 'secondary', label: 'Secondary Color', description: 'Supporting color' },
                    { key: 'accent', label: 'Accent Color', description: 'Highlights and CTAs' },
                    { key: 'background', label: 'Background', description: 'Page background' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.shop_colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={customization.shop_colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                Shop Slogan
              </CardTitle>
              <CardDescription>Create a memorable tagline for your shop (max 60 characters)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={customization.shop_slogan}
                  onChange={(e) => setCustomization({ ...customization, shop_slogan: e.target.value })}
                  placeholder="e.g., 'Wellness tools for your journey' or 'Digital products that inspire'"
                  maxLength={60}
                />
                <p className="text-xs text-gray-600">
                  {customization.shop_slogan.length}/60 characters
                </p>
                {customization.shop_slogan && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <p className="text-xl font-semibold text-gray-900">{sellerProfile.shop_name}</p>
                    <p className="text-lg text-gray-700">{customization.shop_slogan}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop Banner</CardTitle>
              <CardDescription>Upload a custom banner image (recommended: 1920x400px)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customization.shop_banner_url && (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img 
                      src={customization.shop_banner_url} 
                      alt="Shop banner"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/90"
                      onClick={() => setCustomization({ ...customization, shop_banner_url: '' })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) handleBannerUpload(e.target.files[0]);
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="font-semibold text-gray-800 mb-1">Upload New Banner</p>
                        <p className="text-sm text-gray-600">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop Logo</CardTitle>
              <CardDescription>Upload your shop logo (recommended: 400x400px square)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customization.shop_logo_url && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <img 
                      src={customization.shop_logo_url} 
                      alt="Shop logo"
                      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Current Logo</p>
                      <p className="text-sm text-gray-600">This will appear on your shop page</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCustomization({ ...customization, shop_logo_url: '' })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) handleLogoUpload(e.target.files[0]);
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="font-semibold text-gray-800 mb-1">Upload New Logo</p>
                        <p className="text-sm text-gray-600">Square image, PNG with transparency recommended</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-green-600" />
                Product Display Layout
              </CardTitle>
              <CardDescription>Choose how your products are displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {LAYOUT_STYLES.map((layout) => (
                  <motion.div
                    key={layout.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomization({ ...customization, shop_layout: layout.id })}
                    className={`cursor-pointer rounded-xl border-2 p-6 text-center transition-all ${
                      customization.shop_layout === layout.id
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-4xl mb-3">{layout.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{layout.name}</h4>
                    <p className="text-sm text-gray-600">{layout.description}</p>
                    {customization.shop_layout === layout.id && (
                      <Badge className="mt-3 bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-indigo-600" />
                Typography Style
              </CardTitle>
              <CardDescription>Select the font style for your shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {FONT_STYLES.map((font) => (
                  <motion.div
                    key={font.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCustomization({ ...customization, shop_font: font.id })}
                    className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                      customization.shop_font === font.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="mb-3">
                      <p 
                        className={`text-3xl mb-2 ${
                          font.id === 'modern' ? 'font-sans' :
                          font.id === 'classic' ? 'font-serif' :
                          font.id === 'playful' ? 'font-sans' :
                          'font-serif'
                        }`}
                        style={{
                          fontWeight: font.id === 'elegant' ? 400 : 700,
                          fontStyle: font.id === 'elegant' ? 'italic' : 'normal'
                        }}
                      >
                        Aa
                      </p>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{font.name}</h4>
                    <p className="text-sm text-gray-600">{font.description}</p>
                    {customization.shop_font === font.id && (
                      <Badge className="mt-3 bg-indigo-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <h5 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Preview Text
                </h5>
                <div 
                  className={`space-y-2 ${
                    customization.shop_font === 'modern' ? 'font-sans' :
                    customization.shop_font === 'classic' ? 'font-serif' :
                    customization.shop_font === 'playful' ? 'font-sans' :
                    'font-serif'
                  }`}
                >
                  <p className="text-3xl font-bold" style={{ color: customization.shop_colors.primary }}>
                    {sellerProfile.shop_name}
                  </p>
                  <p className="text-lg text-gray-700">
                    {customization.shop_slogan || 'Your shop slogan here'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Browse our collection of wellness products and digital downloads
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Customization Tips
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span><strong>Theme Colors:</strong> Choose colors that reflect your brand and product type</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span><strong>Slogan:</strong> Keep it short, memorable, and focused on customer benefits</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span><strong>Banner Image:</strong> Use high-quality images that showcase your products or brand story</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span><strong>Logo:</strong> Use a square transparent PNG for best results across all devices</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span><strong>Layout:</strong> Grid works best for shops with many similar products</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
              <span><strong>Pro Tip:</strong> Use the preview mode to see changes before saving!</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}