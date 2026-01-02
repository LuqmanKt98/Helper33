import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Upload, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedMemoryAlbum() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    category: 'Family',
    media_url: null,
    tags: []
  });
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['familyMemories'],
    queryFn: () => base44.entities.Memory.list('-created_date')
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const createMemoryMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMemories']);
      setShowCreateModal(false);
      setNewMemory({ title: '', content: '', category: 'Family', media_url: null, tags: [] });
      toast.success('Memory saved to family album! 📸');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewMemory({ ...newMemory, media_url: file_url });
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMemory = () => {
    if (!newMemory.title.trim()) {
      toast.error('Please add a title for this memory');
      return;
    }

    createMemoryMutation.mutate({
      ...newMemory,
      memory_date: new Date().toISOString().split('T')[0],
      shared_with_member_ids: familyMembers.map(m => m.id)
    });
  };

  const categories = ['Family', 'Achievement', 'Travel', 'Milestone', 'Funny Moment', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Family Memory Album
          </h2>
          <p className="text-gray-600">Capture and share precious moments together</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
        >
          <Camera className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </motion.div>

      {/* Memory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card
                className="cursor-pointer hover:shadow-xl transition-all overflow-hidden group"
                onClick={() => setSelectedMemory(memory)}
              >
                {memory.media_url && (
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    <img
                      src={memory.media_url}
                      alt={memory.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{memory.title}</h3>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {memory.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {memory.content}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {memory.memory_date ? new Date(memory.memory_date).toLocaleDateString() : 'Date not set'}
                  </div>

                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {memory.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {memories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No memories yet</h3>
          <p className="text-gray-500 mb-6">Start capturing your family's special moments!</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Camera className="w-4 h-4 mr-2" />
            Create First Memory
          </Button>
        </motion.div>
      )}

      {/* Create Memory Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-purple-600" />
              Add Family Memory
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
              <Input
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                placeholder="Give this memory a title..."
                className="border-2 border-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    onClick={() => setNewMemory({ ...newMemory, category: cat })}
                    className={`cursor-pointer ${
                      newMemory.category === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Memory Details</label>
              <Textarea
                value={newMemory.content}
                onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                placeholder="Describe this special moment..."
                className="min-h-32 border-2 border-purple-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Photo (optional)</label>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="memory-photo"
                />
                <label htmlFor="memory-photo">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="border-2 border-purple-300"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('memory-photo')?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </label>
                {newMemory.media_url && (
                  <Badge className="bg-green-100 text-green-800">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Photo added
                  </Badge>
                )}
              </div>
              {newMemory.media_url && (
                <img
                  src={newMemory.media_url}
                  alt="Preview"
                  className="mt-3 w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMemory}
                disabled={!newMemory.title.trim() || createMemoryMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save Memory
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Memory Modal */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedMemory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMemory.title}</DialogTitle>
              </DialogHeader>

              {selectedMemory.media_url && (
                <img
                  src={selectedMemory.media_url}
                  alt={selectedMemory.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {selectedMemory.category}
                  </Badge>
                  {selectedMemory.memory_date && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedMemory.memory_date).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed">{selectedMemory.content}</p>

                {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}