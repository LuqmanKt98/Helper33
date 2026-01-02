import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FolderPlus,
  Folder,
  Edit3,
  Trash2,
  Settings,
  Sparkles,
  Plus,
  Save,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CATEGORIES = [
  { name: 'Personal', icon: '👤', color: '#8b5cf6', description: 'Personal documents' },
  { name: 'Work', icon: '💼', color: '#3b82f6', description: 'Work-related documents' },
  { name: 'Financial', icon: '💰', color: '#10b981', description: 'Receipts, invoices, tax documents' },
  { name: 'Medical', icon: '🏥', color: '#ef4444', description: 'Medical records and prescriptions' },
  { name: 'Legal', icon: '⚖️', color: '#f59e0b', description: 'Contracts, agreements, legal papers' },
  { name: 'Travel', icon: '✈️', color: '#06b6d4', description: 'Passports, tickets, itineraries' },
  { name: 'Education', icon: '📚', color: '#ec4899', description: 'School documents, certificates' },
  { name: 'Home', icon: '🏡', color: '#84cc16', description: 'Home maintenance, utilities' }
];

export default function CategoryManager({ isOpen, onClose }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    category_name: '',
    description: '',
    color: '#3b82f6',
    icon_emoji: '📁'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: () => base44.entities.DocumentCategory.list('sort_order'),
    initialData: []
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['scannedDocuments'],
    queryFn: () => base44.entities.ScannedDocument.list(),
    initialData: []
  });

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => base44.entities.DocumentCategory.create(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentCategories']);
      setNewCategory({
        category_name: '',
        description: '',
        color: '#3b82f6',
        icon_emoji: '📁'
      });
      setIsCreating(false);
      toast.success('Category created! 📁');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DocumentCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentCategories']);
      setEditingCategory(null);
      toast.success('Category updated! ✏️');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => base44.entities.DocumentCategory.delete(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries(['documentCategories']);
      toast.success('Category deleted');
    }
  });

  const createDefaultCategories = async () => {
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await base44.entities.DocumentCategory.create({
          category_name: cat.name,
          description: cat.description,
          color: cat.color,
          icon_emoji: cat.icon,
          is_system_category: true,
          ai_categorization_enabled: true,
          sort_order: DEFAULT_CATEGORIES.indexOf(cat)
        });
      }
      queryClient.invalidateQueries(['documentCategories']);
      toast.success('Default categories created! 📁');
    } catch (error) {
      console.error('Error creating default categories:', error);
      toast.error('Failed to create categories');
    }
  };

  const handleCreateCategory = () => {
    if (!newCategory.category_name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    createCategoryMutation.mutate({
      ...newCategory,
      sort_order: categories.length
    });
  };

  const handleDeleteCategory = async (category) => {
    const docsInCategory = documents.filter(d => d.category_id === category.id).length;
    
    if (docsInCategory > 0) {
      if (!confirm(`This category has ${docsInCategory} document${docsInCategory !== 1 ? 's' : ''}. Delete anyway?`)) {
        return;
      }
    }

    deleteCategoryMutation.mutate(category.id);
  };

  const getCategoryDocCount = (categoryId) => {
    return documents.filter(d => d.category_id === categoryId).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Folder className="w-5 h-5 text-blue-600" />
            Manage Categories
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Organize your documents with custom categories and auto-categorization rules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          
          {/* Quick Setup */}
          {categories.length === 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardContent className="p-4 sm:p-6 text-center">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                  Get Started with Smart Categories
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Create default categories to organize your documents automatically
                </p>
                <Button
                  onClick={createDefaultCategories}
                  className="bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[44px]"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Default Categories
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create New Category */}
          <div className="space-y-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
              <Plus className="w-4 h-4 text-green-600" />
              Create New Category
            </h3>

            {isCreating ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Category Name</Label>
                    <Input
                      value={newCategory.category_name}
                      onChange={(e) => setNewCategory({...newCategory, category_name: e.target.value})}
                      placeholder="e.g., Tax Documents"
                      className="mt-1 min-h-[44px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs sm:text-sm">Icon</Label>
                      <Input
                        value={newCategory.icon_emoji}
                        onChange={(e) => setNewCategory({...newCategory, icon_emoji: e.target.value})}
                        placeholder="📁"
                        className="mt-1 text-center text-2xl min-h-[44px]"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs sm:text-sm">Color</Label>
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                        className="mt-1 w-full h-[44px] rounded border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Description</Label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="What documents belong in this category?"
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="flex-1 touch-manipulation min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCategory}
                    disabled={createCategoryMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 touch-manipulation min-h-[44px]"
                  >
                    {createCategoryMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Create Category</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="w-full bg-white touch-manipulation min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Category
              </Button>
            )}
          </div>

          {/* Existing Categories */}
          {categories.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                <Folder className="w-4 h-4 text-purple-600" />
                Your Categories ({categories.length})
              </h3>

              <div className="space-y-2">
                {categories.map(category => {
                  const docCount = getCategoryDocCount(category.id);
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 sm:p-4 bg-white rounded-lg border-2 hover:shadow-md transition-all"
                      style={{ borderColor: category.color + '40' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            {category.icon_emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                {category.category_name}
                              </h4>
                              {category.is_system_category && (
                                <Badge variant="outline" className="text-xs">System</Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {docCount} doc{docCount !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {category.description}
                              </p>
                            )}

                            {category.auto_categorization_rules && category.auto_categorization_rules.length > 0 && (
                              <div className="mt-2">
                                <Button
                                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  <Settings className="w-3 h-3 mr-1" />
                                  {category.auto_categorization_rules.length} rule{category.auto_categorization_rules.length !== 1 ? 's' : ''}
                                  <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </Button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 space-y-1"
                                    >
                                      {category.auto_categorization_rules.map((rule, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                                        >
                                          <span className="font-medium">{rule.field}</span>
                                          {' '}<span className="text-gray-500">{rule.condition}</span>{' '}
                                          <span className="font-mono text-blue-600">
                                            {rule.value || rule.values?.join(', ')}
                                          </span>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            onClick={() => setEditingCategory(category)}
                            size="sm"
                            variant="ghost"
                            className="touch-manipulation min-h-[36px] min-w-[36px]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          {!category.is_system_category && (
                            <Button
                              onClick={() => handleDeleteCategory(category)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 touch-manipulation min-h-[36px] min-w-[36px]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Categorization Info */}
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1 text-sm">AI Auto-Categorization</h4>
                <p className="text-xs text-purple-700">
                  Documents are automatically categorized using AI analysis and your custom rules. 
                  You can always manually change a document's category.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs sm:text-sm">Category Name</Label>
                  <Input
                    value={editingCategory.category_name}
                    onChange={(e) => setEditingCategory({...editingCategory, category_name: e.target.value})}
                    className="mt-1 min-h-[44px]"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs sm:text-sm">Icon</Label>
                    <Input
                      value={editingCategory.icon_emoji}
                      onChange={(e) => setEditingCategory({...editingCategory, icon_emoji: e.target.value})}
                      className="mt-1 text-center text-2xl min-h-[44px]"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs sm:text-sm">Color</Label>
                    <input
                      type="color"
                      value={editingCategory.color}
                      onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                      className="mt-1 w-full h-[44px] rounded border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Description</Label>
                <Textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                onClick={() => setEditingCategory(null)}
                variant="outline"
                className="flex-1 sm:flex-none touch-manipulation min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateCategoryMutation.mutate({
                    id: editingCategory.id,
                    data: {
                      category_name: editingCategory.category_name,
                      description: editingCategory.description,
                      color: editingCategory.color,
                      icon_emoji: editingCategory.icon_emoji
                    }
                  });
                }}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[44px]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}