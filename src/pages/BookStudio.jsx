import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { BookHeart, Lock, Droplets, Mic, Feather, ShoppingCart, Loader2, Crown, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const books = [
  {
    title: "Infinity",
    author: "By Ruby Dobry",
    description: "A profound story of love, loss, and the eternal connections that bind us. Ruby shares her deeply personal journey through grief, discovering that love transcends physical presence and lives on in infinite ways.",
    icon: BookHeart,
    link: createPageUrl("InfinityBook"),
    color: "from-rose-400 to-pink-500",
    coverImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9aaa000af_infinitybooky.jpg')",
    buttonText: "Read Book",
    aboutAuthor: "Ruby Dobry is a writer, mother, and advocate who transformed her personal tragedy into a mission of hope. After losing her beloved husband, she discovered that grief is not just an ending—it's also a beginning. Through her writing, Ruby explores the profound truth that love never truly dies; it simply transforms. Her story is one of resilience, faith, and the belief that those we've lost remain with us in infinite ways.",
    isBook: true,
    previewPages: 5,
    price: 14.99,
    priceId: 'price_1SUlLnDCrGI7amrXQluRigoK',
    userField: 'infinity_book_purchased',
    bookId: 'infinity'
  },
  {
    title: "The Things They Took: The Love That Stayed",
    author: "By Ruby Dobry",
    description: "A poignant exploration of what is left when everything is taken—the enduring power of love and memory.",
    icon: Feather,
    link: createPageUrl("ThingsTheyTookBook"),
    color: "from-indigo-400 to-purple-500",
    coverImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/ff5d26129_ChatGPTImageOct21202503_19_34AM2.png')",
    buttonText: "Read Story",
    isBook: true,
    price: 9.99,
    priceId: 'price_1SUlQQDCrGI7amrXnIUiI8eg',
    userField: 'things_they_took_purchased',
    bookId: 'things_they_took'
  },
  {
    title: "A Prayer for Those Who Profited from Our Pain",
    author: "By Ruby Dobry",
    description: "An emotional journey exploring karma, justice, and healing—letting the law of the universe return what was sown.",
    icon: Droplets,
    link: createPageUrl("CryMeARiverBook"),
    color: "from-blue-400 to-cyan-500",
    coverImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/02396b2ab_ChatGPTImageOct26202511_23_40PM.png')",
    buttonText: "Discover More",
  },
  {
    title: "The Voice",
    author: "By Alex Echo",
    description: "Unraveling the power of one's inner voice and its impact on destiny.",
    icon: Mic,
    link: createPageUrl("TheVoiceBook"),
    color: "from-purple-400 to-indigo-500",
    coverImage: "url('https://images.unsplash.com/photo-1517292370125-ad031631e13b?q=80&w=2070')",
    buttonText: "Listen In",
  }
];

export default function BookStudio() {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Check for purchase success
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('purchase') === 'success') {
      const bookId = urlParams.get('book');
      toast.success('🎉 Purchase successful! Book unlocked.', { duration: 5000 });
      window.history.replaceState({}, '', createPageUrl('BookStudio'));
    }
  }, []);

  const handleBuyBook = (book) => {
    const currentOrigin = window.location.origin;
    const successUrl = `${currentOrigin}${createPageUrl('BookStudio')}?purchase=success&book=${book.bookId}`;

    if (book.bookId === 'infinity') {
      window.location.href = `https://buy.stripe.com/eVq9AT3ic5qj6Kz27McAo00?client_reference_id=${user?.id || 'guest'}&success_url=${encodeURIComponent(successUrl)}`;
    } else if (book.bookId === 'things_they_took') {
      window.location.href = `https://buy.stripe.com/14A9ATg4YbOH5Gv27McAo01?client_reference_id=${user?.id || 'guest'}&success_url=${encodeURIComponent(successUrl)}`;
    } else {
      // Keep existing Stripe integration for other books
      if (!user) {
        toast.info('Create a free account to purchase', {
          description: 'Sign up to unlock books and save your progress.'
        });
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      setCheckoutLoading(prev => ({ ...prev, [book.bookId]: true }));

      const handleStripeCheckout = async () => {
        try {
          const currentOrigin = window.location.origin;

          const result = await base44.functions.invoke('createStripeCheckoutSession', {
            priceId: book.priceId,
            successUrl: `${currentOrigin}${book.link}?purchase=success`,
            cancelUrl: `${currentOrigin}${createPageUrl('BookStudio')}?purchase=cancelled`,
            metadata: {
              product_type: 'book',
              book_id: book.bookId,
              user_field_to_update: book.userField
            }
          });

          const checkoutUrl = result?.url || result?.data?.url;

          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error('No checkout URL received from server');
          }
        } catch (error) {
          console.error('Checkout error:', error);

          let errorMessage = 'Unable to start checkout. Please try again.';

          if (error.message?.includes('Network Error')) {
            errorMessage = 'Connection error. Please check your internet and try again.';
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          }

          toast.error(errorMessage);
          setCheckoutLoading(prev => ({ ...prev, [book.bookId]: false }));
        }
      };

      handleStripeCheckout();
    }
  };

  const hasBookAccess = (book) => {
    if (!user) return false;
    return user.role === 'admin' || 
           user[book.userField] === true ||
           (user.subscription_status === 'active' && 
            (user.plan_type === 'executive_monthly' || user.plan_type === 'executive_yearly'));
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Lock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Private Collection</h1>
          <p className="text-gray-600 mb-8">This is a private collection of writings. Please sign in to view.</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-gradient-to-r from-purple-500 to-pink-500">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Book Studio - Private Collection | Ruby Dobry"
        description="Private collection of writings by Ruby Dobry"
        keywords="admin books, private collection, Ruby Dobry, writings"
      />
      
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50"
            >
              <Link to={createPageUrl('Dashboard')}>
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>
          </motion.div>

          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
              Book Studio
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A collection of heartfelt stories and reflections
            </p>
          </motion.header>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {books.map((book) => (
              <motion.div
                key={book.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-lg border-2 shadow-xl overflow-hidden flex flex-col hover:shadow-2xl border-gray-200">
                  <div className="relative h-56">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: book.coverImage }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>

                  <CardContent className="p-6 flex-grow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${book.color} text-white shadow-md flex-shrink-0`}>
                        <book.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
                        {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">{book.description}</p>
                    
                    {book.aboutAuthor && (
                      <details className="mt-3">
                        <summary className="text-sm font-semibold text-purple-600 cursor-pointer hover:text-purple-700">
                          About the Author
                        </summary>
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {book.aboutAuthor}
                        </p>
                      </details>
                    )}

                    <div className="mt-6 space-y-3">
                      {book.price && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                          <div className="flex items-center gap-2">
                            {hasBookAccess(book) ? (
                              <>
                                <Crown className="w-5 h-5 text-amber-600" />
                                <span className="font-bold text-amber-700">Owned</span>
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
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          asChild 
                          variant="outline"
                          className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link to={book.link}>
                            <BookHeart className="w-4 h-4 mr-2" />
                            Preview
                          </Link>
                        </Button>
                        
                        {book.price && !hasBookAccess(book) && (
                          <Button
                            onClick={() => handleBuyBook(book)}
                            disabled={checkoutLoading[book.bookId]}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                          >
                            {checkoutLoading[book.bookId] ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy Now
                              </>
                            )}
                          </Button>
                        )}
                        
                        {book.price && hasBookAccess(book) && (
                          <Button 
                            asChild
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
                          >
                            <Link to={book.link}>
                              <Crown className="w-4 h-4 mr-2" />
                              Read Full
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}