
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, Clock, Sparkles, ArrowRight, Globe, Sun, Truck, Moon, Wind, Heart, BrainCircuit, Flower2, Coffee, Zap } from 'lucide-react';

export default function TeaIsLifePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleNotifyClick = () => {
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };
  
  const teaCollection = [
    { name: "Dobry Slim", icon: Leaf, colors: "from-green-400 to-emerald-500" },
    { name: "Dobry Acai Berry", icon: Heart, colors: "from-rose-400 to-purple-500" },
    { name: "Dobry Colon Cleanse", icon: Wind, colors: "from-sky-400 to-cyan-500" },
    { name: "Organic Paw Paw Leaf Tea", icon: Sun, colors: "from-amber-400 to-orange-500" },
    { name: "Organic Concentration Tea", icon: BrainCircuit, colors: "from-indigo-400 to-blue-500" },
    { name: "Blue Butterfly Pea Flower", icon: Flower2, colors: "from-blue-500 to-violet-600" },
    { name: "Dobry Snooze Tea", icon: Moon, colors: "from-slate-800 to-indigo-900" },
    { name: "Organic SUPER Chai Tea", icon: Zap, colors: "from-yellow-500 to-red-500" },
    { name: "Matcha (Japanese Premium)", icon: Coffee, colors: "from-lime-400 to-green-600" },
    { name: "Jasmine Tea", icon: Sparkles, colors: "from-pink-300 to-fuchsia-400" }
  ];
  
  const galleryImages = [
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/3e4d80eca_DobrySnooze.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/2ef11a9f6_DobrySlim.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/5fa5640ce_ColonCleanse.jpg",
    "https://images.unsplash.com/photo-1597352136419-756b9c647b59?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563991321706-5b8d1478546b?q=80&w=2071&auto=format&fit=crop",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/a217b6787_blue2_2000x.jpg",
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/3993fd30f_mm.jpeg"
  ];

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
  };

  const listItemVariants = {
      hidden: { opacity: 0, scale: 0.8, y: 20 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { type: 'spring', stiffness: 150, damping: 20 }
      }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1541884705327-3a1d9535f41e?q=80&w=2070&auto=format&fit=crop" 
          alt="Lush tea plantation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-emerald-50/80 to-cyan-50/90"></div>
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(110, 231, 183, 0.2)',
              left: `${Math.random() * 100}%`,
              animation: `float-up ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 15}s`,
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              bottom: '-80px',
              opacity: Math.random(),
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes float-up {
          to {
            transform: translateY(-120vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `}</style>

      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full"
        >
          {/* Hero Section */}
          <motion.section 
            variants={itemVariants}
            className="relative py-20 px-4"
          >
            <div className="relative z-10 max-w-4xl mx-auto">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
                <Leaf className="w-16 h-16 text-emerald-600 mx-auto mb-4 drop-shadow-lg" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-4 tracking-tight" style={{textShadow: '0 2px 10px rgba(255,255,255,0.5)'}}>
                A New Ritual is Brewing
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Discover the therapeutic ritual of tea and bath. A simple, profound path to daily wellness and inner peace.
              </p>
              
              {!showConfirmation ? (
                 <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg text-lg px-8 py-6 rounded-full" onClick={handleNotifyClick}>
                    <Clock className="w-5 h-5 mr-2" />
                    Notify Me When It's Ready
                  </Button>
              ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold text-emerald-700 bg-emerald-100/50 backdrop-blur-sm border border-emerald-200 py-3 px-6 rounded-full inline-block"
                >
                    ✅ You'll be the first to know!
                </motion.div>
              )}

            </div>
          </motion.section>

          {/* Coming Soon & External Link Section */}
          <motion.section variants={itemVariants} className="mt-16 w-full">
            <div 
              className="p-8 md:p-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 max-w-4xl mx-auto"
              data-card
            >
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-4"/>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Tea Collection is Coming Soon</h2>
              <p className="text-gray-600 mb-8">
                We are lovingly curating and perfecting a unique collection of wellness teas designed to calm your mind and nourish your body. Here's a vibrant sneak peek:
              </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Curated with love by <span className="font-semibold text-purple-600">Kismet Moona</span>, 
              blending ancient wisdom with modern wellness. Each blend is crafted to support your healing journey.
            </p>

              
              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
              >
                {teaCollection.map((tea) => (
                  <motion.div
                    key={tea.name}
                    variants={listItemVariants}
                    whileHover={{ scale: 1.08, y: -8, rotate: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative group p-4 aspect-[4/5] rounded-2xl shadow-lg flex flex-col items-center justify-center text-center text-white bg-gradient-to-br ${tea.colors} transition-all duration-300 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    <motion.div 
                      className="relative z-10 flex flex-col items-center"
                      initial={{ y:10, opacity: 0 }}
                      animate={{ y:0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <tea.icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
                      <h4 className="font-bold text-sm sm:text-base leading-tight drop-shadow-sm">{tea.name}</h4>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Image Gallery */}
              <div className="w-full overflow-hidden mb-8">
                <div className="flex animate-scroll gap-4">
                    {[...galleryImages, ...galleryImages].map((src, index) => (
                        <img key={index} src={src} className="w-48 h-32 object-cover rounded-xl shadow-lg flex-shrink-0"/>
                    ))}
                </div>
              </div>
              <style>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                    width: calc(208px * ${galleryImages.length * 2});
                }
              `}</style>

              {/* Brand Story Section */}
              <div className="text-left bg-gray-50/50 rounded-xl border p-4 mb-8 text-sm text-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div whileHover={{y:-2}} className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <div><span className="font-semibold">Born</span> in California</div>
                  </motion.div>
                  <motion.div whileHover={{y:-2}} className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-500 flex-shrink-0" />
                    <div><span className="font-semibold">Sourced</span> globally</div>
                  </motion.div>
                   <motion.div whileHover={{y:-2}} className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div><span className="font-semibold">Crafted</span> in Australia</div>
                  </motion.div>
                  <motion.div whileHover={{y:-2}} className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div><span className="font-semibold">Shipped</span> from Texas directly to you</div>
                  </motion.div>
                </div>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">In the meantime...</h3>
                <p className="text-emerald-700 mb-4">
                  Explore a wonderful selection of related wellness products at our partner store.
                </p>
                <a href="https://hopefulgarden.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full md:w-auto bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full">
                    Visit HopefulGarden.com
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
