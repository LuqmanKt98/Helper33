
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ memoryId }) {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);

    React.useEffect(() => {
        base44.auth.me().then(setUser);
    }, []);

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', memoryId],
        queryFn: () => base44.entities.MemoryComment.filter({ memory_id: memoryId }, '-created_date'),
        enabled: !!memoryId,
    });

    const mutation = useMutation({
        mutationFn: (commentData) => base44.entities.MemoryComment.create(commentData),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', memoryId]);
            setNewComment('');
        },
    });

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        mutation.mutate({
            memory_id: memoryId,
            commenter_name: user.full_name || user.email,
            comment_type: 'text',
            content: newComment,
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-amber-300">Reflections</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                <Textarea 
                    placeholder="Share a thought or reflection on this memory..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!user || mutation.isLoading}
                    className="bg-slate-800 border-slate-700 text-white focus:ring-amber-400"
                />
                <Button type="submit" disabled={!newComment.trim() || mutation.isLoading} className="self-end bg-amber-500 text-slate-900 hover:bg-amber-400">
                    {mutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Reflection
                </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-slate-700 text-amber-300">{comment.commenter_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-slate-800/70 p-3 rounded-lg border border-purple-500/20">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-amber-300">{comment.commenter_name}</p>
                                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}</p>
                                </div>
                                <p className="mt-1 text-gray-300">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-400">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                        <p>No reflections yet. Be the first to share one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
