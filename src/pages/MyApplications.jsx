import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { JobApplication, JobPosting, User } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, MapPin, DollarSign, Loader2 } from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('my_applications');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Load applications I've submitted
        const myApplications = await JobApplication.filter({ created_by: currentUser.email }, '-created_date');
        
        // Load job details for each application
        const appsWithJobs = await Promise.all(
          myApplications.map(async (app) => {
            try {
              const job = await JobPosting.get(app.job_posting_id);
              return { ...app, job };
            } catch (error) {
              console.error('Error loading job for application:', error);
              return { ...app, job: null };
            }
          })
        );
        setApplications(appsWithJobs);

        // Load jobs I've posted with their applications
        const myJobs = await JobPosting.filter({ created_by: currentUser.email }, '-created_date');
        const jobsWithApps = await Promise.all(
          myJobs.map(async (job) => {
            const apps = await JobApplication.filter({ job_posting_id: job.id }, '-created_date');
            return { ...job, applications: apps };
          })
        );
        setJobsWithApplications(jobsWithApps);
      } catch (error) {
        console.error('Error loading applications:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Applications & Jobs</h1>
          <p className="text-gray-600">Manage your job applications and view applicants for your postings.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my_applications">
              <Briefcase className="w-4 h-4 mr-2" />
              My Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="my_jobs">
              Jobs I Posted ({jobsWithApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my_applications">
            {applications.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-4">Start applying to jobs to see them here.</p>
                  <Link to={createPageUrl('FindCare')}>
                    <Button>Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {applications.map((app) => (
                  <Card key={app.id} className="bg-white/60 backdrop-blur-sm border-0">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.job?.title || 'Job Title Unavailable'}</CardTitle>
                          <p className="text-sm text-gray-600">Applied on {new Date(app.created_date).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {app.job && (
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{app.job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span>${app.job.pay_rate}/hr</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{app.job.hours_per_week} hrs/week</span>
                            </div>
                          </div>
                        )}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
                          <p className="text-sm text-gray-600">{app.cover_message}</p>
                        </div>
                        {app.family_notes && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Family Notes:</p>
                            <p className="text-sm text-blue-800">{app.family_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my_jobs">
            {jobsWithApplications.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Job Postings Yet</h3>
                  <p className="text-gray-600 mb-4">Post a job to find great caregivers.</p>
                  <Link to={createPageUrl('PostJob')}>
                    <Button>Post a Job</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {jobsWithApplications.map((job) => (
                  <Card key={job.id} className="bg-white/60 backdrop-blur-sm border-0">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <p className="text-sm text-gray-600">Posted on {new Date(job.created_date).toLocaleDateString()}</p>
                        </div>
                        <Badge>{job.applications.length} applicants</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.applications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No applications yet</p>
                      ) : (
                        <div className="space-y-3">
                          {job.applications.map((app) => (
                            <div key={app.id} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-800">{app.caregiver_name}</p>
                                  <p className="text-sm text-gray-600">{app.caregiver_email}</p>
                                </div>
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{app.cover_message}</p>
                              <p className="text-xs text-gray-500 mt-2">Applied {new Date(app.created_date).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}