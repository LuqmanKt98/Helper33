import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Sparkles, 
  Megaphone,
  FileText,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import AIProductDescriptionGenerator from './AIProductDescriptionGenerator';
import AIMarketingCopyGenerator from './AIMarketingCopyGenerator';

const PRODUCT_CATEGORIES = [
  { value: 'digital_planners', label: 'Digital Planners & Journals' },
  { value: 'ebooks', label: 'eBooks & Guides' },
  { value: 'courses', label: 'Online Courses' },
  { value: 'life_stories', label: 'Life Stories & Memoirs' },
  { value: 'mentor_advice', label: 'Mentorship & Coaching' },
  { value: 'templates', label: 'Templates & Printables' },
  { value: 'how_to_guides', label: 'How-To Guides' },
  { value: 'wellness_tools', label: 'Wellness Tools' },
  { value: 'meditation_guides', label: 'Meditation & Mindfulness' },
  { value: 'art_prints', label: 'Art & Designs' }
];

export default function ProductManager({ sellerProfile, existingProducts = [], setCurrentProduct }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [productData, setProductData] = useState({
    product_name: '',
    description: '',
    product_type: 'digital_download',
    category: 'digital_planners',
    price: 0,
    images: [],
    digital_files: [],
    access_method: 'direct_download',
    access_url: '',
    access_instructions: '',
    delivery_method: 'automatic',
    file_upload_limit_mb: 500
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketplaceProduct.create({
      ...data,
      seller_id: sellerProfile.id,
      seller_name: sellerProfile.shop_name,
      slug: data.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerProducts']);
      setShowCreateModal(false);
      setEditingProduct(null);
      resetProductData();
      toast.success('✅ Product created!');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketplaceProduct.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerProducts']);
      setShowCreateModal(false);
      setEditingProduct(null);
      resetProductData();
      toast.success('✅ Product updated!');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.MarketplaceProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sellerProducts']);
      toast.success('Product deleted');
    }
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    resetProductData();
    setShowCreateModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductData({
      product_name: product.product_name || '',
      description: product.description || '',
      product_type: product.product_type || 'digital_download',
      category: product.category || 'digital_planners',
      price: product.price || 0,
      images: product.images || [],
      digital_files: product.digital_files || [],
      access_method: product.access_method || 'direct_download',
      access_url: product.access_url || '',
      access_instructions: product.access_instructions || '',
      delivery_method: product.delivery_method || 'automatic'
    });
    setShowCreateModal(true);
    if (setCurrentProduct) {
      setCurrentProduct(product);
    }
  };

  const resetProductData = () => {
    setProductData({
      product_name: '',
      description: '',
      product_type: 'digital_download',
      category: 'digital_planners',
      price: 0,
      images: [],
      digital_files: [],
      access_method: 'direct_download',
      access_url: '',
      access_instructions: '',
      delivery_method: 'automatic'
    });
  };

  const handleFileUpload = async (files) => {
    setUploadingFiles(true);
    const uploadedFiles = [];

    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedFiles.push({
        filename: file.name,
        file_url,
        file_type: file.type,
        file_size_mb: (file.size / (1024 * 1024)).toFixed(2)
      });
    }

    setProductData({
      ...productData,
      digital_files: [...productData.digital_files, ...uploadedFiles]
    });
    
    toast.success(`✅ ${uploadedFiles.length} file(s) uploaded!`);
    setUploadingFiles(false);
  };

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    const uploadedImages = [];

    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedImages.push({
        url: file_url,
        is_primary: productData.images.length === 0 && uploadedImages.length === 0,
        alt_text: productData.product_name
      });
    }

    setProductData({
      ...productData,
      images: [...productData.images, ...uploadedImages]
    });
    
    toast.success(`✅ ${uploadedImages.length} image(s) uploaded!`);
    setUploadingImages(false);
  };

  const removeFile = (index) => {
    const newFiles = productData.digital_files.filter((_, i) => i !== index);
    setProductData({ ...productData, digital_files: newFiles });
  };

  const removeImage = (index) => {
    const newImages = productData.images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    setProductData({ ...productData, images: newImages });
  };

  const setPrimaryImage = (index) => {
    const newImages = productData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setProductData({ ...productData, images: newImages });
  };

  const handleSubmit = () => {
    if (!productData.product_name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!productData.description.trim()) {
      toast.error('Please add a product description');
      return;
    }

    if (productData.access_method === 'external_url' && !productData.access_url.trim()) {
      toast.error('Please enter the access URL');
      return;
    }

    if (productData.access_method === 'direct_download' && productData.digital_files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Digital Products</h2>
          <p className="text-gray-600 text-sm">Courses, life stories, ebooks, mentor advice, and more</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {existingProducts.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Add your first digital product to start selling!</p>
            <Button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingProducts.map(product => (
            <Card key={product.id} className="bg-white hover:shadow-lg transition-all">
              <CardContent className="p-4">
                {product.images?.[0]?.url && (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
                    <img
                      src={product.images[0].url}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="mb-2">
                  <Badge className="bg-purple-100 text-purple-800 text-xs mb-1">
                    {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.product_name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 
                    product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {product.status}
                  </Badge>
                  <span className="font-bold text-blue-600">${product.price}</span>
                </div>
                {product.digital_files?.length > 0 && (
                  <p className="text-xs text-gray-600 mb-3">
                    📦 {product.digital_files.length} file(s)
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditProduct(product)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Delete this product?')) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              {editingProduct ? 'Edit Product' : 'Create New Digital Product'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white mb-4">
              <TabsTrigger value="basics">Product Details</TabsTrigger>
              <TabsTrigger value="files">Files & Access</TabsTrigger>
              <TabsTrigger value="ai-description" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Description
              </TabsTrigger>
              <TabsTrigger value="ai-marketing" className="flex items-center gap-1">
                <Megaphone className="w-3 h-3" />
                AI Marketing
              </TabsTrigger>
            </TabsList>

            {/* Basics Tab */}
            <TabsContent value="basics" className="space-y-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g., My Life Story: A Journey Through Healing"
                  value={productData.product_name}
                  onChange={(e) => setProductData({ ...productData, product_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Category *</Label>
                <select
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Product Description *</Label>
                <Textarea
                  placeholder="Describe your digital product, what buyers will learn or receive..."
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (USD) *</Label>
                  <Input
                    type="number"
                    placeholder="9.99"
                    step="0.01"
                    min="0"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Product Type</Label>
                  <select
                    value={productData.product_type}
                    onChange={(e) => setProductData({ ...productData, product_type: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="digital_download">Digital Download</option>
                    <option value="online_access">Online Access/URL</option>
                    <option value="service">Service/Coaching</option>
                  </select>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <div className="space-y-3">
                  {productData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={img.url} 
                            alt={img.alt_text}
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              img.is_primary ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          />
                          {img.is_primary && (
                            <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs">
                              Primary
                            </Badge>
                          )}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {!img.is_primary && (
                              <Button
                                size="icon"
                                className="h-6 w-6 bg-blue-500"
                                onClick={() => setPrimaryImage(idx)}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              className="h-6 w-6 bg-red-500"
                              onClick={() => removeImage(idx)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleImageUpload(e.target.files);
                      }}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      {uploadingImages ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload product images</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* Files & Access Tab */}
            <TabsContent value="files" className="space-y-4">
              <div>
                <Label>How will buyers access this product?</Label>
                <select
                  value={productData.access_method}
                  onChange={(e) => setProductData({ ...productData, access_method: e.target.value })}
                  className="w-full p-3 border rounded-lg mb-4"
                >
                  <option value="direct_download">Direct Download (Upload Files)</option>
                  <option value="external_url">External URL/Link</option>
                  <option value="manual_delivery">Manual Delivery (Email Instructions)</option>
                </select>
              </div>

              {/* Direct Download */}
              {productData.access_method === 'direct_download' && (
                <div>
                  <Label>Upload Your Digital Files *</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Upload PDFs, Word docs, images, videos, or any digital files
                  </p>
                  
                  {productData.digital_files.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {productData.digital_files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{file.filename}</p>
                              <p className="text-xs text-gray-600">{file.file_size_mb} MB</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(idx)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files.length > 0) handleFileUpload(e.target.files);
                      }}
                    />
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-blue-50">
                      {uploadingFiles ? (
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                          <p className="font-semibold text-gray-800 mb-1">Upload Files</p>
                          <p className="text-sm text-gray-600">PDF, DOCX, images, videos, ZIP files</p>
                          <p className="text-xs text-gray-500 mt-2">Up to 500MB total</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {/* External URL */}
              {productData.access_method === 'external_url' && (
                <div>
                  <Label>Access URL *</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Link to Google Drive, Dropbox, your course platform, or any URL
                  </p>
                  <Input
                    placeholder="https://drive.google.com/... or https://yoursite.com/course"
                    value={productData.access_url}
                    onChange={(e) => setProductData({ ...productData, access_url: e.target.value })}
                  />
                </div>
              )}

              {/* Access Instructions */}
              <div>
                <Label>Access Instructions for Buyers *</Label>
                <p className="text-xs text-gray-600 mb-2">
                  Instructions sent to buyers after purchase (how to access, use, or download)
                </p>
                <Textarea
                  placeholder="After purchase, you'll receive instant access to download all files. Save them to your device for offline access. If you have any questions, contact me directly through the marketplace messaging system."
                  value={productData.access_instructions}
                  onChange={(e) => setProductData({ ...productData, access_instructions: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✨ Delivery Method</h4>
                <select
                  value={productData.delivery_method}
                  onChange={(e) => setProductData({ ...productData, delivery_method: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="automatic">Automatic - Instant Access After Payment</option>
                  <option value="manual">Manual - I'll Email Access Within 24 Hours</option>
                </select>
              </div>
            </TabsContent>

            {/* AI Description Tab */}
            <TabsContent value="ai-description">
              <AIProductDescriptionGenerator 
                onUseDescription={(desc) => {
                  setProductData({ ...productData, description: desc });
                  toast.success('Description applied!');
                }}
                productName={productData.product_name}
                currentDescription={productData.description}
              />
            </TabsContent>

            {/* AI Marketing Tab */}
            <TabsContent value="ai-marketing">
              <AIMarketingCopyGenerator 
                productName={productData.product_name}
                productDescription={productData.description}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => { 
              setShowCreateModal(false); 
              setEditingProduct(null); 
              resetProductData(); 
            }} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              className="bg-green-600"
            >
              {createProductMutation.isPending || updateProductMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}