
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Briefcase,
  Upload,
  Star,
  Award,
  Users,
  DollarSign,
  Sparkles,
  Plus,
  X,
  Loader2,
  User,
  Clock,
  UserPlus, // Added UserPlus icon
  AlertCircle // Added AlertCircle icon
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { 
  sanitizeText, 
  validateURL, 
  validateFileUpload, 
  checkRateLimit,
  getCSRFToken 
} from '@/components/security/SecureInput';

export default function BecomeAConsultant() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    bio: '',
    expertise: [],
    years_of_experience: '',
    consultation_rate: '',
    profile_picture_url: '',
    video_introduction_url: '',
    portfolio_url: '',
    linkedin_url: '',
    website_url: '',
    accepting_clients: true
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [uploading, setUploading] = useState(false);
  const [csrfToken] = useState(() => getCSRFToken());

  // Security: Set CSRF token on mount
  useEffect(() => {
    // This call ensures the CSRF token is fetched and stored if it's not already,
    // and if the integration internally supports token refreshing/retrieval.
    // For react components, directly using the state initialized getCSRFToken() is fine.
    // If there's a scenario where the token might expire or need re-fetching client-side,
    // a more advanced mechanism would be needed.
    getCSRFToken(); 
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Check if user already has a consultant profile
  const { data: existingProfile, isLoading: checkingProfile } = useQuery({
    queryKey: ['myConsultantProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.ConsultantProfile.filter({
        created_by: user?.email
      });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Security: Rate limiting
      const rateLimitCheck = checkRateLimit('consultant_application', 2, 3600000); // 2 per hour
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many applications. Please wait ${Math.ceil(rateLimitCheck.retryAfter / 60)} minutes.`);
      }

      console.log('🚀 Creating consultant profile with data:', data);
      return await base44.entities.ConsultantProfile.create(data);
    },
    onSuccess: async (newProfile) => {
      console.log('✅ Profile created successfully:', newProfile);
      
      // Send email notification to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'contact@dobrylife.com',
          subject: '🎯 New Consultant Application Received',
          body: `
A new consultant application has been submitted!

Name: ${sanitizeText(formData.full_name)}
Email: ${user?.email}
Title: ${sanitizeText(formData.title)}
Expertise: ${formData.expertise.map(e => sanitizeText(e)).join(', ')}
Rate: $${formData.consultation_rate}/hour
Experience: ${formData.years_of_experience || 'Not specified'} years

Please review the application in the Admin Consultant Review panel.

Profile ID: ${newProfile.id}
          `
        });
        console.log('📧 Admin notification sent');
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }

      toast.success('🎉 Profile created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = createPageUrl('FindConsultants');
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Profile creation error:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    }
  });

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;
    
    // Security: Validate file
    const validation = validateFileUpload(file, {
      maxSizeMB: fieldName === 'video_introduction_url' ? 50 : 10,
      allowedTypes: fieldName === 'video_introduction_url' 
        ? ['video/mp4', 'video/quicktime', 'video/webm']
        : ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    });

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [fieldName]: file_url }));
      toast.success('File uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const addExpertise = () => {
    // Security: Sanitize and validate
    const sanitized = sanitizeText(newExpertise);
    
    if (!sanitized) {
      toast.error('Please enter a valid expertise area');
      return;
    }

    if (sanitized.length > 50) {
      toast.error('Expertise area too long (max 50 characters)');
      return;
    }

    if (formData.expertise.length >= 10) {
      toast.error('Maximum 10 expertise areas allowed');
      return;
    }

    if (formData.expertise.includes(sanitized)) {
      toast.error('This expertise area is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      expertise: [...prev.expertise, sanitized]
    }));
    setNewExpertise('');
  };

  const removeExpertise = (index) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Security: Comprehensive validation
    const sanitizedName = sanitizeText(formData.full_name);
    const sanitizedTitle = sanitizeText(formData.title);
    const sanitizedBio = sanitizeText(formData.bio);

    if (!sanitizedName || sanitizedName.length < 2) {
      toast.error('Please enter a valid full name');
      return;
    }

    if (!sanitizedTitle || sanitizedTitle.length < 5) {
      toast.error('Please enter a valid professional title');
      return;
    }

    if (!sanitizedBio || sanitizedBio.length < 100) {
      toast.error('Bio must be at least 100 characters');
      return;
    }

    if (formData.expertise.length === 0) {
      toast.error('Please add at least one area of expertise');
      return;
    }

    const rate = parseFloat(formData.consultation_rate);
    if (isNaN(rate) || rate <= 0 || rate > 10000) { // Added NaN check and upper bound
      toast.error('Please set a valid consultation rate (1-10000)');
      return;
    }

    // Security: Validate URLs if provided
    if (formData.portfolio_url && !validateURL(formData.portfolio_url)) {
      toast.error('Invalid portfolio URL');
      return;
    }

    if (formData.linkedin_url && !validateURL(formData.linkedin_url)) {
      toast.error('Invalid LinkedIn URL');
      return;
    }

    if (formData.website_url && !validateURL(formData.website_url)) {
      toast.error('Invalid website URL');
      return;
    }

    // Prepare sanitized data
    const submitData = {
      full_name: sanitizedName,
      title: sanitizedTitle,
      bio: sanitizedBio,
      expertise: formData.expertise.map(e => sanitizeText(e)),
      consultation_rate: rate,
      accepting_clients: true,
      verified_professional: false
    };

    // Add optional fields only if they have valid values
    if (formData.years_of_experience && formData.years_of_experience !== '') {
      const years = parseInt(formData.years_of_experience, 10);
      if (!isNaN(years) && years >= 0 && years <= 100) {
        submitData.years_of_experience = years;
      }
    }
    
    if (formData.profile_picture_url) {
      submitData.profile_picture_url = formData.profile_picture_url;
    }
    
    if (formData.video_introduction_url) {
      submitData.video_introduction_url = formData.video_introduction_url;
    }
    
    if (formData.portfolio_url && validateURL(formData.portfolio_url)) {
      submitData.portfolio_url = formData.portfolio_url;
    }
    
    if (formData.linkedin_url && validateURL(formData.linkedin_url)) {
      submitData.linkedin_url = formData.linkedin_url;
    }
    
    if (formData.website_url && validateURL(formData.website_url)) {
      submitData.website_url = formData.website_url;
    }

    console.log('📝 Submitting consultant profile:', submitData);
    createProfileMutation.mutate(submitData);
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Expertise', icon: Award },
    { number: 3, title: 'Media & Links', icon: Upload },
    { number: 4, title: 'Pricing', icon: DollarSign }
  ];

  // Loading state for checking existing profile
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  // Already has a profile - show status
  if (existingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="shadow-2xl border-4 border-purple-400">
            <CardContent className="py-12 px-8 text-center">
              {existingProfile.verified_professional ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">✅ Profile Approved!</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Your consultant profile is verified and active. You're ready to receive client inquiries!
                  </p>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('FindConsultants')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    View My Profile
                  </Button>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Clock className="w-12 h-12 text-amber-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">⏳ Application Under Review</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Your application has been submitted and is being reviewed by our team. We'll notify you within 2-3 business days.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Application ID:</strong> {existingProfile.id}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Submitted:</strong> {new Date(existingProfile.created_date).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = createPageUrl('FindConsultants')}
                    variant="outline"
                  >
                    Browse Other Consultants
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Briefcase className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            💼 Become a Consultant
          </h1>
          <p className="text-gray-600 text-lg">
            Join our network of expert consultants and make an impact
          </p>
        </motion.div>

        {/* Important Reminder Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-4 border-purple-400 shadow-2xl">
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white px-3 py-1">IMPORTANT</Badge>
                    Setup Checklist
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Create account:</strong> Sign up for Helper33 first (top right corner)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Complete all steps:</strong> Fill in basic info, expertise, media, and pricing</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Bio requirement:</strong> Write at least 100 characters about your expertise</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Add expertise:</strong> List at least one area you specialize in</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Approval time:</strong> Applications reviewed within 2-3 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        <Card className="mb-8 border-4 border-purple-300 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <React.Fragment key={step.number}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <motion.div
                        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all ${
                          isCompleted
                            ? 'bg-green-500 border-green-600'
                            : isActive
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-700'
                              : 'bg-gray-200 border-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </motion.div>
                      <p className={`text-xs sm:text-sm font-semibold text-center ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </motion.div>
                    {idx < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-white/90">
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Dr. Jane Smith"
                    maxLength={100}
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Professional Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="AI Strategy Consultant"
                    maxLength={100}
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Professional Bio * (Minimum 100 characters)
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Share your story, experience, and what makes you unique..."
                    maxLength={2000}
                    className="h-32 border-2 border-purple-300 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/2000 characters {formData.bio.length < 100 && <span className="text-amber-600">(Need {100 - formData.bio.length} more)</span>}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                    placeholder="10"
                    min="0"
                    max="100"
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Expertise */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Areas of Expertise * (At least 1 required)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                      placeholder="e.g., AI Strategy, Business Development"
                      maxLength={50}
                      className="flex-1 border-2 border-purple-300"
                    />
                    <Button
                      onClick={addExpertise}
                      type="button"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Badge className="bg-purple-100 text-purple-800 border-2 border-purple-300 px-3 py-2 text-sm">
                          {skill}
                          <button
                            onClick={() => removeExpertise(idx)}
                            className="ml-2 hover:text-red-600"
                            type="button"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  {formData.expertise.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ Please add at least one area of expertise
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Add specific expertise areas to help clients find you. Examples: "Grief Counseling", "AI Integration", "Career Transitions"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Media & Links */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.profile_picture_url ? (
                      <img
                        src={formData.profile_picture_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-300 shadow-lg">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'profile_picture_url')}
                        className="hidden"
                        id="profile-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="profile-upload">
                        <Button
                          type="button"
                          asChild
                          disabled={uploading}
                          className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Video Introduction (Optional)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'video_introduction_url')}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload">
                    <Button
                      type="button"
                      asChild
                      variant="outline"
                      disabled={uploading}
                      className="border-2 border-purple-300 hover:bg-purple-50 cursor-pointer"
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.video_introduction_url ? '✅ Video Uploaded' : 'Upload Video Intro'}
                      </span>
                    </Button>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Portfolio URL
                  </label>
                  <Input
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                    placeholder="https://myportfolio.com"
                    className="border-2 border-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    LinkedIn Profile
                  </label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="border-2 border-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Website
                  </label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="border-2 border-purple-300"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Consultation Rate (USD/hour) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.consultation_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, consultation_rate: e.target.value }))}
                      placeholder="150"
                      min="0"
                      max="10000"
                      className="pl-10 border-2 border-purple-300 focus:border-purple-500 text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Average rates: Entry-level $50-100, Mid-level $100-200, Expert $200+
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Preview Your Earnings
                  </h3>
                  {formData.consultation_rate > 0 ? (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>✅ 1 session/week: <strong className="text-green-700">${(formData.consultation_rate * 4).toFixed(0)}/month</strong></p>
                      <p>✅ 5 sessions/week: <strong className="text-green-700">${(formData.consultation_rate * 20).toFixed(0)}/month</strong></p>
                      <p>✅ 10 sessions/week: <strong className="text-green-700">${(formData.consultation_rate * 40).toFixed(0)}/month</strong></p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Enter your rate to see potential earnings</p>
                  )}
                </div>

                <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-300">
                  <h3 className="font-bold text-purple-900 mb-4 text-lg">📋 Application Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formData.full_name || '—'}</p>
                    <p><strong>Title:</strong> {formData.title || '—'}</p>
                    <p><strong>Expertise:</strong> {formData.expertise.length} area{formData.expertise.length !== 1 ? 's' : ''}</p>
                    <p><strong>Rate:</strong> ${formData.consultation_rate || '0'}/hour</p>
                    <p><strong>Profile Photo:</strong> {formData.profile_picture_url ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                    <p><strong>Video Intro:</strong> {formData.video_introduction_url ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
              {currentStep > 1 && (
                <Button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  variant="outline"
                  className="border-2 border-gray-300"
                >
                  ← Back
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  onClick={() => {
                    if (currentStep === 1 && (!formData.full_name || !formData.title || formData.bio.length < 100)) {
                      toast.error('Please complete all required fields and ensure bio is at least 100 characters.');
                      return;
                    }
                    if (currentStep === 2 && formData.expertise.length === 0) {
                      toast.error('Please add at least one area of expertise');
                      return;
                    }
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createProfileMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl py-6 text-lg"
                >
                  {createProfileMutation.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="w-6 h-6 text-blue-600" />
                Why Join Our Network?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Users, title: 'Reach More Clients', desc: 'Connect with people actively seeking expert guidance' },
                  { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Smart algorithms match you with ideal clients' },
                  { icon: DollarSign, title: 'Flexible Pricing', desc: 'Set your own rates and work on your terms' },
                  { icon: Award, title: 'Build Your Brand', desc: 'Showcase credentials and success stories' }
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md"
                    >
                      <Icon className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            🔒 All applications are manually reviewed • Your data is encrypted and secure
          </p>
        </motion.div>
      </div>
    </div>
  );
}
