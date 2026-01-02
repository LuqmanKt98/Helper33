
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar, User, Tag, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CommentSection from './CommentSection';

export default function MemoryDetail({ memory, onClose, onEdit, onDelete }) {
  if (!memory) return null;

  const renderMedia = () => {
    switch (memory.media_type) {
      case 'image':
        return <img src={memory.media_url} alt={memory.title} className="rounded-lg w-full object-cover mb-4 shadow-lg" />;
      case 'video':
        return <video src={memory.media_url} controls className="rounded-lg w-full mb-4 shadow-lg" />;
      case 'audio':
        return <audio src={memory.media_url} controls className="w-full mb-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={!!memory} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-900/90 text-white border-purple-500/30 backdrop-blur-xl">
            <DialogHeader className="p-6 pb-4 border-b border-purple-500/20">
                <DialogTitle className="text-2xl font-bold text-amber-300">{memory.title || "Memory"}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                    {memory.memory_date && (
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{format(parseISO(memory.memory_date), 'MMMM d, yyyy')}</span>
                    )}
                    {memory.associated_person && (
                        <span className="flex items-center gap-1.5"><User className="w-4 h-4"/>{memory.associated_person}</span>
                    )}
                </DialogDescription>
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}><X className="w-5 h-5" /></Button>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {renderMedia()}
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{memory.content}</p>
                {memory.tags && memory.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400"/>
                        {memory.tags.map(tag => <span key={tag} className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                )}
                <div className="my-6 border-t border-purple-500/20"/>
                <CommentSection memoryId={memory.id} />
              </div>
            </div>
            <DialogFooter className="p-4 border-t border-purple-500/20 bg-slate-900/50 justify-between">
                <Button variant="destructive" onClick={() => onDelete(memory.id)}><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
                <Button variant="outline" className="bg-transparent border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900" onClick={onEdit}><Edit className="w-4 h-4 mr-2"/> Edit</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
