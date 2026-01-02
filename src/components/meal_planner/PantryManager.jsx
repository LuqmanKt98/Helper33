import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package, Plus, Trash2, Edit, Clock, AlertTriangle, Search, Filter, Refrigerator, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PantryManager = ({ onCheckIngredient }) => {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showReminder, setShowReminder] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: 1,
    unit: 'unit',
    expiration_date: '',
    location: 'pantry',
    low_stock_threshold: 1,
    notes: '',
    last_updated: new Date().toISOString().split('T')[0]
  });

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ['pantryItems'],
    queryFn: () => base44.entities.PantryItem.list('-last_updated')
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PantryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pantryItems']);
      resetForm();
      setShowAddDialog(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PantryItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pantryItems']);
      resetForm();
      setShowAddDialog(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PantryItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['pantryItems'])
  });

  useEffect(() => {
    if (user) {
      const lastUpdated = localStorage.getItem(`pantry_last_updated_${user.id}`);
      const daysSinceUpdate = lastUpdated 
        ? Math.floor((Date.now() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24))
        : 30;
      
      if (daysSinceUpdate > 7) {
        setShowReminder(true);
      }
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      quantity: 1,
      unit: 'unit',
      expiration_date: '',
      location: 'pantry',
      low_stock_threshold: 1,
      notes: '',
      last_updated: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    
    if (user) {
      localStorage.setItem(`pantry_last_updated_${user.id}`, new Date().toISOString());
      setShowReminder(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiration_date: item.expiration_date || '',
      location: item.location || 'pantry',
      low_stock_threshold: item.low_stock_threshold || 1,
      notes: item.notes || '',
      last_updated: new Date().toISOString().split('T')[0]
    });
    setShowAddDialog(true);
  };

  const checkIngredientAvailability = (ingredientName) => {
    if (!ingredientName || typeof ingredientName !== 'string') {
      return false;
    }
    
    const normalizedIngredient = ingredientName.toLowerCase().trim();
    return pantryItems.some(item => 
      item.name && item.name.toLowerCase().includes(normalizedIngredient) && item.quantity > 0
    );
  };

  useEffect(() => {
    if (onCheckIngredient) {
      onCheckIngredient(checkIngredientAvailability);
    }
  }, [pantryItems, onCheckIngredient]);

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = pantryItems.filter(item => item.quantity <= item.low_stock_threshold);
  const expiringItems = pantryItems.filter(item => {
    if (!item.expiration_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  const categoryIcons = {
    produce: '🥬',
    dairy: '🥛',
    meat: '🥩',
    grains: '🌾',
    spices: '🧂',
    canned: '🥫',
    frozen: '❄️',
    beverages: '🥤',
    snacks: '🍿',
    baking: '🍰',
    condiments: '🍯',
    other: '📦'
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="bg-orange-50 border-orange-300">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span>🍽️ Time to update your pantry inventory! Keep it current for accurate meal planning.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(true);
                      setShowReminder(false);
                    }}
                    className="ml-4"
                  >
                    Update Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            Kitchen Pantry
          </h2>
          <p className="text-sm text-gray-600 mt-1">Track what you have, never miss an ingredient</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm text-red-800">
                      {item.name} - {item.quantity} {item.unit}
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <div className="text-xs text-red-600">+{lowStockItems.length - 3} more</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringItems.length > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <Clock className="w-4 h-4" />
                  Expiring Soon ({expiringItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {expiringItems.slice(0, 3).map(item => (
                    <div key={item.id} className="text-sm text-orange-800">
                      {item.name} - {new Date(item.expiration_date).toLocaleDateString()}
                    </div>
                  ))}
                  {expiringItems.length > 3 && (
                    <div className="text-xs text-orange-600">+{expiringItems.length - 3} more</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search pantry items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(categoryIcons).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Package className="w-12 h-12 text-green-500 mx-auto" />
              </motion.div>
              <p className="mt-4 text-gray-600">Loading pantry...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || categoryFilter !== 'all' ? 'No items found' : 'Your pantry is empty'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start adding items to track your kitchen inventory'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{categoryIcons[item.category]}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className={`font-semibold ${
                            item.quantity <= item.low_stock_threshold 
                              ? 'text-red-600' 
                              : 'text-gray-900'
                          }`}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>

                        {item.location && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900 capitalize flex items-center gap-1">
                              {item.location === 'fridge' && <Refrigerator className="w-3 h-3" />}
                              {item.location === 'freezer' && <Archive className="w-3 h-3" />}
                              {item.location === 'pantry' && <Package className="w-3 h-3" />}
                              {item.location}
                            </span>
                          </div>
                        )}

                        {item.expiration_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Expires:</span>
                            <span className={`${
                              new Date(item.expiration_date) - new Date() < 7 * 24 * 60 * 60 * 1000
                                ? 'text-orange-600 font-semibold'
                                : 'text-gray-900'
                            }`}>
                              {new Date(item.expiration_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          resetForm();
          setEditingItem(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Pantry Item</DialogTitle>
            <DialogDescription>
              Keep your kitchen inventory up to date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Item Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Flour, Milk, Chicken"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., cups, lbs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categoryIcons).map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pantry">📦 Pantry</SelectItem>
                    <SelectItem value="fridge">❄️ Fridge</SelectItem>
                    <SelectItem value="freezer">🧊 Freezer</SelectItem>
                    <SelectItem value="cabinet">🗄️ Cabinet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Expiration Date</label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Low Stock Alert</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              resetForm();
              setEditingItem(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || formData.quantity <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PantryManager;