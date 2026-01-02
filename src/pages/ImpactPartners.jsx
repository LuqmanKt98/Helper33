
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  TrendingUp,
  Sparkles,
  DollarSign,
  Target,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function ImpactPartners() {
  const [donationAmount, setDonationAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [dedicationNote, setDedicationNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load GoFundMe script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gofundme.com/static/js/embed.js';
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleDonate = async () => {
    const amount = customAmount || donationAmount;
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (!amount || amountInCents < 500) {
      toast.error('Minimum donation amount is $5.00');
      return;
    }

    setIsProcessing(true);

    try {
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname;
      
      const response = await base44.functions.invoke('createDonationSession', {
        amount: amountInCents,
        note: dedicationNote || undefined,
        success_url: `${currentOrigin}${currentPath}?donation=success`,
        cancel_url: `${currentOrigin}${currentPath}?donation=canceled`
      });

      if (response?.data?.sessionId) {
        const stripe = window.Stripe(response.data.publishableKey);
        await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } else {
        throw new Error('Failed to create donation session');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('donation') === 'success') {
      toast.success('Thank you for your generous donation! 💙');
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (urlParams.get('donation') === 'canceled') {
      toast.info('Donation canceled. You can donate anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const quickAmounts = ['10', '25', '50', '100', '250'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 text-lg">
            <Heart className="w-5 h-5 mr-2" />
            Impact Partners Program
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Invest in Compassionate AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in building the future of AI-powered wellness and grief support. 
            Your contribution helps us provide free resources to those who need them most.
          </p>
        </motion.div>

        {/* Dobry Family Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 shadow-xl">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900 mb-2">
                    The Dobry Family Needs Your Support
                  </CardTitle>
                  <CardDescription className="text-base text-gray-700">
                    A family healing through heartbreak while building hope for others
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Dobry family is currently navigating their own profound loss while building DobryLife to help others heal. 
                Your donations directly support the family during this difficult time and enable them to continue their mission 
                of bringing compassionate AI support to families experiencing grief and loss.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Your Donation Supports:</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Legal Support</h4>
                      <p className="text-xs text-gray-600">
                        Covering legal fees and advocacy work for the family's case
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">AI Platform Development</h4>
                      <p className="text-xs text-gray-600">
                        Building and maintaining the wellness platform to help families heal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Research & Innovation</h4>
                      <p className="text-xs text-gray-600">
                        Advancing compassionate AI technology and grief support research
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg p-4 border-l-4 border-rose-500">
                <p className="text-sm text-gray-800 font-medium">
                  <Heart className="w-4 h-4 inline mr-2 text-rose-600" />
                  Every donation helps the Dobry family heal while creating tools that support thousands of other families 
                  experiencing loss, grief, and major life transitions.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* GoFundMe Widget Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Help a Family Rebuild</CardTitle>
                  <CardDescription className="text-blue-100">
                    Support the Dobry family after heartbreaking loss
                  </CardDescription>
                </div>
                <Heart className="w-12 h-12 text-white opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* GoFundMe Embed */}
              <div 
                className="gfm-embed rounded-lg overflow-hidden" 
                data-url="https://www.gofundme.com/f/vuggj-help-a-family-rebuild-after-heartbreaking-loss/widget/large?sharesheet=undefined&attribution_id=sl:c67d1eea-f8dc-4888-9c7c-699402319af7"
              />
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 text-center">
                  <Shield className="w-4 h-4 inline mr-2 text-blue-600" />
                  100% of GoFundMe donations go directly to supporting the Dobry family and their cause
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Direct Donation to The Dobry Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardTitle className="text-2xl">Donate to The Dobry Foundation</CardTitle>
              <CardDescription className="text-purple-100">
                Support free grief resources, platform development, and compassionate AI research
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={donationAmount === amount ? 'default' : 'outline'}
                        className={donationAmount === amount ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
                        onClick={() => {
                          setDonationAmount(amount);
                          setCustomAmount('');
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      min="5"
                      step="1"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setDonationAmount('');
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Dedication Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dedication Note (Optional)
                  </label>
                  <Textarea
                    placeholder="In memory of... or in honor of..."
                    value={dedicationNote}
                    onChange={(e) => setDedicationNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {dedicationNote.length}/500 characters
                  </p>
                </div>

                {/* Donate Button */}
                <Button
                  onClick={handleDonate}
                  disabled={isProcessing || (!donationAmount && !customAmount)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Donate ${customAmount || donationAmount}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Secure payment processed by Stripe. Tax-deductible donation.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Donate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Why Your Donation Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Heart,
                    title: 'Free Grief Support',
                    description: 'Provide compassionate AI coaching to families experiencing loss, completely free of charge.'
                  },
                  {
                    icon: Users,
                    title: 'Community Building',
                    description: 'Connect families in similar situations, creating a supportive network of understanding.'
                  },
                  {
                    icon: Sparkles,
                    title: 'AI Innovation',
                    description: 'Fund research and development of compassionate AI technology that truly understands human emotion.'
                  },
                  {
                    icon: Target,
                    title: 'Accessible Wellness',
                    description: 'Make mental health and wellness tools available to everyone, regardless of their financial situation.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className={`w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Status Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 justify-center">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  The Dobry Foundation is currently working towards obtaining 501(c)(3) nonprofit status.
                </p>
                <p className="text-xs text-gray-600">
                  At this time, donations are not tax-deductible. We are actively pursuing nonprofit status 
                  and will update this information once approved. Thank you for your understanding and support.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
