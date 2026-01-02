import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, Sparkles } from 'lucide-react';

export default function ChatWindow({ messages, currentUserEmail, isLoading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Start the conversation!</p>
          <p className="text-sm text-gray-500 mt-1">Send your first message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-pink-50/30">
      <AnimatePresence>
        {messages.map((message) => {
          const isMine = message.sender_email === currentUserEmail;
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback>{message.sender_name?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <motion.div 
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMine 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.1 }}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                    
                    {message.reaction && (
                      <div className="mt-1 text-lg">
                        {message.reaction}
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isMine && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}