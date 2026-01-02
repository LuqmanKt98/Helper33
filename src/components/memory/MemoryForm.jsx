
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X, Mic, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import AudioRecorder from '@/components/common/AudioRecorder'; // Import the new component
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs

export default function MemoryForm({ isOpen, onClose, existingMemory }) {
    const queryClient = useQueryClient();
    const [memory, setMemory] = useState({
        title: '', content: '', category: 'Personal', memory_date: '',
        associated_person: '', tags: '', media_url: '', media_type: 'text'
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('text');

    useEffect(() => {
        if (existingMemory) {
            setMemory({
                ...existingMemory,
                tags: (existingMemory.tags || []).join(', '),
                memory_date: existingMemory.memory_date ? existingMemory.memory_date.split('T')[0] : '',
            });
            setActiveTab(existingMemory.media_type === 'audio' ? 'audio' : 'text');
        } else {
            setMemory({
                title: '', content: '', category: 'Personal', memory_date: '',
                associated_person: '', tags: '', media_url: '', media_type: 'text'
            });
            setActiveTab('text');
        }
    }, [existingMemory, isOpen]);

    const mutation = useMutation({
        mutationFn: (newMemory) => {
            const memoryData = {
                ...newMemory,
                tags: newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            };
            if (existingMemory?.id) {
                return base44.entities.Memory.update(existingMemory.id, memoryData);
            }
            return base44.entities.Memory.create(memoryData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['memories']);
            onClose();
            toast.promise(
                base44.functions.invoke('generateMemoryDescription', { memoryId: data.id }),
                {
                    loading: 'AI is analyzing your memory to make it searchable...',
                    success: 'Memory analysis complete!',
                    error: 'AI analysis failed.',
                }
            );
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            const fileType = file.type.split('/')[0];
            // Clear content for non-text media uploads, set a placeholder for audio
            setMemory(prev => ({
                ...prev,
                media_type: fileType,
                content: fileType.startsWith('audio') ? 'Audio Memory' : prev.content
            }));
            // If a file is selected via this input, switch tab to text (media attachment)
            setActiveTab('text');
        }
    };
    
    const handleAudioRecording = (audioFile) => {
        setMediaFile(audioFile);
        // When audio is recorded, clear media_url if it was previously set for another type
        setMemory(prev => ({ ...prev, media_type: 'audio', content: 'Audio Memory', media_url: '' }));
    };

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return null;
        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: fileToUpload });
            setMemory(prev => ({ ...prev, media_url: file_url }));
            return file_url;
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("File upload failed. Please try again.");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let finalMemory = { ...memory };

        // If content is empty for text tab, or audio not recorded for audio tab, prevent submission
        if (activeTab === 'text' && !finalMemory.content.trim()) {
            toast.error("Memory content cannot be empty.");
            return;
        }
        if (activeTab === 'audio' && !mediaFile && !finalMemory.media_url) {
             toast.error("Please record an audio memory.");
             return;
        }

        // Handle upload for general media files (image/video) OR new audio recordings
        if (mediaFile && !finalMemory.media_url) {
            const uploadedUrl = await handleUpload(mediaFile);
            if (uploadedUrl) {
                finalMemory.media_url = uploadedUrl;
                // Ensure media_type is correctly set based on the file uploaded, especially for fresh audio
                if (mediaFile.type.startsWith('audio')) {
                    finalMemory.media_type = 'audio';
                    if (!finalMemory.content.trim()) finalMemory.content = 'Audio Memory';
                } else if (mediaFile.type.startsWith('image')) {
                    finalMemory.media_type = 'image';
                } else if (mediaFile.type.startsWith('video')) {
                    finalMemory.media_type = 'video';
                }
            } else {
                return; // Stop submission if upload fails
            }
        } else if (!mediaFile && finalMemory.media_url && finalMemory.media_type === 'audio' && activeTab === 'text') {
            // If user recorded audio, but then switched to text and cleared it, reset media_url and type
            finalMemory.media_url = '';
            finalMemory.media_type = 'text';
        } else if (activeTab === 'text' && finalMemory.media_type === 'audio') {
            // If switched to text, clear audio related data
            finalMemory.media_url = '';
            finalMemory.media_type = 'text';
        } else if (activeTab === 'audio' && finalMemory.media_type !== 'audio') {
            // If active tab is audio, but current memory type is not audio, reset.
            // This happens if existing memory was text/image and user switches to audio tab
            finalMemory.media_url = '';
            finalMemory.media_type = 'audio';
            if (!finalMemory.content.trim()) finalMemory.content = 'Audio Memory';
        }
        
        mutation.mutate(finalMemory);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMemory(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-slate-900/90 text-white border-purple-500/30 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-amber-300">{existingMemory ? 'Edit this Memory' : 'Weave a New Memory'}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Capture the moments that matter most. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    onSubmit={handleSubmit} 
                    className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title" className="text-gray-400">Title</Label>
                            <Input id="title" name="title" value={memory.title} onChange={handleChange} placeholder="e.g., Summer vacation, 2022" className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400" required/>
                        </div>
                        <div>
                            <Label htmlFor="memory_date" className="text-gray-400">Date</Label>
                            <Input id="memory_date" name="memory_date" type="date" value={memory.memory_date} onChange={handleChange} className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400" />
                        </div>
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={(value) => {
                        setActiveTab(value);
                        setMemory(p => ({
                            ...p,
                            // If switching to audio tab, set media_type to audio and clear old media_url if not audio.
                            // If switching to text tab, clear old media_url if not text.
                            media_type: value === 'audio' ? 'audio' : 'text',
                            media_url: value === 'audio' && p.media_type !== 'audio' ? '' : (value === 'text' && p.media_type !== 'text' ? '' : p.media_url),
                            // If switching to audio tab, set content to 'Audio Memory' if not already set or if it was text content
                            content: value === 'audio' && p.media_type !== 'audio' ? 'Audio Memory' : (value === 'text' && p.media_type === 'audio' ? '' : p.content)
                        }));
                        // Clear mediaFile state if we're switching away from its type
                        if (value === 'text' && mediaFile && mediaFile.type.startsWith('audio')) setMediaFile(null);
                        if (value === 'audio' && mediaFile && !mediaFile.type.startsWith('audio')) setMediaFile(null);
                    }} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                        <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-amber-300">
                          <FileText className="w-4 h-4"/> Text
                        </TabsTrigger>
                        <TabsTrigger value="audio" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-amber-300">
                          <Mic className="w-4 h-4"/> Audio
                        </TabsTrigger>
                      </TabsList>
                      <AnimatePresence mode="wait">
                          <TabsContent key={activeTab} value={activeTab} asChild>
                              <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-4"
                              >
                                  {activeTab === 'text' ? (
                                      <>
                                          <Label htmlFor="content" className="text-gray-400">The Memory</Label>
                                          <Textarea id="content" name="content" value={memory.content} onChange={handleChange} placeholder="Describe the memory..." className="h-32 bg-slate-800 border-slate-700 text-white focus:ring-amber-400" required={activeTab==='text'} />
                                      </>
                                  ) : (
                                      <AudioRecorder 
                                          onRecordingComplete={handleAudioRecording} 
                                          existingMediaUrl={existingMemory?.media_type === 'audio' ? existingMemory.media_url : ''}
                                          isUploading={isUploading}
                                        />
                                  )}
                              </motion.div>
                          </TabsContent>
                      </AnimatePresence>
                    </Tabs>

                    <div>
                        <Label className="text-gray-400">Attach Media (Image/Video, Optional)</Label>
                        <motion.div 
                            whileHover={{ scale: 1.02, borderColor: '#fbbf24' /* amber-400 */ }}
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-md cursor-pointer transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                           <div className="space-y-1 text-center">
                               {isUploading && (mediaFile?.type !== 'audio/webm' && mediaFile?.type !== 'audio/mp3' && mediaFile?.type !== 'audio/wav') ? <Loader2 className="mx-auto h-12 w-12 text-amber-400 animate-spin"/> : <Upload className="mx-auto h-12 w-12 text-gray-500"/>}
                                <p className="text-sm text-gray-400">
                                    {mediaFile && !mediaFile.type.startsWith('audio/') ? mediaFile.name : (memory.media_url && memory.media_type !== 'audio' ? 'Existing media attached' : 'Upload an image or video file')}
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 50MB</p>
                           </div>
                           <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*"/>
                        </motion.div>
                        {(mediaFile && !mediaFile.type.startsWith('audio/')) || (memory.media_url && memory.media_type !== 'audio') ? (
                             <div className="mt-2 text-sm text-gray-300 font-medium flex items-center gap-2">
                               {mediaFile?.name || (memory.media_url && !memory.media_type.startsWith('audio') ? 'Existing ' + memory.media_type : '')}
                                <button type="button" onClick={() => { setMediaFile(null); setMemory(p => ({...p, media_url: '', media_type: activeTab === 'audio' ? 'audio' : 'text'})); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-400">
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>
                        ) : null}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category" className="text-gray-400">Category</Label>
                            <Select name="category" value={memory.category} onValueChange={(value) => setMemory(p=>({...p, category: value}))}>
                                <SelectTrigger id="category" className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400"><SelectValue placeholder="Select a category"/></SelectTrigger>
                                <SelectContent className="bg-slate-800 text-white border-slate-700">
                                    <SelectItem value="Family">Family</SelectItem>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Achievement">Achievement</SelectItem>
                                    <SelectItem value="Travel">Travel</SelectItem>
                                    <SelectItem value="Milestone">Milestone</SelectItem>
                                    <SelectItem value="Funny Moment">Funny Moment</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <Label htmlFor="associated_person" className="text-gray-400">Associated Person</Label>
                            <Input id="associated_person" name="associated_person" value={memory.associated_person} onChange={handleChange} placeholder="e.g., Mom, Yuriy" className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400"/>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="tags" className="text-gray-400">Tags</Label>
                        <Input id="tags" name="tags" value={memory.tags} onChange={handleChange} placeholder="beach, birthday, celebration (comma-separated)" className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400"/>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="text-gray-300 border-slate-600 hover:bg-slate-700 hover:text-white">Cancel</Button>
                        <Button type="submit" disabled={mutation.isLoading || isUploading} className="bg-amber-500 text-slate-900 hover:bg-amber-400">
                            {(mutation.isLoading || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            {existingMemory ? 'Save Changes' : 'Save Memory'}
                        </Button>
                    </DialogFooter>
                </motion.form>
            </DialogContent>
        </Dialog>
    );
}
