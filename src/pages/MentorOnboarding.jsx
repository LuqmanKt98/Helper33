import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  User,
  FileText,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';


import { MentorProfile } from '@/entities/all';
import { UploadFile } from '@/integrations/Core';
import { User as UserEntity } from '@/entities/User';
import { createPageUrl } from '@/utils';
import CodeOfConduct from '@/components/mentor/CodeOfConduct';

const expertiseTypes = [
  { value: 'teacher', label: 'Teacher', icon: '👩‍🏫' },
  { value: 'therapist', label: 'Therapist', icon: '🧠' },
  { value: 'counselor', label: 'Counselor', icon: '💭' },
  { value: 'mentor', label: 'Mentor', icon: '🌟' },
  { value: 'tutor', label: 'Tutor', icon: '📚' },
  { value: 'special_educator', label: 'Special Educator', icon: '🎯' },
  { value: 'art_teacher', label: 'Art Teacher', icon: '🎨' },
  { value: 'music_teacher', label: 'Music Teacher', icon: '🎵' }
];

const focusAreas = [
  { value: 'early_learning', label: 'Early Learning', icon: '👶' },
  { value: 'wellness', label: 'Wellness & Mindfulness', icon: '🧘' },
  { value: 'emotional_support', label: 'Emotional Support', icon: '💝' },
  { value: 'arts', label: 'Arts & Creativity', icon: '🎨' },
  { value: 'special_needs', label: 'Special Needs', icon: '🤝' },
  { value: 'literacy', label: 'Literacy & Reading', icon: '📖' },
  { value: 'math', label: 'Mathematics', icon: '🔢' },
  { value: 'science', label: 'Science & Nature', icon: '🔬' },
  { value: 'creative_expression', label: 'Creative Expression', icon: '✨' },
  { value: 'mindfulness', label: 'Mindfulness & Calm', icon: '🌿' }
];

const credentialTypes = [
  { value: 'teaching_license', label: 'Teaching License' },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'school_id', label: 'School/Institution ID' },
  { value: 'therapy_license', label: 'Therapy/Counseling License' },
  { value: 'other', label: 'Other Credential' }
];

export default function MentorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    profile_picture_url: '',
    bio: '',
    expertise_type: '',
    focus_areas: [],
    years_experience: '',
    specializations: [],
    credentials: [],
    background_check_status: 'not_started',
    code_of_conduct_accepted: false,
    terms_accepted: false
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCredential, setUploadingCredential] = useState(false);
  const [newCredential, setNewCredential] = useState({
    type: '',
    credential_number: '',
    issuing_organization: '',
    expiry_date: ''
  });

  const steps = ['Profile', 'Credentials', 'Code of Conduct', 'Review'];
  const stepIcons = [User, FileText, Shield, CheckCircle];

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const loadUserAndProfile = async () => {
    setIsLoading(true);
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || '',
        email: userData.email || ''
      }));

      const profiles = await MentorProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        setExistingProfile(profiles[0]);
        setFormData(prev => ({
          ...prev,
          ...profiles[0],
          focus_areas: profiles[0].focus_areas || [],
          credentials: profiles[0].credentials || [],
          code_of_conduct_accepted: profiles[0].code_of_conduct_accepted || false,
          terms_accepted: profiles[0].terms_accepted || false,
        }));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture_url: result.file_url }));
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCredentialUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!newCredential.type) {
      alert("Please select a credential type first");
      return;
    }

    setUploadingCredential(true);
    try {
      const result = await UploadFile({ file });
      
      const credential = {
        ...newCredential,
        file_url: result.file_url
      };

      setFormData(prev => ({
        ...prev,
        credentials: [...prev.credentials, credential]
      }));

      setNewCredential({
        type: '',
        credential_number: '',
        issuing_organization: '',
        expiry_date: ''
      });
    } catch (error) {
      console.error("Error uploading credential:", error);
      alert("Failed to upload credential. Please try again.");
    } finally {
      setUploadingCredential(false);
    }
  };

  const handleToggleFocusArea = (area) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const handleCodeOfConductAccept = async () => {
    setIsSaving(true);
    try {
      if (!existingProfile) {
        alert("Please complete previous steps and save your profile before accepting agreements.");
        return;
      }

      const updatedFields = {
        code_of_conduct_accepted: true,
        code_of_conduct_accepted_at: new Date().toISOString(),
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      };

      await MentorProfile.update(existingProfile.id, updatedFields);
      
      setExistingProfile(prev => ({
        ...prev,
        ...updatedFields
      }));
      setFormData(prev => ({
        ...prev,
        ...updatedFields
      }));
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Error accepting code of conduct and terms:", error);
      alert("Failed to accept agreement. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (currentStep === 0) {
      if (!formData.full_name || !formData.email || !formData.expertise_type || !formData.bio) {
        alert("Please fill in all required fields");
        return;
      }
      if (formData.focus_areas.length === 0) {
        alert("Please select at least one focus area");
        return;
      }
    }

    if (currentStep === 1) {
      if (formData.credentials.length === 0) {
        alert("Please upload at least one credential");
        return;
      }
    }

    setIsSaving(true);
    try {
      const profileDataToSave = { ...formData };
      
      if (profileDataToSave.code_of_conduct_accepted && !profileDataToSave.code_of_conduct_accepted_at) {
        profileDataToSave.code_of_conduct_accepted_at = new Date().toISOString();
      }
      if (profileDataToSave.terms_accepted && !profileDataToSave.terms_accepted_at) {
        profileDataToSave.terms_accepted_at = new Date().toISOString();
      }

      if (existingProfile) {
        await MentorProfile.update(existingProfile.id, profileDataToSave);
      } else {
        const profile = await MentorProfile.create({
          ...profileDataToSave,
          verification_status: 'pending'
        });
        setExistingProfile(profile);
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error saving mentor profile:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingProfile && existingProfile.verification_status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">You're All Set!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your mentor profile has been verified and is active. You can now connect with families.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = createPageUrl('MentorDashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-gray-800">DobryLife Mentor Network</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mentor Onboarding</h1>
          <p className="text-lg text-gray-600">Join our compassionate community of educators and caregivers</p>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="flex justify-between">
              {steps.map((label, index) => {
                const Icon = stepIcons[index];
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center ${
                      currentStep >= index ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        currentStep >= index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {currentStep === 2 && (
            <motion.div
              key="code-of-conduct"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CodeOfConduct 
                onAccept={handleCodeOfConductAccept}
                isLoading={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep !== 2 && currentStep < steps.length - 1 && (
          <div className="flex gap-4 mt-6">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}