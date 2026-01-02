import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Edit,
  Trash2,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SubscriptionPricingManager({ sellerId, courseId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    billing_interval: 'monthly',
    price: 0,
    trial_days: 0,
    benefits: [''],
    access_duration: 'while_subscribed'
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans', sellerId, courseId],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ 
      seller_id: sellerId,
      course_id: courseId 
    }),
    enabled: !!sellerId && !!courseId
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.SubscriptionPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptionPlans']);
      resetForm();
      toast.success('Subscription plan created! 🎉');
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptionPlans']);
      resetForm();
      toast.success('Plan updated!');
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptionPlans']);
      toast.success('Plan deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      plan_name: '',
      billing_interval: 'monthly',
      price: 0,
      trial_days: 0,
      benefits: [''],
      access_duration: 'while_subscribed'
    });
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const planData = {
      seller_id: sellerId,
      course_id: courseId,
      ...formData,
      price: parseFloat(formData.price),
      trial_days: parseInt(formData.trial_days) || 0,
      benefits: formData.benefits.filter(b => b.trim())
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const addBenefit = () => {
    setFormData({...formData, benefits: [...formData.benefits, '']});
  };

  const updateBenefit = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({...formData, benefits: newBenefits});
  };

  const removeBenefit = (index) => {
    setFormData({...formData, benefits: formData.benefits.filter((_, i) => i !== index)});
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      billing_interval: plan.billing_interval,
      price: plan.price,
      trial_days: plan.trial_days || 0,
      benefits: plan.benefits?.length > 0 ? plan.benefits : [''],
      access_duration: plan.access_duration
    });
    setShowForm(true);
  };

  const getIntervalLabel = (interval) => {
    const labels = {
      monthly: 'Monthly',
      quarterly: 'Every 3 Months',
      yearly: 'Yearly'
    };
    return labels[interval] || interval;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
          <p className="text-gray-600">Offer recurring payment options for your course</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-blue-600" />
                  {editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Plan Name *</Label>
                    <Input
                      value={formData.plan_name}
                      onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                      placeholder="Monthly Access"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Billing Interval *</Label>
                      <select
                        value={formData.billing_interval}
                        onChange={(e) => setFormData({...formData, billing_interval: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Free Trial Days</Label>
                      <Input
                        type="number"
                        value={formData.trial_days}
                        onChange={(e) => setFormData({...formData, trial_days: e.target.value})}
                        min="0"
                      />
                    </div>

                    <div>
                      <Label>Access Duration</Label>
                      <select
                        value={formData.access_duration}
                        onChange={(e) => setFormData({...formData, access_duration: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="while_subscribed">While Subscribed</option>
                        <option value="lifetime">Lifetime Access</option>
                        <option value="1_year_from_purchase">1 Year from Purchase</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Plan Benefits</Label>
                    <div className="space-y-2">
                      {formData.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => updateBenefit(index, e.target.value)}
                            placeholder="e.g., Access to all course materials"
                          />
                          {formData.benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeBenefit(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBenefit}
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-white hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {getIntervalLabel(plan.billing_interval)}
                    </Badge>
                    {plan.is_active && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    ${plan.price}
                  </div>
                  <div className="text-xs text-gray-600">
                    /{plan.billing_interval === 'monthly' ? 'mo' : plan.billing_interval === 'yearly' ? 'yr' : '3mo'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {plan.trial_days > 0 && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {plan.trial_days} day free trial
                </div>
              )}

              {plan.benefits && plan.benefits.length > 0 && (
                <div className="space-y-2 mb-4">
                  {plan.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t">
                <div>
                  <div className="text-xs text-gray-500">Active Subscribers</div>
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {plan.active_subscribers || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">MRR</div>
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    ${(plan.monthly_recurring_revenue || 0).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(plan)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Delete this subscription plan?')) {
                      deletePlanMutation.mutate(plan.id);
                    }
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}