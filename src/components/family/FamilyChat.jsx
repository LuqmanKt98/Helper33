
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '@/entities/all';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X, Loader2, Mic, Play, Pause, Square, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const usePermissions = (member) => {
  if (!member) return { canSendChat: false, canSendVoiceNote: false };
  
  const role = member.role;
  
  // All logged-in users can send chat messages
  const permissions = {
    canSendChat: true, // Everyone can send text messages
    canSendVoiceNote: ['PlatformFounder', 'FamilyAdmin', 'ParentGuardian', 'AdultMember', 'TeenMember', 'ChildMember'].includes(role),
    canStartCall: ['PlatformFounder', 'FamilyAdmin', 'ParentGuardian', 'AdultMember', 'TeenMember'].includes(role),
    isGuest: role === 'GuestCaregiver',
  };
  
  return permissions;
};

const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VoiceNotePlayer = ({ src, duration }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-2 w-48">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={togglePlay}>
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">{formatDuration(duration)}</span>
    </div>
  );
};


const MessageBubble = ({ message, isCurrentUser }) => (
  <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
    {!isCurrentUser && (
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender_avatar_url} />
        <AvatarFallback>{message.sender_name?.charAt(0)}</AvatarFallback>
      </Avatar>
    )}
    <div
      className={cn(
        "max-w-xs md:max-w-md rounded-2xl px-4 py-2",
        isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
      )}
    >
      {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.sender_name}</p>}
      {message.message_type === 'voice_note' ? (
        <VoiceNotePlayer src={message.media_url} duration={message.media_duration} />
      ) : (
        <p className="text-sm">{message.content}</p>
      )}
    </div>
    {isCurrentUser && (
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.sender_avatar_url} />
        <AvatarFallback>{message.sender_name?.charAt(0)}</AvatarFallback>
      </Avatar>
    )}
  </div>
);

export default function FamilyChat({ currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioChunksRef = useRef([]);

  const permissions = usePermissions(currentUser);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['familyChatMessages'],
    queryFn: () => ChatMessage.filter({ context_id: 'family_group_chat' }, 'created_date'),
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => ChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyChatMessages'] });
      setNewMessage('');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    }
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendText = (e) => {
    e.preventDefault();
    if (newMessage.trim() && permissions.canSendChat && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate({
        content: newMessage.trim(),
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_avatar_url: currentUser.avatar_url,
        context_id: 'family_group_chat',
        context_type: 'family',
        message_type: 'text',
      });
    }
  };

  const startRecording = async () => {
    if (!permissions.canSendVoiceNote) {
        toast.info("Your account role does not have permission to send voice notes.");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
            
            toast.info("Uploading voice note...");
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
                
                const audio = new Audio(URL.createObjectURL(audioBlob));
                audio.onloadedmetadata = () => {
                    sendMessageMutation.mutate({
                        sender_id: currentUser.id,
                        sender_name: currentUser.full_name,
                        sender_avatar_url: currentUser.avatar_url,
                        context_id: 'family_group_chat',
                        context_type: 'family',
                        message_type: 'voice_note',
                        media_url: file_url,
                        media_duration: audio.duration,
                    });
                };
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error("Failed to upload voice note.");
            }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        toast.error("Could not start recording. Please check microphone permissions.");
        console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop microphone track
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-card border-2 border-purple-300 rounded-xl shadow-2xl flex flex-col z-50">
      <header className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Family Group Chat</h3>
            <Badge className="bg-green-500 text-white text-xs">
              Secure & Private
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading && <Loader2 className="mx-auto w-6 h-6 animate-spin text-muted-foreground" />}
          {messages?.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender_id === currentUser.id} />
          ))}
           {messages?.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground pt-10">
                Say hello to your family!
              </div>
            )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-gradient-to-r from-purple-50/30 to-pink-50/30">
        {isRecording ? (
           <div className="flex items-center justify-center gap-4">
              <p className="text-sm text-red-500 animate-pulse">Recording...</p>
              <Button onClick={stopRecording} variant="destructive" size="icon">
                  <Square className="w-4 h-4" />
              </Button>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
              disabled={sendMessageMutation.isPending || !permissions.canSendChat}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !permissions.canSendChat || !newMessage.trim()}
              size="icon"
            >
              {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={startRecording} 
              disabled={!permissions.canSendVoiceNote}
              size="icon"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
