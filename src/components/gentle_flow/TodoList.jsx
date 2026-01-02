import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function TodoList({ settings }) {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState(settings?.currentPlan?.todos || []);
  const [isAdding, setIsAdding] = useState(false);

  const updateSettingsMutation = useMutation({
    mutationFn: (newTodos) => base44.auth.updateMe({
      gentle_flow_settings: {
        ...settings,
        currentPlan: {
          ...settings.currentPlan,
          todos: newTodos
        }
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const newTodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    updateSettingsMutation.mutate(updatedTodos);
    setNewTodo('');
    toast.success('Task added!');
  };

  const handleToggleTodo = (todoId) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    updateSettingsMutation.mutate(updatedTodos);
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo.completed) {
      toast.success('✨ Task completed!');
    }
  };

  const handleDeleteTodo = (todoId) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    setTodos(updatedTodos);
    updateSettingsMutation.mutate(updatedTodos);
    toast.success('Task removed');
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Circle className="w-5 h-5 text-[#7AAE9E]" />
              Quick Tasks
            </CardTitle>
            <Badge variant="outline">
              {activeTodos.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new todo */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a quick task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              className="flex-1"
            />
            <Button
              onClick={handleAddTodo}
              disabled={!newTodo.trim() || updateSettingsMutation.isPending}
              size="sm"
              className="bg-[#7AAE9E] hover:bg-[#7AAE9E]/90"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Active todos */}
          <div className="space-y-2">
            <AnimatePresence>
              {activeTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#7AAE9E] transition-all group"
                >
                  <button
                    onClick={() => handleToggleTodo(todo.id)}
                    className="flex-shrink-0"
                  >
                    <Circle className="w-5 h-5 text-gray-400 hover:text-[#7AAE9E] transition-colors" />
                  </button>
                  <span className="flex-1 text-sm text-gray-700">{todo.text}</span>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Completed todos */}
          {completedTodos.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-medium">Completed</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {completedTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                    >
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </button>
                      <span className="flex-1 text-sm text-gray-400 line-through">{todo.text}</span>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No tasks yet. Add your first one above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}