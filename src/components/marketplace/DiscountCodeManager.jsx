import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Copy,
  Trash2,
  Edit,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DiscountCodeManager({ sellerId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    applies_to: 'all_products',
    minimum_purchase_amount: 0,
    usage_limit: null,
    usage_limit_per_customer: 1,
    start_date: new Date().toISOString().slice(0, 16),
    expiration_date: '',
    first_time_customers_only: false,
    combine_with_other_discounts: false
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ['discountCodes', sellerId],
    queryFn: () => base44.entities.DiscountCode.filter({ seller_id: sellerId }),
    enabled: !!sellerId
  });

  const createCodeMutation = useMutation({
    mutationFn: (codeData) => base44.entities.DiscountCode.create(codeData),
    onSuccess: () => {
      queryClient.invalidateQueries(['discountCodes']);
      resetForm();
      toast.success('Discount code created! 🎉');
    }
  });

  const updateCodeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiscountCode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discountCodes']);
      resetForm();
      toast.success('Discount code updated!');
    }
  });

  const deleteCodeMutation = useMutation({
    mutationFn: (id) => base44.entities.DiscountCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['discountCodes']);
      toast.success('Discount code deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      applies_to: 'all_products',
      minimum_purchase_amount: 0,
      usage_limit: null,
      usage_limit_per_customer: 1,
      start_date: new Date().toISOString().slice(0, 16),
      expiration_date: '',
      first_time_customers_only: false,
      combine_with_other_discounts: false
    });
    setShowForm(false);
    setEditingCode(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const codeData = {
      seller_id: sellerId,
      ...formData,
      code: formData.code.toUpperCase(),
      discount_value: parseFloat(formData.discount_value),
      minimum_purchase_amount: parseFloat(formData.minimum_purchase_amount) || 0,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
    };

    if (editingCode) {
      updateCodeMutation.mutate({ id: editingCode.id, data: codeData });
    } else {
      createCodeMutation.mutate(codeData);
    }
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || '',
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      applies_to: code.applies_to,
      minimum_purchase_amount: code.minimum_purchase_amount || 0,
      usage_limit: code.usage_limit,
      usage_limit_per_customer: code.usage_limit_per_customer,
      start_date: code.start_date?.slice(0, 16) || '',
      expiration_date: code.expiration_date?.slice(0, 16) || '',
      first_time_customers_only: code.first_time_customers_only,
      combine_with_other_discounts: code.combine_with_other_discounts
    });
    setShowForm(true);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const toggleActive = (code) => {
    updateCodeMutation.mutate({
      id: code.id,
      data: { is_active: !code.is_active }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Discount Codes</h2>
          <p className="text-gray-600">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Code
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-600" />
                  {editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Discount Code *</Label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="WELCOME20"
                        required
                      />
                    </div>

                    <div>
                      <Label>Discount Type *</Label>
                      <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed_amount">Fixed Amount Off</option>
                        <option value="free_shipping">Free Shipping</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Description (Internal)</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Holiday sale promotion"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                      </Label>
                      <Input
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                        min={formData.discount_type === 'percentage' ? 1 : 0}
                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                        required
                      />
                    </div>

                    <div>
                      <Label>Minimum Purchase ($)</Label>
                      <Input
                        type="number"
                        value={formData.minimum_purchase_amount}
                        onChange={(e) => setFormData({...formData, minimum_purchase_amount: e.target.value})}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Usage Limit (blank = unlimited)</Label>
                      <Input
                        type="number"
                        value={formData.usage_limit || ''}
                        onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>

                    <div>
                      <Label>Per Customer Limit</Label>
                      <Input
                        type="number"
                        value={formData.usage_limit_per_customer}
                        onChange={(e) => setFormData({...formData, usage_limit_per_customer: e.target.value})}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Expiration Date (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">First-time customers only</Label>
                      <Switch
                        checked={formData.first_time_customers_only}
                        onCheckedChange={(checked) => setFormData({...formData, first_time_customers_only: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Can combine with other discounts</Label>
                      <Switch
                        checked={formData.combine_with_other_discounts}
                        onCheckedChange={(checked) => setFormData({...formData, combine_with_other_discounts: checked})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {editingCode ? 'Update Code' : 'Create Code'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {discountCodes.map((code) => (
          <Card key={code.id} className={`${code.is_active ? 'bg-white' : 'bg-gray-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-xl font-bold bg-gray-100 px-3 py-1 rounded border-2 border-dashed border-gray-300">
                      {code.code}
                    </code>
                    {!code.is_active && (
                      <Badge variant="outline" className="bg-gray-200 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                    {code.expiration_date && new Date(code.expiration_date) < new Date() && (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Expired
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{code.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Discount</div>
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        {code.discount_type === 'percentage' ? (
                          <><Percent className="w-3 h-3" />{code.discount_value}%</>
                        ) : (
                          <><DollarSign className="w-3 h-3" />${code.discount_value}</>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Used</div>
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {code.current_usage_count}
                        {code.usage_limit && `/${code.usage_limit}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ${(code.total_revenue_generated || 0).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Expires</div>
                      <div className="font-semibold text-gray-800 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {code.expiration_date 
                          ? new Date(code.expiration_date).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  {code.minimum_purchase_amount > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Min. purchase: ${code.minimum_purchase_amount}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(code.code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(code)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(code)}
                    className={code.is_active ? 'text-red-600' : 'text-green-600'}
                  >
                    {code.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Delete this discount code?')) {
                        deleteCodeMutation.mutate(code.id);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {discountCodes.length === 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="text-center py-12">
              <Tag className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800 mb-2">No Discount Codes Yet</h3>
              <p className="text-gray-600 mb-4">Create your first promotional code to boost sales!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Code
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}