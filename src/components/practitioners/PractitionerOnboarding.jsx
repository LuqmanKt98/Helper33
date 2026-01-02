
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Calendar,
  Bell,
  Sparkles,
  Upload,
  CheckCircle2,
  MapPin,
  Plus,
  X,
  UserPlus, // Added
  AlertCircle // Added
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const steps = [
  { id: 1, name: 'Profile Info', icon: User, description: 'Basic information' },
  { id: 2, name: 'Credentials', icon: Briefcase, description: 'License & experience' },
  { id: 3, name: 'Services', icon: Sparkles, description: 'What you offer' },
  { id: 4, name: 'Availability', icon: Calendar, description: 'Set your schedule' },
  { id: 5, name: 'Notifications', icon: Bell, description: 'Communication preferences' }
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function PractitionerOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    profile_photo_url: '',
    title: '',
    bio: '',
    contact_email: '',
    contact_phone: '',

    license_type: '',
    license_number: '',
    licensed_states: [],
    years_of_experience: '',

    specializations: [],
    services_offered: [],
    session_rate: '',
    accepts_telehealth: true,
    accepts_in_person: false,

    scheduling_link: '',

    send_confirmation_emails: true,
    send_reminder_emails: true,
    accept_new_clients: true
  });

  const [tempInputs, setTempInputs] = useState({
    specialization: '',
    service: '',
    state: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      const inputKey = field === 'licensed_states' ? 'state' : field.slice(0, -1);
      setTempInputs(prev => ({ ...prev, [inputKey]: '' }));
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      handleChange('profile_photo_url', data.file_url);
      toast.success('Photo uploaded! 📸');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name && formData.title && formData.bio && formData.contact_email;
      case 2:
        return formData.license_type && formData.license_number && formData.licensed_states.length > 0;
      case 3:
        return formData.specializations.length > 0 && formData.session_rate;
      case 4:
        return formData.scheduling_link;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error('Please complete all required fields');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profileData = {
        full_name: formData.full_name,
        profile_photo_url: formData.profile_photo_url,
        title: formData.title,
        bio: formData.bio,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        license_type: formData.license_type,
        license_number: formData.license_number,
        licensed_states: formData.licensed_states,
        years_of_experience: parseFloat(formData.years_of_experience) || 0,
        specializations: formData.specializations,
        services_offered: formData.services_offered,
        session_rate: parseFloat(formData.session_rate) || 0,
        accepts_telehealth: formData.accepts_telehealth,
        accepts_in_person: formData.accepts_in_person,
        scheduling_link: formData.scheduling_link,
        practitioner_settings: {
          send_confirmation_emails: formData.send_confirmation_emails,
          send_reminder_emails: formData.send_reminder_emails,
          accept_new_clients: formData.accept_new_clients
        }
      };

      await base44.entities.PractitionerProfile.create(profileData);

      toast.success('Application submitted! 🎉');

      if (onComplete) {
        onComplete();
      } else {
        window.location.href = createPageUrl('PractitionerDashboard');
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Important Reminder Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-4 border-purple-400 shadow-2xl">
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
                    Application Requirements
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Account required:</strong> Sign up for Helper33 first (top right button)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Valid license:</strong> Must have current mental health license in at least one US state</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Scheduling link:</strong> Calendly, Google Calendar, or any booking platform link</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Complete all 5 steps:</strong> Each step must be filled out to submit</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p><strong>Review time:</strong> Credential verification takes 24-48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
                          : isCurrent
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg animate-pulse'
                          : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className={`text-xs font-semibold ${isCurrent ? 'text-purple-700' : 'text-gray-600'}`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(steps[currentStep - 1].icon, { className: "w-6 h-6 text-purple-600" })}
                  Step {currentStep}: {steps[currentStep - 1].name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Profile Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden border-4 border-purple-300">
                        {formData.profile_photo_url ? (
                          <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-purple-400" />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <Button variant="outline" disabled={uploading} asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                          </span>
                        </Button>
                        <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name *</label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="border-2 border-purple-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Professional Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Licensed Clinical Psychologist"
                        className="border-2 border-purple-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Bio *</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="Tell clients about your approach and experience..."
                        rows={4}
                        className="border-2 border-purple-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleChange('contact_email', e.target.value)}
                          placeholder="contact@example.com"
                          className="border-2 border-purple-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <Input
                          value={formData.contact_phone}
                          onChange={(e) => handleChange('contact_phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="border-2 border-purple-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Credentials with Multiple States */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>💡 Verification:</strong> Your credentials will be reviewed by our admin team to ensure quality and safety.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">License Type *</label>
                        <Input
                          value={formData.license_type}
                          onChange={(e) => handleChange('license_type', e.target.value)}
                          placeholder="LCSW, PhD, MD, etc."
                          className="border-2 border-purple-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">License Number *</label>
                        <Input
                          value={formData.license_number}
                          onChange={(e) => handleChange('license_number', e.target.value)}
                          placeholder="12345678"
                          className="border-2 border-purple-300"
                        />
                      </div>
                    </div>

                    {/* New field for multiple licensed states */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        States Licensed to Practice * (Add all states where you hold a valid license)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={tempInputs.state}
                          onChange={(e) => setTempInputs(prev => ({ ...prev, state: e.target.value }))}
                          className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="">Select a state...</option>
                          {US_STATES.filter(s => !formData.licensed_states.includes(s)).map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          onClick={() => addToArray('licensed_states', tempInputs.state)}
                          disabled={!tempInputs.state}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.licensed_states.map((state, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700 text-sm py-1.5 px-3">
                            <MapPin className="w-3 h-3 mr-1" />
                            {state}
                            <button
                              type="button"
                              onClick={() => removeFromArray('licensed_states', idx)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {formData.licensed_states.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2">⚠️ You must add at least one state to continue</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Years of Experience</label>
                      <Input
                        type="number"
                        value={formData.years_of_experience}
                        onChange={(e) => handleChange('years_of_experience', e.target.value)}
                        placeholder="5"
                        className="border-2 border-purple-300"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Services */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Specializations *</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={tempInputs.specialization}
                          onChange={(e) => setTempInputs(prev => ({ ...prev, specialization: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specializations', tempInputs.specialization))}
                          placeholder="e.g., Anxiety, Depression"
                          className="border-2 border-purple-300"
                        />
                        <Button onClick={() => addToArray('specializations', tempInputs.specialization)}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.specializations.map((spec, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700">
                            {spec}
                            <button onClick={() => removeFromArray('specializations', idx)} className="ml-2">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Services Offered</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={tempInputs.service}
                          onChange={(e) => setTempInputs(prev => ({ ...prev, service: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('services_offered', tempInputs.service))}
                          placeholder="e.g., Individual Therapy"
                          className="border-2 border-purple-300"
                        />
                        <Button onClick={() => addToArray('services_offered', tempInputs.service)}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.services_offered.map((service, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700">
                            {service}
                            <button onClick={() => removeFromArray('services_offered', idx)} className="ml-2">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Session Rate (USD) *</label>
                      <Input
                        type="number"
                        value={formData.session_rate}
                        onChange={(e) => handleChange('session_rate', e.target.value)}
                        placeholder="150"
                        className="border-2 border-purple-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <label className="text-sm font-semibold">Accept Telehealth Clients</label>
                        <Switch
                          checked={formData.accepts_telehealth}
                          onCheckedChange={(val) => handleChange('accepts_telehealth', val)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <label className="text-sm font-semibold">Accept In-Person Clients</label>
                        <Switch
                          checked={formData.accepts_in_person}
                          onCheckedChange={(val) => handleChange('accepts_in_person', val)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Availability - Now with Coming Soon */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>📅 Booking Setup:</strong> Add your scheduling link so clients can book appointments with you.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        🔗 Custom Scheduling Link *
                      </label>
                      <Input
                        value={formData.scheduling_link}
                        onChange={(e) => handleChange('scheduling_link', e.target.value)}
                        placeholder="https://calendly.com/your-link or your Zoom/Google Calendar link"
                        className="border-2 border-purple-300"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Add your Calendly, Google Calendar, Zoom, or any booking link. Clients will use this to schedule appointments.
                      </p>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 mt-6">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          <Sparkles className="w-12 h-12 text-amber-500 flex-shrink-0" />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2">
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm mr-2">COMING SOON</span>
                            Manual Availability Setting
                          </h3>
                          <p className="text-sm text-gray-700 mb-3">
                            We're building an in-app booking system where you can set your weekly hours directly in Helper33, without needing an external link!
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• Set custom working hours for each day</li>
                            <li>• Define session duration and break times</li>
                            <li>• Automatic slot generation for clients</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Notifications */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>🔔 Automation Settings:</strong> Enable notifications to provide the best experience for your clients.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <div>
                          <p className="font-semibold text-gray-800">Confirmation Emails</p>
                          <p className="text-sm text-gray-600">Auto-send when you confirm appointments</p>
                        </div>
                        <Switch
                          checked={formData.send_confirmation_emails}
                          onCheckedChange={(val) => handleChange('send_confirmation_emails', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div>
                          <p className="font-semibold text-gray-800">24-Hour Reminders</p>
                          <p className="text-sm text-gray-600">Auto-send reminder emails</p>
                        </div>
                        <Switch
                          checked={formData.send_reminder_emails}
                          onCheckedChange={(val) => handleChange('send_reminder_emails', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <div>
                          <p className="font-semibold text-gray-800">Accept New Clients</p>
                          <p className="text-sm text-gray-600">Allow new bookings</p>
                        </div>
                        <Switch
                          checked={formData.accept_new_clients}
                          onCheckedChange={(val) => handleChange('accept_new_clients', val)}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 text-center mt-6">
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">You're All Set!</h3>
                      <p className="text-gray-700 mb-4">
                        Review your information and submit your application. Our team will review it within 24-48 hours.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-2 border-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !validateStep()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
