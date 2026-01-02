
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import {
    sanitizeText,
    checkRateLimit,
    getCSRFToken
} from '@/components/security/SecureInput';

export default function PostJob() {
    const navigate = useNavigate();
    const [job, setJob] = useState({
        title: "",
        job_type: "", // Changed initial state to empty string as per outline
        description: "",
        location: "",
        pay_rate: "",
        hours_per_week: "",
        status: 'open' // Added status field as per outline
    });
    const [csrfToken] = useState(() => getCSRFToken()); // New state for CSRF token

    // Security: Set CSRF token on mount
    useEffect(() => {
        getCSRFToken(); // Ensures the token is set (e.g., in headers for base44Client)
    }, []);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me()
    });

    const createJobMutation = useMutation({
        mutationFn: async (data) => {
            // Security: Rate limiting
            const rateLimitCheck = checkRateLimit('job_posting', 5, 3600000); // 5 postings per hour
            if (!rateLimitCheck.allowed) {
                // Throw an error that will be caught by onError
                throw new Error(`Too many job postings. Please wait ${Math.ceil(rateLimitCheck.retryAfter / 60000)} minutes.`);
            }

            return await base44.entities.JobPosting.create(data);
        },
        onSuccess: () => {
            toast.success('Job posted successfully!'); // Updated toast message
            navigate(createPageUrl('FindCare')); // Removed setTimeout
        },
        onError: (error) => {
            console.error("Failed to post job:", error); // Keep console error for debugging
            toast.error(error.message || 'Failed to post job'); // Updated toast message to use error.message
        }
    });

    const handleInputChange = (e) => { // Renamed from handleChange for clarity
        setJob({ ...job, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission

        // Security: Comprehensive validation and sanitization
        const sanitizedTitle = sanitizeText(job.title);
        const sanitizedDescription = sanitizeText(job.description);
        const sanitizedLocation = sanitizeText(job.location);

        if (!sanitizedTitle || sanitizedTitle.length < 10) {
            toast.error('Title must be at least 10 characters.');
            return;
        }

        if (sanitizedTitle.length > 200) {
            toast.error('Title is too long (max 200 characters).');
            return;
        }

        if (!job.job_type) {
            toast.error('Please select a service type.');
            return;
        }

        if (!sanitizedDescription || sanitizedDescription.length < 50) {
            toast.error('Description must be at least 50 characters.');
            return;
        }

        if (sanitizedDescription.length > 5000) {
            toast.error('Description is too long (max 5000 characters).');
            return;
        }

        // Validate pay rate
        const payRateValue = job.pay_rate ? parseFloat(job.pay_rate) : null;
        if (job.pay_rate && (isNaN(payRateValue) || payRateValue < 0 || payRateValue > 1000)) {
            toast.error('Invalid pay rate. Must be a number between 0 and 1000.');
            return;
        }

        // Validate hours per week
        const hoursValue = job.hours_per_week ? parseFloat(job.hours_per_week) : null;
        if (job.hours_per_week && (isNaN(hoursValue) || hoursValue < 0 || hoursValue > 168)) {
            toast.error('Invalid hours per week. Must be a number between 0 and 168.');
            return;
        }

        // Prepare sanitized data for submission
        const submitData = {
            title: sanitizedTitle,
            job_type: job.job_type,
            description: sanitizedDescription,
            status: 'open'
        };

        if (sanitizedLocation) submitData.location = sanitizedLocation;
        if (payRateValue !== null && payRateValue >= 0) submitData.pay_rate = payRateValue; // Include 0 if user enters it
        if (hoursValue !== null && hoursValue >= 0) submitData.hours_per_week = hoursValue; // Include 0 if user enters it

        createJobMutation.mutate(submitData);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
                    >
                        <Briefcase className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                        📢 Post a Job
                    </h1>
                    <p className="text-gray-600 text-lg">Describe your needs to find the perfect service provider</p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-4 border-blue-300 shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                            <CardTitle className="text-2xl">Job Details</CardTitle>
                        </CardHeader>
                        {/* Wrap form content in a <form> tag with onSubmit handler */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <Label htmlFor="title">Job Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={job.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Part-time Nanny for Toddler"
                                    className="border-2 border-blue-200"
                                />
                            </div>
                            <div>
                                <Label htmlFor="job_type">Service Type *</Label>
                                <Select
                                    name="job_type"
                                    value={job.job_type}
                                    onValueChange={value => setJob(j => ({...j, job_type: value}))}
                                >
                                    <SelectTrigger className="border-2 border-blue-200">
                                        <SelectValue placeholder="Select a service type" /> {/* Added placeholder */}
                                    </SelectTrigger>
                                    <SelectContent>
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
                            <div>
                                <Label htmlFor="description">Job Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={job.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the responsibilities, requirements, and any special considerations."
                                    className="h-32 border-2 border-blue-200"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">City, State</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={job.location}
                                        onChange={handleInputChange}
                                        className="border-2 border-blue-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pay_rate">Pay Rate ($/hour)</Label>
                                    <Input
                                        type="number"
                                        id="pay_rate"
                                        name="pay_rate"
                                        value={job.pay_rate}
                                        onChange={handleInputChange}
                                        className="border-2 border-blue-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="hours_per_week">Estimated Hours per Week</Label>
                                <Input
                                    type="number"
                                    id="hours_per_week"
                                    name="hours_per_week"
                                    value={job.hours_per_week}
                                    onChange={handleInputChange}
                                    className="border-2 border-blue-200"
                                />
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit" // Changed button type to submit
                                    disabled={createJobMutation.isLoading}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-2xl py-6 text-lg"
                                >
                                    {createJobMutation.isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Posting Job...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Post Job Listing
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
