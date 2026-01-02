import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function ProductCard({ product, onViewDetails }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader className="p-0 relative">
          <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
          {product.is_recommended && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 shadow-md">
              Recommended
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col">
          <CardTitle className="text-lg font-bold text-gray-800 mb-2">{product.name}</CardTitle>
          <p className="text-sm text-gray-600 mb-4 flex-1">{product.tagline}</p>
          <div className="flex justify-between items-center mt-auto">
            <p className="text-xl font-extrabold text-emerald-600">${product.price.toFixed(2)}</p>
            <Button variant="outline" onClick={() => onViewDetails(product)} className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}