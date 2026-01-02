import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, PlusCircle, Loader2, Users, Briefcase, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CaregiverCard from '@/components/care_hub/CaregiverCard';
import JobPostingCard from '@/components/care_hub/JobPostingCard';
import { motion } from 'framer-motion';

export default function FindCare() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const { data: caregivers = [], isLoading: loadingCaregivers } = useQuery({
    queryKey: ['caregivers'],
    queryFn: async () => {
      const data = await base44.entities.CaregiverProfile.filter({ status: 'active' });
      return data || [];
    }
  });

  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['jobPostings'],
    queryFn: async () => {
      const data = await base44.entities.JobPosting.filter({ status: 'open' });
      return data || [];
    }
  });

  const isLoading = loadingCaregivers || loadingJobs;

  const filteredCaregivers = caregivers.filter(c => {
    const matchesSearch = c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'all' || c.services?.includes(serviceFilter);
    return matchesSearch && matchesService;
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         j.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'all' || j.job_type === serviceFilter;
    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Users className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🏡 Home Services Marketplace
          </h1>
          <p className="text-lg text-gray-600">Find trusted providers or browse open job opportunities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Link to={createPageUrl('PostJob')} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl" size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Post a Job
            </Button>
          </Link>
          <Link to={createPageUrl('BecomeACaregiver')} className="flex-1">
            <Button variant="outline" className="w-full bg-white/50 border-2 border-cyan-300 hover:bg-cyan-50" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Become a Service Provider
            </Button>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-cyan-300 p-4 mb-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Search by name, keyword, or title..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-cyan-200"
                />
              </div>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="border-2 border-cyan-200">
                  <SelectValue placeholder="Filter by service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="nanny">Nanny</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="eldercare">Eldercare</SelectItem>
                  <SelectItem value="pet_care">Pet Care</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="handyman">Handyman</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="gardening">Gardening</SelectItem>
                  <SelectItem value="home_consultation">Home Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        <Tabs defaultValue="caregivers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-md">
            <TabsTrigger value="caregivers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Find Providers ({filteredCaregivers.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" /> Find Jobs ({filteredJobs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="caregivers">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-cyan-500" />
                </motion.div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaregivers.length > 0 ? (
                  filteredCaregivers.map((cg, idx) => (
                    <motion.div
                      key={cg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <CaregiverCard caregiver={cg} />
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3">
                    <Card className="border-2 border-dashed border-cyan-300">
                      <CardContent className="p-12 text-center">
                        <Users className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No providers found matching your criteria</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="jobs">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-cyan-500" />
                </motion.div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <JobPostingCard job={job} />
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3">
                    <Card className="border-2 border-dashed border-cyan-300">
                      <CardContent className="p-12 text-center">
                        <Briefcase className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No job postings found matching your criteria</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}