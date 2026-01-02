import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bot,
  Sparkles,
  DollarSign,
  MessageCircle,
  FileText,
  TrendingUp,
  Package,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIPricingAdvisor from './AIPricingAdvisor';
import AICustomerResponseGenerator from './AICustomerResponseGenerator';
import AIProductDescriptionGenerator from './AIProductDescriptionGenerator';
import AIMarketingCopyGenerator from './AIMarketingCopyGenerator';

export default function AISellerAssistant({ 
  sellerProfile, 
  currentProduct, 
  onApplyPrice,
  onApplyDescription 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');

  return (
    <>
      {/* Floating AI Assistant Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl rounded-full px-6 py-6 hover:scale-110 transition-transform"
            >
              <Bot className="w-6 h-6 mr-2" />
              AI Seller Assistant
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-6 top-20 bottom-6 z-50 w-[600px] max-w-[calc(100vw-3rem)] overflow-hidden"
          >
            <Card className="h-full flex flex-col bg-white shadow-2xl border-4 border-purple-300">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6" />
                    AI Seller Assistant
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-purple-100 text-sm">
                  Your AI-powered helper for pricing, content, and customer service
                </p>
              </CardHeader>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-4 bg-purple-50 m-2 flex-shrink-0">
                  <TabsTrigger value="pricing" className="text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="marketing" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Marketing
                  </TabsTrigger>
                  <TabsTrigger value="support" className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Support
                  </TabsTrigger>
                </TabsList>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="flex-1 overflow-y-auto p-4 m-0">
                  {currentProduct ? (
                    <AIPricingAdvisor
                      productData={currentProduct}
                      onApplyPrice={onApplyPrice}
                    />
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-8 text-center">
                        <Package className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">No Product Selected</h4>
                        <p className="text-sm text-gray-600">
                          Select or create a product to get AI pricing recommendations
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="flex-1 overflow-y-auto p-4 m-0">
                  {currentProduct ? (
                    <AIProductDescriptionGenerator
                      productName={currentProduct.product_name}
                      currentDescription={currentProduct.description}
                      onUseDescription={onApplyDescription}
                    />
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">No Product Selected</h4>
                        <p className="text-sm text-gray-600">
                          Select or create a product to generate descriptions
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Marketing Tab */}
                <TabsContent value="marketing" className="flex-1 overflow-y-auto p-4 m-0">
                  {currentProduct ? (
                    <AIMarketingCopyGenerator
                      productName={currentProduct.product_name}
                      productDescription={currentProduct.description}
                    />
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">No Product Selected</h4>
                        <p className="text-sm text-gray-600">
                          Select or create a product to generate marketing copy
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Customer Support Tab */}
                <TabsContent value="support" className="flex-1 overflow-y-auto p-4 m-0">
                  <AICustomerResponseGenerator
                    sellerProfile={sellerProfile}
                    productContext={currentProduct}
                  />
                </TabsContent>
              </Tabs>

              {/* Footer Tips */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 border-t border-purple-200 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-900">
                    <strong>Pro Tip:</strong> Use AI suggestions as a starting point, then add your personal touch for authentic customer connections!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}