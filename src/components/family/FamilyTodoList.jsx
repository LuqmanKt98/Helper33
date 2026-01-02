import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Users, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Trash2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const CATEGORY_ICONS = {
  household: '🏠',
  shopping: '🛒',
  errands: '🚗',
  kids: '👶',
  pets: '🐾',
  maintenance: '🔧',
  events: '🎉',
  other: '📝'
};

export default function FamilyTodoList({ familyMembers, onUpdate }) {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['familyTodos'],
    queryFn: () => base44.entities.FamilyTodo.list('-created_date')
  });

  const createTodoMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyTodo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
      setShowAddModal(false);
      toast.success('To-do added to family list!');
      if (onUpdate) onUpdate();
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyTodo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
      toast.success('To-do updated!');
      if (onUpdate) onUpdate();
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyTodo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
      toast.success('To-do deleted');
      if (onUpdate) onUpdate();
    }
  });

  const handleToggleComplete = (todo) => {
    const currentMember = familyMembers?.find(m => m.user_id === user?.id);
    
    updateTodoMutation.mutate({
      id: todo.id,
      data: {
        status: todo.status === 'completed' ? 'pending' : 'completed',
        completed_by_member_id: todo.status === 'completed' ? null : currentMember?.id,
        completed_at: todo.status === 'completed' ? null : new Date().toISOString()
      }
    });
  };

  const handleAddComment = (todo) => {
    if (!newComment.trim()) return;
    
    const currentMember = familyMembers?.find(m => m.user_id === user?.id);
    const updatedComments = [
      ...(todo.comments || []),
      {
        member_id: currentMember?.id,
        member_name: currentMember?.name || user?.full_name,
        comment: newComment,
        timestamp: new Date().toISOString()
      }
    ];

    updateTodoMutation.mutate({
      id: todo.id,
      data: { comments: updatedComments }
    });
    setNewComment('');
  };

  const getMemberName = (memberId) => {
    return familyMembers?.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === 'all') return true;
    return todo.status === filterStatus;
  });

  const completedCount = todos.filter(t => t.status === 'completed').length;
  const pendingCount = todos.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-800">{todos.length}</p>
              </div>
              <Circle className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-800">{completedCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-orange-800">{pendingCount}</p>
              </div>
              <Users className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Family To-Do
        </Button>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all ${todo.status === 'completed' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      className="mt-1 flex-shrink-0"
                    >
                      {todo.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-green-500 transition-colors" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 mb-1 ${todo.status === 'completed' ? 'line-through' : ''}`}>
                            {CATEGORY_ICONS[todo.category]} {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="text-sm text-gray-600">{todo.description}</p>
                          )}
                        </div>
                        <Badge className={PRIORITY_COLORS[todo.priority]}>
                          {todo.priority}
                        </Badge>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {todo.assigned_member_ids?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {todo.assigned_member_ids.map(id => getMemberName(id)).join(', ')}
                          </Badge>
                        )}
                        {todo.due_date && (
                          <Badge variant="outline" className="text-xs">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(new Date(todo.due_date), 'MMM d')}
                          </Badge>
                        )}
                        {todo.comments?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {todo.comments.length} comment{todo.comments.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Completed Info */}
                      {todo.status === 'completed' && todo.completed_by_member_id && (
                        <p className="text-xs text-green-600">
                          ✓ Completed by {getMemberName(todo.completed_by_member_id)}
                          {todo.completed_at && ` on ${format(new Date(todo.completed_at), 'MMM d, h:mm a')}`}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTodo(todo)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Comment
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodoMutation.mutate(todo.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-12 text-center">
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No to-dos found</p>
              <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First To-Do
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddTodoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        familyMembers={familyMembers}
        onSubmit={(data) => createTodoMutation.mutate(data)}
        isLoading={createTodoMutation.isPending}
      />

      {/* Comments Modal */}
      <CommentsModal
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
        familyMembers={familyMembers}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={handleAddComment}
        isLoading={updateTodoMutation.isPending}
      />
    </div>
  );
}

// Add To-Do Modal Component
function AddTodoModal({ isOpen, onClose, familyMembers, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_member_ids: [],
    priority: 'medium',
    category: 'other',
    due_date: '',
    recurring: 'none'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      assigned_member_ids: [],
      priority: 'medium',
      category: 'other',
      due_date: '',
      recurring: 'none'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Family To-Do</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORY_ICONS).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Assign To (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {familyMembers?.map(member => (
                <Badge
                  key={member.id}
                  variant={formData.assigned_member_ids.includes(member.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      assigned_member_ids: formData.assigned_member_ids.includes(member.id)
                        ? formData.assigned_member_ids.filter(id => id !== member.id)
                        : [...formData.assigned_member_ids, member.id]
                    });
                  }}
                >
                  {member.emoji || '👤'} {member.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add To-Do'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Comments Modal Component
function CommentsModal({ todo, isOpen, onClose, familyMembers, newComment, setNewComment, onAddComment, isLoading }) {
  if (!todo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{todo.title}</DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {todo.comments?.length > 0 ? (
            todo.comments.map((comment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {comment.member_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.member_name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No comments yet</p>
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAddComment(todo);
              }
            }}
          />
          <Button onClick={() => onAddComment(todo)} disabled={isLoading || !newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}