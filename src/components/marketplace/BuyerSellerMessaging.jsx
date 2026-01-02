import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  Image as ImageIcon, 
  X, 
  CheckCircle,
  Store,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BuyerSellerMessaging({ 
  conversationId,
  sellerId,
  sellerName,
  itemId,
  itemType,
  itemName,
  itemImage,
  onClose 
}) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['marketplaceConversation', conversationId],
    queryFn: async () => {
      if (conversationId) {
        const convs = await base44.entities.MarketplaceConversation.filter({ id: conversationId });
        return convs[0];
      }
      return null;
    },
    enabled: !!conversationId
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['marketplaceMessages', conversationId || 'new'],
    queryFn: async () => {
      if (conversationId) {
        return await base44.entities.MarketplaceMessage.filter({ 
          conversation_id: conversationId 
        });
      }
      return [];
    },
    enabled: !!conversationId,
    refetchInterval: 3000 // Poll every 3 seconds for new messages
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['sellerProfile', sellerId],
    queryFn: async () => {
      const sellers = await base44.entities.SellerProfile.filter({ id: sellerId });
      return sellers[0];
    },
    enabled: !!sellerId
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MarketplaceConversation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplaceConversation']);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageData }) => {
      // Create message
      const message = await base44.entities.MarketplaceMessage.create(messageData);
      
      // Update conversation
      await base44.entities.MarketplaceConversation.update(conversationId, {
        last_message: messageData.content.substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_sender: messageData.sender_type,
        message_count: (conversation?.message_count || 0) + 1,
        [messageData.sender_type === 'buyer' ? 'unread_by_seller' : 'unread_by_buyer']: 
          ((messageData.sender_type === 'buyer' ? conversation?.unread_by_seller : conversation?.unread_by_buyer) || 0) + 1
      });

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplaceMessages']);
      queryClient.invalidateQueries(['marketplaceConversation']);
      queryClient.invalidateQueries(['sellerConversations']);
      setInput('');
      toast.success('Message sent!');
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds) => {
      const updates = messageIds.map(id => 
        base44.entities.MarketplaceMessage.update(id, {
          is_read: true,
          read_at: new Date().toISOString()
        })
      );
      await Promise.all(updates);

      // Reset unread count for current user
      const isBuyer = user?.email === conversation?.buyer_email;
      await base44.entities.MarketplaceConversation.update(conversationId, {
        [isBuyer ? 'unread_by_buyer' : 'unread_by_seller']: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['marketplaceMessages']);
      queryClient.invalidateQueries(['marketplaceConversation']);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read
    if (conversation && messages.length > 0 && user) {
      const isBuyer = user.email === conversation.buyer_email;
      const unreadMessages = messages.filter(m => 
        !m.is_read && 
        m.sender_type !== (isBuyer ? 'buyer' : 'seller')
      );
      
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate(unreadMessages.map(m => m.id));
      }
    }
  }, [messages, conversation, user]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const isBuyer = !conversation || user.email === conversation.buyer_email;
    
    let convId = conversationId;

    // Create conversation if it doesn't exist
    if (!convId) {
      const newConv = await createConversationMutation.mutateAsync({
        buyer_email: user.email,
        buyer_name: user.full_name,
        buyer_avatar: user.avatar_url,
        seller_id: sellerId,
        seller_name: sellerName,
        seller_avatar: sellerProfile?.shop_logo_url,
        item_id: itemId,
        item_type: itemType,
        item_name: itemName,
        item_image: itemImage,
        subject: `Question about ${itemName}`,
        last_message: input.substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_sender: 'buyer',
        unread_by_seller: 1,
        message_count: 1
      });
      convId = newConv.id;
    }

    const messageData = {
      conversation_id: convId,
      sender_email: user.email,
      sender_name: user.full_name,
      sender_avatar: user.avatar_url,
      sender_type: isBuyer ? 'buyer' : 'seller',
      content: input.trim(),
      message_type: 'text'
    };

    sendMessageMutation.mutate({ conversationId: convId, messageData });
  };

  const handleImageUpload = async (file) => {
    if (!user || !conversationId) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const isBuyer = user.email === conversation.buyer_email;
      const messageData = {
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        sender_type: isBuyer ? 'buyer' : 'seller',
        content: '[Image]',
        message_type: 'image',
        media_url: file_url
      };

      sendMessageMutation.mutate({ conversationId, messageData });
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const isBuyer = !conversation || user?.email === conversation?.buyer_email;

  return (
    <Card className="h-full flex flex-col shadow-2xl">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {itemImage && (
              <img src={itemImage} alt={itemName} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {isBuyer ? (
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-green-600" />
                    <span>{sellerName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    <span>{conversation?.buyer_name || 'Customer'}</span>
                  </div>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                About: <span className="font-semibold">{itemName || conversation?.item_name}</span>
              </p>
              {conversation?.has_made_purchase && (
                <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg text-gray-700 mb-2">
                Start a conversation
              </h4>
              <p className="text-sm text-gray-500">
                Ask questions about this {itemType || 'item'}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.sender_email === user?.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          {msg.sender_avatar && (
                            <img 
                              src={msg.sender_avatar} 
                              alt={msg.sender_name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="text-xs text-gray-600 font-medium">
                            {msg.sender_name}
                          </span>
                          <Badge className={msg.sender_type === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {msg.sender_type === 'seller' ? 'Seller' : 'Buyer'}
                          </Badge>
                        </div>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-3 ${
                        isOwn 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.message_type === 'image' && msg.media_url && (
                          <img 
                            src={msg.media_url} 
                            alt="Shared image"
                            className="rounded-lg mb-2 max-w-full"
                          />
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwn && msg.is_read && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                disabled={uploadingImage || !conversationId}
              />
              <Button 
                type="button"
                variant="outline" 
                size="icon"
                disabled={uploadingImage || !conversationId}
                asChild
              >
                <div>
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
              </Button>
            </label>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message ${isBuyer ? sellerName : conversation?.buyer_name || 'customer'}...`}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || sendMessageMutation.isPending}
              size="icon"
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}