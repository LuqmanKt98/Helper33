import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Plus, Trash2, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborativeTaskBoard() {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');

  const { data: familyTodos = [], isLoading } = useQuery({
    queryKey: ['familyTodos'],
    queryFn: () => base44.entities.FamilyTodo.list('-created_date')
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createTodoMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyTodo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
      setNewTaskTitle('');
      toast.success('Task added to family board!');
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyTodo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyTodo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyTodos']);
      toast.success('Task removed');
    }
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    
    createTodoMutation.mutate({
      title: newTaskTitle,
      priority: selectedPriority,
      status: 'pending',
      assigned_member_ids: []
    });
  };

  const toggleComplete = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTodoMutation.mutate({
      id: task.id,
      data: {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      }
    });
  };

  const groupedTasks = {
    pending: familyTodos.filter(t => t.status === 'pending'),
    in_progress: familyTodos.filter(t => t.status === 'in_progress'),
    completed: familyTodos.filter(t => t.status === 'completed')
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    urgent: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                  placeholder="Add a task for the family..."
                  className="border-2 border-purple-300 focus:border-purple-500"
                />
              </div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button
                onClick={handleCreateTask}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Pending */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 h-full">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-5 h-5" />
                To Do ({groupedTasks.pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {groupedTasks.pending.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={familyMembers}
                    onToggle={toggleComplete}
                    onDelete={deleteTodoMutation.mutate}
                    onUpdate={(data) => updateTodoMutation.mutate({ id: task.id, data })}
                    priorityColors={priorityColors}
                  />
                ))}
              </AnimatePresence>
              {groupedTasks.pending.length === 0 && (
                <p className="text-center text-gray-400 py-8">No pending tasks</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 h-full">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                In Progress ({groupedTasks.in_progress.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {groupedTasks.in_progress.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={familyMembers}
                    onToggle={toggleComplete}
                    onDelete={deleteTodoMutation.mutate}
                    onUpdate={(data) => updateTodoMutation.mutate({ id: task.id, data })}
                    priorityColors={priorityColors}
                  />
                ))}
              </AnimatePresence>
              {groupedTasks.in_progress.length === 0 && (
                <p className="text-center text-gray-400 py-8">No tasks in progress</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-green-200 h-full">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Completed ({groupedTasks.completed.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {groupedTasks.completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={familyMembers}
                    onToggle={toggleComplete}
                    onDelete={deleteTodoMutation.mutate}
                    onUpdate={(data) => updateTodoMutation.mutate({ id: task.id, data })}
                    priorityColors={priorityColors}
                  />
                ))}
              </AnimatePresence>
              {groupedTasks.completed.length === 0 && (
                <p className="text-center text-gray-400 py-8">No completed tasks</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function TaskCard({ task, members, onToggle, onDelete, onUpdate, priorityColors }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const assignedMembers = members.filter(m => 
    task.assigned_member_ids?.includes(m.id)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={`${task.status === 'completed' ? 'opacity-60' : ''} hover:shadow-lg transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.button
              onClick={() => onToggle(task)}
              whileTap={{ scale: 0.9 }}
              className="mt-1"
            >
              {task.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 hover:text-purple-600" />
              )}
            </motion.button>

            <div className="flex-1">
              <h4 className={`font-semibold text-gray-900 mb-2 ${task.status === 'completed' ? 'line-through' : ''}`}>
                {task.title}
              </h4>

              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                
                {task.category && (
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                )}

                {task.due_date && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {assignedMembers.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {assignedMembers.map(member => (
                    <Badge key={member.id} className="bg-purple-100 text-purple-800 text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {member.name}
                    </Badge>
                  ))}
                </div>
              )}

              {task.description && isExpanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-gray-600 mt-2"
                >
                  {task.description}
                </motion.p>
              )}
            </div>

            <Button
              onClick={() => onDelete(task.id)}
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {task.comments && task.comments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}