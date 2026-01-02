
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, FamilyMember } from '@/entities/all';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Circle, MessageSquare, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageBubble = ({ message, isCurrentUser, showSender = true }) => (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {message.sender_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
        )}
        <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
            isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}>
            {!isCurrentUser && showSender && (
                <div className="text-xs font-bold mb-1 text-gray-500">{message.sender_name}</div>
            )}
            <p className="text-sm leading-relaxed">{message.content}</p>
            <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.created_date).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </div>
        </div>
    </div>
);

const FamilyMemberAvailability = ({ member, isOnline }) => {
    const getStatusColor = () => {
        if (!member.last_access) return 'bg-gray-400';
        
        const lastAccess = new Date(member.last_access);
        const now = new Date();
        const minutesAgo = (now - lastAccess) / (1000 * 60);
        
        if (minutesAgo < 5) return 'bg-green-500'; // Online
        if (minutesAgo < 30) return 'bg-yellow-500'; // Recently active
        if (minutesAgo < 1440) return 'bg-orange-500'; // Active today
        return 'bg-gray-400'; // Inactive
    };

    const getStatusText = () => {
        if (!member.last_access) return 'Never active';
        
        const lastAccess = new Date(member.last_access);
        const now = new Date();
        const minutesAgo = (now - lastAccess) / (1000 * 60);
        
        if (minutesAgo < 5) return 'Online now';
        if (minutesAgo < 30) return `${Math.round(minutesAgo)}m ago`;
        if (minutesAgo < 60) return `${Math.round(minutesAgo)}m ago`;
        if (minutesAgo < 1440) return `${Math.round(minutesAgo / 60)}h ago`;
        return `${Math.round(minutesAgo / 1440)}d ago`;
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor()}`}></div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 truncate">{member.name}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                        {member.relationship}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Circle className="w-2 h-2 fill-current" />
                    {getStatusText()}
                </div>
            </div>
            <div className="flex gap-1">
                {member.phone_number && (
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-gray-400 hover:text-blue-600"
                        onClick={() => window.open(`tel:${member.phone_number}`)}
                        title="Call"
                    >
                        <Phone className="w-3 h-3" />
                    </Button>
                )}
                {member.email && (
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-gray-400 hover:text-blue-600"
                        onClick={() => window.open(`mailto:${member.email}`)}
                        title="Email"
                    >
                        <Mail className="w-3 h-3" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default function FamilyChat({ contextId, contextType }) {
    const [messages, setMessages] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (error) {
                console.log("Not logged in");
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const members = await FamilyMember.list('name');
                setFamilyMembers(members);
            } catch (error) {
                console.error("Error loading family members:", error);
            }
        };
        fetchFamilyMembers();
    }, []);

    const createSampleMessages = useCallback(async () => {
        if (!currentUser || !contextId || !contextType) return false;
        
        const sampleMessages = [
            {
                sender_name: currentUser.full_name || 'You',
                content: 'Hey everyone! I set up our family chat. We can coordinate schedules and stay connected here.',
                context_id: contextId,
                context_type: contextType,
            },
            {
                sender_name: 'Family Bot',
                content: '🏠 Welcome to your family communication hub! This is where you can share updates, coordinate activities, and stay connected.',
                context_id: contextId,
                context_type: contextType,
            },
            {
                sender_name: 'Family Bot',
                content: '💡 Tip: You can see when family members were last active in the sidebar, and use the phone/email buttons to reach them directly!',
                context_id: contextId,
                context_type: contextType,
            }
        ];

        try {
            for (const messageData of sampleMessages) {
                await ChatMessage.create(messageData);
                // Add a small delay between messages
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return true; // Success
        } catch (error) {
            console.error("Error creating sample messages:", error);
            return false;
        }
    }, [currentUser, contextId, contextType]);

    const loadMessages = useCallback(async (skipSampleCreation = false) => {
        if (!contextId) return;
        try {
            setIsLoading(true);
            setLoadingError(null);
            
            console.log(`Loading messages for context: ${contextId}, type: ${contextType}`);
            
            // Try to load messages with the filter
            const fetchedMessages = await ChatMessage.filter(
                { context_id: contextId, context_type: contextType },
                '-created_date', // Most recent first
                showHistory ? 100 : 50
            );
            
            const sortedMessages = fetchedMessages.sort((a, b) => 
                new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
            );

            console.log(`Loaded ${sortedMessages.length} messages`);
            setMessages(sortedMessages);
            
            // If no messages exist and we haven't tried creating samples yet, create them
            if (sortedMessages.length === 0 && currentUser && !skipSampleCreation) {
                console.log("No messages found, creating sample messages...");
                const samplesCreated = await createSampleMessages();
                if (samplesCreated) {
                    // Wait a bit and reload to get the newly created messages
                    setTimeout(() => {
                        loadMessages(true); // Skip sample creation on retry
                    }, 1000);
                }
            }
            
        } catch (error) {
            console.error("Error loading messages:", error);
            setLoadingError(error.message);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [contextId, contextType, showHistory, currentUser, createSampleMessages]);
    
    useEffect(() => {
        loadMessages();
        const interval = setInterval(() => loadMessages(true), 10000); // Check every 10 seconds, skip sample creation
        return () => clearInterval(interval);
    }, [loadMessages]);
    
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;
        
        const messageData = {
            sender_name: currentUser.full_name || 'Anonymous',
            content: newMessage.trim(),
            context_id: contextId,
            context_type: contextType,
        };
        
        try {
            // Optimistic update
            const optimisticMessage = { 
                ...messageData, 
                created_date: new Date().toISOString(),
                id: 'temp-' + Date.now()
            };
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');
            
            // Create the actual message
            await ChatMessage.create(messageData);
            
            // Refresh messages after a short delay to get the real message with proper ID
            setTimeout(() => {
                loadMessages(true); // Skip sample creation
            }, 1000);
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => !msg.id?.startsWith('temp-')));
            // Restore the message text
            setNewMessage(messageData.content);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_date).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    };

    return (
        <div className="flex h-full">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Family Chat</h3>
                            <Badge variant="outline" className="text-xs">
                                {messages.length} messages
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowHistory(!showHistory)}
                                className="text-xs"
                            >
                                {showHistory ? 'Recent Only' : 'Show All'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadMessages(true)} // Skip sample creation on manual refresh
                                disabled={isLoading}
                                className="text-xs"
                            >
                                {isLoading ? 'Loading...' : 'Refresh'}
                            </Button>
                        </div>
                    </div>
                    {loadingError && (
                        <div className="mt-2 text-xs text-red-600">
                            Error loading messages: {loadingError}
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && !loadingError ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="mt-2 text-sm text-gray-600">Loading messages...</span>
                        </div>
                    ) : loadingError ? (
                        <div className="text-center py-8 text-red-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-red-300" />
                            <p className="text-sm">Error loading messages</p>
                            <Button onClick={() => loadMessages(true)} className="mt-2" size="sm">
                                Try Again
                            </Button>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No messages yet.</p>
                            <p className="text-xs">Start a conversation with your family!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                                <div key={date}>
                                    {/* Date Header */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                                            {formatDateHeader(date)}
                                        </div>
                                    </div>
                                    
                                    {/* Messages for this date */}
                                    <div className="space-y-3">
                                        {dayMessages.map((msg, index) => (
                                            <motion.div
                                                key={msg.id || index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <MessageBubble 
                                                    message={msg} 
                                                    isCurrentUser={msg.sender_name === currentUser?.full_name}
                                                    showSender={true}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white/50">
                    <div className="relative">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message... (Press Enter to send)"
                            className="pr-12 resize-none"
                            rows={2}
                        />
                        <Button
                            size="icon"
                            className="absolute bottom-2 right-2"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Family Members Sidebar */}
            <div className="w-80 border-l bg-gray-50/50 flex flex-col">
                <div className="p-4 border-b bg-white/50">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">Family Members</h3>
                        <Badge variant="outline" className="text-xs">
                            {familyMembers.filter(m => {
                                if (!m.last_access) return false;
                                const minutesAgo = (new Date() - new Date(m.last_access)) / (1000 * 60);
                                return minutesAgo < 30;
                            }).length} active
                        </Badge>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {familyMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No family members added yet.</p>
                            <p className="text-xs">Add family members to see who's available!</p>
                        </div>
                    ) : (
                        familyMembers
                            .sort((a, b) => {
                                // Sort by last access time (most recent first)
                                const aTime = a.last_access ? new Date(a.last_access) : new Date(0);
                                const bTime = b.last_access ? new Date(b.last_access) : new Date(0);
                                return bTime - aTime;
                            })
                            .map((member) => (
                                <FamilyMemberAvailability 
                                    key={member.id} 
                                    member={member}
                                />
                            ))
                    )}
                </div>
                
                <div className="p-4 border-t bg-white/50">
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Online (last 5 min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span>Recently active (30 min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span>Active today</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>Inactive</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
