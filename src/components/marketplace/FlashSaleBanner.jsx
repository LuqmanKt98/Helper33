import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Clock, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FlashSaleBanner() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({});

  const { data: activeFlashSales = [] } = useQuery({
    queryKey: ['flashSales'],
    queryFn: async () => {
      const now = new Date();
      const sales = await base44.entities.FlashSale.filter({
        status: 'active'
      });
      
      return sales.filter(sale => {
        const start = new Date(sale.start_time);
        const end = new Date(sale.end_time);
        return start <= now && end >= now;
      }).sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  useEffect(() => {
    if (activeFlashSales.length === 0) return;

    const updateCountdowns = () => {
      const newTimeLeft = {};
      activeFlashSales.forEach(sale => {
        const end = new Date(sale.end_time);
        const now = new Date();
        const diff = end - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newTimeLeft[sale.id] = { hours, minutes, seconds, expired: false };
        } else {
          newTimeLeft[sale.id] = { hours: 0, minutes: 0, seconds: 0, expired: true };
        }
      });
      setTimeLeft(newTimeLeft);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [activeFlashSales]);

  if (activeFlashSales.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <AnimatePresence>
        {activeFlashSales.map((sale, idx) => {
          const countdown = timeLeft[sale.id] || { hours: 0, minutes: 0, seconds: 0, expired: false };
          const isSoldOut = sale.quantity_limit && sale.quantity_sold >= sale.quantity_limit;
          
          if (countdown.expired || isSoldOut) return null;

          return (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-4 border-red-500 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 transform rotate-45 translate-x-16 -translate-y-16">
                  <div className="absolute bottom-8 left-4 transform -rotate-45">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    {/* Sale Item Image */}
                    {sale.item_image && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                        <img 
                          src={sale.item_image} 
                          alt={sale.item_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Sale Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-600 text-white animate-pulse">
                          <Flame className="w-3 h-3 mr-1" />
                          FLASH SALE
                        </Badge>
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          {sale.discount_percentage}% OFF
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{sale.sale_name}</h3>
                        <p className="text-gray-700">{sale.item_name}</p>
                        <p className="text-sm text-gray-600 mt-1">by {sale.seller_name}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-3xl font-bold text-red-600">${sale.sale_price}</span>
                          <span className="text-lg text-gray-500 line-through ml-2">${sale.original_price}</span>
                        </div>
                        {sale.quantity_limit && (
                          <Badge variant="outline" className="border-red-400">
                            {sale.quantity_limit - sale.quantity_sold} left!
                          </Badge>
                        )}
                      </div>

                      {sale.urgency_message && (
                        <p className="text-sm font-semibold text-orange-700">
                          ⚡ {sale.urgency_message}
                        </p>
                      )}
                    </div>

                    {/* Countdown Timer */}
                    <div className="lg:text-right space-y-3">
                      <div className="flex items-center gap-2 justify-center lg:justify-end">
                        <Clock className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-semibold text-gray-700">Ends in:</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="bg-red-600 text-white rounded-lg p-3 min-w-[60px] text-center">
                          <div className="text-2xl font-bold">{countdown.hours}</div>
                          <div className="text-xs">Hours</div>
                        </div>
                        <div className="bg-red-600 text-white rounded-lg p-3 min-w-[60px] text-center">
                          <div className="text-2xl font-bold">{countdown.minutes}</div>
                          <div className="text-xs">Min</div>
                        </div>
                        <div className="bg-red-600 text-white rounded-lg p-3 min-w-[60px] text-center">
                          <div className="text-2xl font-bold">{countdown.seconds}</div>
                          <div className="text-xs">Sec</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          const url = sale.item_type === 'course'
                            ? createPageUrl('CourseDetail') + `?id=${sale.item_id}`
                            : createPageUrl('ProductDetail') + `?id=${sale.item_id}`;
                          navigate(url);
                        }}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Grab This Deal!
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}