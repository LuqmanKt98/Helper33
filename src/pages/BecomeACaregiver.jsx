import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Loader2, Upload, Sparkles, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  sanitizeText, 
  validateFileUpload, 
  checkRateLimit,
  getCSRFToken 
} from '@/components/security/SecureInput';

const servicesOptions = ["nanny", "housekeeping", "cleaning", "eldercare", "pet_care", "security", "handyman", "painting", "gardening", "home_consultation"];

export default function BecomeACaregiver() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [profile, setProfile] = useState({
        full_name: "",
        profile_picture_url: "",
        location: "",
        bio: "",
        hourly_rate: "",
        services: [],
        experience_years: "",
        availability: "part_time",
        portfolio_url: ""
    });
    const [uploading, setUploading] = useState(false);
    const [csrfToken] = useState(() => getCSRFToken());

    // Security: Set CSRF token on mount
    useEffect(() => {
        getCSRFToken();
    }, []);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me()
    });

    const { data: existingProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ['caregiverProfile'],
        queryFn: async () => {
            const profiles = await base44.entities.CaregiverProfile.filter({ 
                created_by: user?.email 
            });
            return profiles[0] || null;
        },
        enabled: !!user
    });

    const createProfileMutation = useMutation({
        mutationFn: async (data) => {
            // Security: Rate limiting
            const rateLimitCheck = checkRateLimit('caregiver_application', 2, 3600000); // 2 per hour
            if (!rateLimitCheck.allowed) {
                throw new Error(`Too many applications. Please wait ${Math.ceil(rateLimitCheck.retryAfter / 60)} minutes.`);
            }

            return await base44.entities.CaregiverProfile.create(data);
        },
        onSuccess: async (newProfile) => {
            await queryClient.invalidateQueries(['caregiverProfile']);
            await queryClient.invalidateQueries(['caregiverProfiles']); // Invalidate collection as well
            
            try {
                await base44.integrations.Core.SendEmail({
                    to: 'contact@dobrylife.com',
                    subject: '🤗 New Caregiver Application',
                    body: `
New caregiver application received!

Name: ${sanitizeText(profile.full_name)}
Email: ${user?.email}
Services: ${profile.services.join(', ')}
Location: ${sanitizeText(profile.location || 'Not specified')}

Profile ID: ${newProfile.id}
                    `
                });
            } catch (emailError) {
                console.error('Failed to send notification:', emailError);
            }

            toast.success('Profile created! Admin will review soon.');
            setTimeout(() => {
                window.location.href = createPageUrl('FindCare');
            }, 2000);
        },
        onError: (error) => {
            console.error('Failed to submit application:', error);
            toast.error(error.message || 'Failed to create profile');
        }
    });

    const handleProfilePictureUpload = async (file) => {
        if (!file) return;
        
        // Security: Validate file
        const validation = validateFileUpload(file, {
            maxSizeMB: 5,
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        });

        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setProfile(prev => ({ ...prev, profile_picture_url: file_url }));
            toast.success('Photo uploaded!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleServiceToggle = (service) => {
        setProfile(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : prev.services.length < 10 // Security: Limit to 10 services
                    ? [...prev.services, service]
                    : prev.services
        }));
        
        if (profile.services.length >= 10 && !profile.services.includes(service)) {
            toast.error('Maximum 10 services allowed');
        }
    };

    const handleSubmit = () => {
        // Security: Comprehensive validation
        const sanitizedName = sanitizeText(profile.full_name);
        const sanitizedBio = sanitizeText(profile.bio);
        const sanitizedLocation = sanitizeText(profile.location);

        if (!sanitizedName || sanitizedName.length < 2) {
            toast.error('Please enter a valid name (at least 2 characters)');
            return;
        }

        if (profile.services.length === 0) {
            toast.error('Select at least one service');
            return;
        }

        if (sanitizedBio && sanitizedBio.length > 1000) {
            toast.error('Bio too long (max 1000 characters)');
            return;
        }
        
        if (sanitizedLocation && sanitizedLocation.length < 3) {
            toast.error('Location is too short');
            return;
        }

        const rate = parseFloat(profile.hourly_rate);
        if (profile.hourly_rate && (isNaN(rate) || rate < 0 || rate > 1000)) {
            toast.error('Invalid hourly rate (must be a number between 0-1000)');
            return;
        }

        const exp = parseInt(profile.experience_years);
        if (profile.experience_years && (isNaN(exp) || exp < 0 || exp > 100)) {
            toast.error('Invalid years of experience (must be a number between 0-100)');
            return;
        }

        // Prepare sanitized data
        const submitData = {
            full_name: sanitizedName,
            services: profile.services,
            status: 'pending_admin_review',
            background_check_status: 'not_started'
        };

        if (sanitizedBio) submitData.bio = sanitizedBio;
        if (sanitizedLocation) submitData.location = sanitizedLocation;
        if (profile.profile_picture_url) submitData.profile_picture_url = profile.profile_picture_url;
        if (rate && rate > 0) submitData.hourly_rate = rate;
        if (exp && exp >= 0) submitData.experience_years = exp;
        if (profile.availability) submitData.availability = profile.availability;
        if (profile.portfolio_url) submitData.portfolio_url = sanitizeText(profile.portfolio_url);


        createProfileMutation.mutate(submitData);
    };

    if (loadingProfile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (existingProfile) {
        if (existingProfile.status === 'active') {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex items-center justify-center p-6">
                    <Card className="max-w-2xl shadow-2xl">
                        <CardContent className="py-12 px-8 text-center">
                            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Active!</h2>
                            <p className="text-lg text-gray-700 mb-6">
                                Your profile is live and visible to families. Welcome to the community!
                            </p>
                            <Button onClick={() => navigate(createPageUrl('FindCare'))} className="bg-cyan-600 hover:bg-cyan-700">
                                Browse Job Postings
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        if (existingProfile.status === 'rejected') {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                    <Card className="max-w-2xl shadow-2xl border-2 border-red-300">
                        <CardContent className="py-12 px-8 text-center">
                            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Not Approved</h2>
                            <p className="text-lg text-gray-700 mb-6">
                                Unfortunately, we were unable to approve your profile at this time.
                            </p>
                            <p className="text-gray-600">
                                Contact support: <a href="mailto:contact@dobrylife.com" className="text-blue-600 underline">contact@dobrylife.com</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // pending_admin_review or pending_verification
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full"
                >
                    <Card className="shadow-2xl border-4 border-blue-400">
                        <CardContent className="py-12 px-8 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Loader2 className="w-12 h-12 text-blue-600" />
                            </motion.div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h2>
                            <p className="text-lg text-gray-700 mb-6">
                                Thank you for applying! We'll review your application and reach out within 2-3 business days.
                            </p>
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    Questions? Contact us at <a href="mailto:contact@dobrylife.com" className="font-semibold underline">contact@dobrylife.com</a>
                                </p>
                            </div>
                            <Button onClick={() => navigate(createPageUrl('CareHub'))} variant="outline">
                                Return to Care Hub
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
                        🏡 Join Our Provider Network
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Create your profile to connect with families seeking your skills
                    </p>
                </motion.div>

                {/* Important Reminder Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-6 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-4 border-blue-400 shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 360]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="flex-shrink-0"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                        <UserPlus className="w-7 h-7 text-white" />
                                    </div>
                                </motion.div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Badge className="bg-blue-600 text-white px-3 py-1">IMPORTANT</Badge>
                                        Before You Start
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p><strong>Sign up first:</strong> Create a free Helper33 account if you haven't already (top right)</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p><strong>Fill all required fields:</strong> Name, location, bio, and at least one service</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <p><strong>Upload a photo:</strong> Profiles with photos get 3x more views</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p><strong>Review process:</strong> Applications are reviewed within 2-3 business days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Application Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-4 border-cyan-300 shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                            <CardTitle className="text-2xl">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input 
                                        id="full_name" 
                                        name="full_name" 
                                        value={profile.full_name} 
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        className="border-2 border-cyan-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location">City, State *</Label>
                                    <Input 
                                        id="location" 
                                        name="location" 
                                        value={profile.location} 
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className="border-2 border-cyan-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="bio">Your Bio *</Label>
                                <Textarea 
                                    id="bio" 
                                    name="bio" 
                                    value={profile.bio} 
                                    onChange={(e) => handleInputChange('bio', e.target.value)} 
                                    placeholder="Tell families a little about yourself..."
                                    className="h-24 border-2 border-cyan-200"
                                />
                            </div>
                            <div>
                                <Label>Profile Picture</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    {profile.profile_picture_url && (
                                        <img 
                                            src={profile.profile_picture_url} 
                                            alt="Profile" 
                                            className="w-20 h-20 rounded-full object-cover border-4 border-cyan-300"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleProfilePictureUpload(e.target.files[0])}
                                        className="hidden"
                                        id="photo-upload"
                                        disabled={uploading}
                                    />
                                    <label htmlFor="photo-upload">
                                        <Button
                                            type="button"
                                            asChild
                                            disabled={uploading}
                                            className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer"
                                        >
                                            <span>
                                                <Upload className="w-4 h-4 mr-2" />
                                                {uploading ? 'Uploading...' : 'Upload Photo'}
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-4 border-cyan-300 shadow-2xl">
                        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                            <CardTitle className="text-2xl">Services & Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Services You Offer *</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {servicesOptions.map(service => (
                                        <motion.label 
                                            key={service}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                profile.services.includes(service) 
                                                    ? 'bg-cyan-100 border-cyan-400 shadow-md' 
                                                    : 'bg-white/50 border-gray-200 hover:border-cyan-300'
                                            }`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={profile.services.includes(service)} 
                                                onChange={() => handleServiceToggle(service)} 
                                                className="form-checkbox text-cyan-600"
                                            />
                                            <span className="capitalize text-sm font-medium">{service.replace(/_/g, ' ')}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                                    <Input 
                                        type="number" 
                                        id="hourly_rate" 
                                        name="hourly_rate" 
                                        value={profile.hourly_rate} 
                                        onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                                        className="border-2 border-cyan-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="experience_years">Years of Experience</Label>
                                    <Input 
                                        type="number" 
                                        id="experience_years" 
                                        name="experience_years" 
                                        value={profile.experience_years} 
                                        onChange={(e) => handleInputChange('experience_years', e.target.value)}
                                        className="border-2 border-cyan-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="availability">Availability</Label>
                                <Select 
                                    name="availability" 
                                    value={profile.availability} 
                                    onValueChange={value => handleInputChange('availability', value)}
                                >
                                    <SelectTrigger className="border-2 border-cyan-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">Full-time</SelectItem>
                                        <SelectItem value="part_time">Part-time</SelectItem>
                                        <SelectItem value="weekends">Weekends</SelectItem>
                                        <SelectItem value="flexible">Flexible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="portfolio_url">Portfolio/Website Link (Optional)</Label>
                                <Input 
                                    id="portfolio_url" 
                                    name="portfolio_url" 
                                    value={profile.portfolio_url} 
                                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)} 
                                    placeholder="https://..."
                                    className="border-2 border-cyan-200"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button 
                            onClick={handleSubmit} 
                            disabled={createProfileMutation.isLoading} 
                            size="lg" 
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-2xl py-6 text-lg"
                        >
                            {createProfileMutation.isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Submit Application
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}