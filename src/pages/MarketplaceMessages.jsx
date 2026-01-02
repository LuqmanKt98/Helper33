import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Store, 
  ShoppingBag, 
  Search,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import SEO from '@/components/SEO';
import BuyerSellerMessaging from '@/components/marketplace/BuyerSellerMessaging';

export default function MarketplaceMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['sellerProfile', user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user.email }).then(profiles => profiles[0]),
    enabled: !!user
  });

  const { data: buyerConversations = [], isLoading: isLoadingBuyer } = useQuery({
    queryKey: ['buyerConversations', user?.email],
    queryFn: () => base44.entities.MarketplaceConversation.filter({ 
      buyer_email: user.email 
    }),
    enabled: !!user,
    refetchInterval: 5000
  });

  const { data: sellerConversations = [], isLoading: isLoadingSeller } = useQuery({
    queryKey: ['sellerConversations', sellerProfile?.id],
    queryFn: () => base44.entities.MarketplaceConversation.filter({ 
      seller_id: sellerProfile.id 
    }),
    enabled: !!sellerProfile,
    refetchInterval: 5000
  });

  const allConversations = [...buyerConversations, ...sellerConversations]
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

  const filteredConversations = allConversations.filter(conv => {
    const query = searchQuery.toLowerCase();
    return (
      conv.seller_name?.toLowerCase().includes(query) ||
      conv.buyer_name?.toLowerCase().includes(query) ||
      conv.item_name?.toLowerCase().includes(query) ||
      conv.subject?.toLowerCase().includes(query)
    );
  });

  const isLoading = isLoadingBuyer || isLoadingSeller;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your messages</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="bg-purple-600">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUnread = allConversations.reduce((sum, conv) => {
    const isBuyer = conv.buyer_email === user.email;
    return sum + (isBuyer ? conv.unread_by_buyer : conv.unread_by_seller);
  }, 0);

  return (
    <>
      <SEO 
        title="Messages - DobryLife Marketplace"
        description="Your marketplace messages and conversations"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(createPageUrl('Marketplace'))}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Messages
              </h1>
              {totalUnread > 0 && (
                <Badge className="bg-red-500 text-white">
                  {totalUnread} unread
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="mt-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {filteredConversations.map((conv) => {
                        const isBuyer = conv.buyer_email === user.email;
                        const unreadCount = isBuyer ? conv.unread_by_buyer : conv.unread_by_seller;
                        const isSelected = selectedConversation?.id === conv.id;

                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-green-50 border-l-4 border-green-600' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {conv.item_image && (
                                <img 
                                  src={conv.item_image} 
                                  alt={conv.item_name}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {isBuyer ? (
                                      <Store className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                                    )}
                                    <h4 className="font-semibold text-sm truncate">
                                      {isBuyer ? conv.seller_name : conv.buyer_name}
                                    </h4>
                                  </div>
                                  {unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 truncate mb-1">
                                  {conv.item_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {conv.last_message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(conv.last_message_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <BuyerSellerMessaging
                  conversationId={selectedConversation.id}
                  sellerId={selectedConversation.seller_id}
                  sellerName={selectedConversation.seller_name}
                  itemId={selectedConversation.item_id}
                  itemType={selectedConversation.item_type}
                  itemName={selectedConversation.item_name}
                  itemImage={selectedConversation.item_image}
                  onClose={() => setSelectedConversation(null)}
                />
              ) : (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Select a Conversation
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Choose a conversation from the list to view messages and continue chatting
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}