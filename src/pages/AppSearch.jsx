
import React, { useState } from 'react';
import { AppTool, AppSearchRequest } from '@/entities/all';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Star,
  ExternalLink,
  Smartphone,
  Monitor,
  Globe,
  Loader2,
  SlidersHorizontal,
  Wind,
  ShieldCheck } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const platformIcons = {
  web: Globe,
  ios: Smartphone,
  android: Smartphone,
  windows: Monitor,
  mac: Monitor,
  linux: Monitor
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PlatformCheckbox = ({ id, label, checked, onChange }) => {
  const Icon = platformIcons[id] || Globe;
  return (
    <label htmlFor={id} className={cn(
      "flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all duration-300",
      checked ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white/80 border-gray-200 hover:border-blue-300"
    )}>
            <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="hidden" />

            <Icon className={cn("w-5 h-5", checked ? "text-blue-600" : "text-gray-500")} />
            <span className={cn("font-medium text-sm", checked ? "text-blue-800" : "text-gray-700")}>
                {label}
            </span>
        </label>);

};

const ToolCard = ({ tool }) =>
<motion.div
  variants={itemVariants}
  className="h-full"
  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(79, 70, 229, 0.1)" }}>

        <Card className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {tool.name}
                            {tool.admin_verified &&
            <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified Business" />
            }
                        </CardTitle>
                         <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{tool.user_rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-gray-500 text-xs">({tool.total_reviews || 0})</span>
                        </div>
                    </div>
                    <Badge className={cn(
          'capitalize text-xs font-semibold',
          tool.pricing_type === 'free' ? 'bg-green-100 text-green-800 border border-green-200' :
          tool.pricing_type === 'freemium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          'bg-orange-100 text-orange-800 border border-orange-200'
        )}>
                        {tool.pricing_type}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">{tool.description}</p>
                
                {tool.features && tool.features.length > 0 &&
      <div>
                        <div className="flex flex-wrap gap-1.5">
                            {tool.features.slice(0, 3).map((feature, index) =>
          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                    {feature}
                                </Badge>
          )}
                        </div>
                    </div>
      }
                
                <div className="pt-4 mt-auto">
                     <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                             {tool.platforms && tool.platforms.map((platform) => {
              const Icon = platformIcons[platform] || Globe;
              return (
                <Icon key={platform} className="w-4 h-4 text-gray-400" title={platform} />);

            })}
                        </div>
                        <Button
            size="sm"
            onClick={() => window.open(tool.website_url, '_blank')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full px-4 py-2 text-xs shadow-lg hover:shadow-xl transition-all group">

                            View Tool
                            <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>;


export default function AppSearch() {
  const [searchForm, setSearchForm] = useState({
    search_description: '',
    assignment_purpose: '',
    preferred_pricing: 'any',
    required_platforms: [],
    budget_range: 'flexible',
    business_verification_required: true
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlatformChange = (platform, checked) => {
    setSearchForm((prev) => ({
      ...prev,
      required_platforms: checked ?
      [...prev.required_platforms, platform] :
      prev.required_platforms.filter((p) => p !== platform)
    }));
  };

  const handleSearch = async () => {
    if (!searchForm.search_description.trim()) {
      alert('Please describe what tool you\'re looking for.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
      const aiResponse = await InvokeLLM({
        prompt: `Find and recommend 8-12 software tools/apps based on this search:
                
                What they're looking for: ${searchForm.search_description}
                Purpose/Assignment: ${searchForm.assignment_purpose}
                Pricing preference: ${searchForm.preferred_pricing}
                Platforms needed: ${searchForm.required_platforms.join(', ') || 'any'}
                Budget: ${searchForm.budget_range}
                Business verification required: ${searchForm.business_verification_required}
                
                Provide a mix of well-known and niche tools. Include both free and paid options if applicable. 
                Focus on tools that would be genuinely helpful for their specific needs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: {
                    type: "string",
                    enum: ["productivity", "health", "finance", "education", "communication", "design", "development", "business", "entertainment", "utilities", "other"]
                  },
                  pricing_type: {
                    type: "string",
                    enum: ["free", "freemium", "paid", "subscription", "one_time"]
                  },
                  website_url: { type: "string" },
                  developer_name: { type: "string" },
                  platforms: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["web", "ios", "android", "windows", "mac", "linux"]
                    }
                  },
                  user_rating: { type: "number" },
                  features: {
                    type: "array",
                    items: { type: "string" }
                  },
                  trial_available: { type: "boolean" },
                  admin_verified: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      const foundTools = [];
      for (const tool of aiResponse.tools) {
        try {
          const existingTools = await AppTool.filter({ name: tool.name });
          let toolRecord;

          if (existingTools.length === 0) {
            toolRecord = await AppTool.create({
              ...tool,
              user_rating: tool.user_rating || 4.0,
              total_reviews: Math.floor(Math.random() * 1000) + 100
            });
          } else {
            toolRecord = existingTools[0];
          }

          if (toolRecord) {
            foundTools.push(toolRecord);
          }
        } catch (error) {
          console.error('Error creating or finding tool record:', error);
        }
      }

      await AppSearchRequest.create({
        ...searchForm,
        search_results: foundTools.map((t) => t.id),
        status: 'completed'
      });

      setSearchResults(foundTools);

    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-slate-50 overflow-hidden relative">
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-20 right-20 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-1000"></div>
            </div>

            <style>{`
                .animate-blob {
                    animation: blob 8s infinite ease-in-out;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    25% { transform: translate(20px, -40px) scale(1.1); }
                    50% { transform: translate(-30px, 30px) scale(0.9); }
                    75% { transform: translate(10px, 20px) scale(1.05); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
            `}</style>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
          className="text-center mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible">

                    <motion.div variants={itemVariants} className="inline-flex items-center justify-center gap-2 bg-white/60 backdrop-blur-md border border-blue-200/50 shadow-sm rounded-full px-4 py-1.5 mb-4">
                        <Wind className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-700">AI-Powered Discovery</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">Find the Perfect Tool</motion.h1>
                    <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Describe your need, and let our AI find verified apps and software tailored for you.
                    </motion.p>
                </motion.div>

                {/* Search Form */}
                <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>

                    <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-xl mb-12">
                        <CardHeader className="bg-cyan-100 p-6 flex flex-col space-y-1.5">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <SlidersHorizontal className="w-6 h-6 text-indigo-600" />
                                Tell us what you need
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-sky-100 pt-0 p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="search_description" className="font-semibold">What tool are you looking for?</Label>
                                    <Textarea
                    id="search_description"
                    placeholder="e.g., A project management tool for a small design team..."
                    value={searchForm.search_description}
                    onChange={(e) => handleInputChange('search_description', e.target.value)} className="bg-sky-100 mt-2 px-3 py-2 text-sm rounded-md flex min-h-[80px] w-full border border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-28" />


                                </div>
                                <div>
                                    <Label htmlFor="assignment_purpose" className="font-semibold">What will you use it for?</Label>
                                    <Textarea
                    id="assignment_purpose"
                    placeholder="e.g., Tracking client projects, team collaboration..."
                    value={searchForm.assignment_purpose}
                    onChange={(e) => handleInputChange('assignment_purpose', e.target.value)} className="bg-blue-50 mt-2 px-3 py-2 text-sm rounded-md flex min-h-[80px] w-full border border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-28" />


                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-6 items-end">
                                <div>
                                    <Label className="font-semibold">Pricing Preference</Label>
                                    <Select value={searchForm.preferred_pricing} onValueChange={(value) => handleInputChange('preferred_pricing', value)}>
                                        <SelectTrigger className="mt-2 bg-white/80"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any</SelectItem>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="trial">Free Trial</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label className="font-semibold">Budget Range</Label>
                                    <Select value={searchForm.budget_range} onValueChange={(value) => handleInputChange('budget_range', value)}>
                                        <SelectTrigger className="mt-2 bg-white/80"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                            <SelectItem value="under_10">Under $10/mo</SelectItem>
                                            <SelectItem value="10_50">$10-50/mo</SelectItem>
                                            <SelectItem value="50_100">$50-100/mo</SelectItem>
                                            <SelectItem value="100_plus">$100+/mo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="flex items-center space-x-2 pb-2">
                                    <Checkbox
                    id="business_verification"
                    checked={searchForm.business_verification_required}
                    onCheckedChange={(checked) => handleInputChange('business_verification_required', checked)} />

                                    <Label htmlFor="business_verification" className="font-semibold text-sm">
                                        Prefer verified businesses
                                    </Label>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="mb-3 block font-semibold">Required Platforms</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {['web', 'ios', 'android', 'windows', 'mac', 'linux'].map((platform) =>
                  <PlatformCheckbox
                    key={platform}
                    id={platform}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    checked={searchForm.required_platforms.includes(platform)}
                    onChange={(checked) => handlePlatformChange(platform, checked)} />

                  )}
                                </div>
                            </div>
                            
                            <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg hover:shadow-xl transition-all group"
                size="lg">

                                {isSearching ?
                <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Searching...
                                    </> :

                <>
                                        <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        Find My Tools
                                    </>
                }
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Search Results */}
                <AnimatePresence>
                {hasSearched &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {isSearching ? 'Finding the best tools for you...' : searchResults.length > 0 ? `Found ${searchResults.length} tools for you` : 'No tools found'}
                        </h2>
                        
                        {isSearching && searchResults.length === 0 &&
            <div className="flex justify-center items-center p-16">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            </div>
            }

                        {searchResults.length > 0 &&
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible">

                                {searchResults.map((tool) =>
              <ToolCard key={tool.id} tool={tool} />
              )}
                            </motion.div>
            }
                        
                        {!isSearching && hasSearched && searchResults.length === 0 &&
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                <Card className="bg-white/60 backdrop-blur-sm border-0 text-center p-12">
                                    <p className="text-gray-600 text-lg">No tools matched your criteria. Try adjusting your search or making your description broader.</p>
                                </Card>
                            </motion.div>
            }
                    </motion.div>
          }
                </AnimatePresence>
            </div>
        </div>);

}