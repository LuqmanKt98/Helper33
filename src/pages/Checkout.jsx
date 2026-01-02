import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ShoppingCart, BookHeart, Loader2, Check, Crown, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const books = [
  {
    id: 'infinity',
    title: 'Infinity',
    author: 'Ruby Dobry',
    description: 'A profound story of love, loss, and the eternal connections that bind us.',
    price: 14.99,
    priceId: 'price_1SUlLnDCrGI7amrXQluRigoK',
    userField: 'infinity_book_purchased',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9aaa000af_infinitybooky.jpg',
    features: ['21-day grief journey', 'Daily reflections', 'Healing exercises', 'Lifetime access']
  },
  {
    id: 'things_they_took',
    title: 'The Things They Took',
    author: 'Ruby Dobry',
    description: 'A poignant exploration of what is left when everything is taken—the enduring power of love and memory.',
    price: 9.99,
    priceId: 'price_1SUlQQDCrGI7amrXnIUiI8eg',
    userField: 'things_they_took_purchased',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/ff5d26129_ChatGPTImageOct21202503_19_34AM2.png',
    features: ['Powerful narrative', 'Letters & poems', 'Emotional healing', 'Lifetime access']
  }
];

export default function Checkout() {
  const [checkoutLoading, setCheckoutLoading] = useState({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const hasBookAccess = (book) => {
    if (!user) return false;
    return user.role === 'admin' || 
           user[book.userField] === true ||
           (user.subscription_status === 'active' && 
            (user.plan_type === 'executive_monthly' || user.plan_type === 'executive_yearly'));
  };

  const handleCheckout = async (book) => {
    if (!user) {
      toast.info('Sign in required', {
        description: 'Please create a free account to purchase.'
      });
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setCheckoutLoading(prev => ({ ...prev, [book.id]: true }));
    
    try {
      const currentOrigin = window.location.origin;
      
      const response = await base44.functions.invoke('createStripeCheckoutSession', {
        priceId: book.priceId,
        successUrl: `${currentOrigin}/checkout?success=true&book=${book.id}`,
        cancelUrl: `${currentOrigin}/checkout?cancelled=true`,
        metadata: {
          product_type: 'book',
          book_id: book.id,
          user_field_to_update: book.userField
        }
      });

      const checkoutUrl = response?.url || response?.data?.url;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to process checkout. Please try again.');
      setCheckoutLoading(prev => ({ ...prev, [book.id]: false }));
    }
  };

  // Check for success/cancel in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const cancelled = urlParams.get('cancelled');
    const bookId = urlParams.get('book');

    if (success === 'true') {
      toast.success('🎉 Purchase successful!', {
        description: 'Your book has been unlocked. Enjoy reading!',
        duration: 5000
      });
      window.history.replaceState({}, '', '/checkout');
    } else if (cancelled === 'true') {
      toast.info('Purchase cancelled', {
        description: 'No charges were made. You can try again anytime.'
      });
      window.history.replaceState({}, '', '/checkout');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-6"
        >
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50"
          >
            <Link to={createPageUrl('BookStudio')}>
              <ArrowLeft className="w-4 h-4" />
              Back to Book Studio
            </Link>
          </Button>
        </motion.div>

        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <ShoppingCart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Checkout</h1>
          <p className="text-lg text-gray-600">
            Purchase Ruby Dobry's transformative books with secure one-time payment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader>
                  <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    {hasBookAccess(book) && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-emerald-500 text-white border-2 border-emerald-300">
                          <Crown className="w-4 h-4 mr-1" />
                          Owned
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600">By {book.author}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{book.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {book.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border-2 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasBookAccess(book) ? (
                          <>
                            <Crown className="w-5 h-5 text-emerald-600" />
                            <span className="font-bold text-emerald-700">Purchased</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-amber-600" />
                            <span className="font-bold text-amber-700">${book.price}</span>
                          </>
                        )}
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        One-Time
                      </Badge>
                    </div>
                  </div>

                  {hasBookAccess(book) ? (
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-12 text-lg font-semibold"
                      onClick={() => window.location.href = book.id === 'infinity' ? '/infinity-book' : '/things-they-took-book'}
                    >
                      <BookHeart className="w-5 h-5 mr-2" />
                      Read Now
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(book)}
                      disabled={checkoutLoading[book.id]}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg font-semibold"
                    >
                      {checkoutLoading[book.id] ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Buy Now - ${book.price}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-200 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Why Choose DobryLife Books?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">Protected by Stripe's secure checkout</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lifetime Access</h3>
              <p className="text-sm text-gray-600">Read anytime, anywhere, forever</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <BookHeart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
              <p className="text-sm text-gray-600">Start reading immediately after purchase</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}