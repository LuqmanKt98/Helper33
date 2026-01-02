
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Save, Plus, X, MapPin, GraduationCap, Award } from 'lucide-react';
import { toast } from 'sonner';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function ProfileEditor({ profile }) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    title: profile.title || '',
    bio: profile.bio || '',
    specializations: profile.specializations || [],
    services_offered: profile.services_offered || [], // Kept from original
    license_type: profile.license_type || '',
    license_number: profile.license_number || '',
    licensed_states: profile.licensed_states || [],
    license_verification_url: profile.license_verification_url || '',
    years_of_experience: profile.years_of_experience || 0,
    education: profile.education || [], // NEW
    certifications: profile.certifications || [], // Existing, now with UI
    treatment_approaches: profile.treatment_approaches || [], // Existing, now with UI
    age_groups_served: profile.age_groups_served || [], // Existing, now with UI
    linkedin_url: profile.linkedin_url || '',
    facebook_url: profile.facebook_url || '',
    instagram_url: profile.instagram_url || '',
    website_url: profile.website_url || '',
    contact_email: profile.contact_email || '',
    contact_phone: profile.contact_phone || '',
    office_address: profile.office_address || '',
    accepts_telehealth: profile.accepts_telehealth ?? true,
    accepts_in_person: profile.accepts_in_person ?? false,
    session_rate: profile.session_rate || '',
    availability: profile.availability || '', // Kept from original
    languages_spoken: profile.languages_spoken || [],
    insurance_accepted: profile.insurance_accepted || []
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newTreatmentApproach, setNewTreatmentApproach] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newState, setNewState] = useState('');
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' }); // NEW

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.PractitionerProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['practitionerProfile']);
      toast.success('Profile updated successfully! ✨');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addToArray = (field, value, setterFn) => {
    if (value.trim()) {
      // The outline removes the uniqueness check, allowing duplicates.
      // For select inputs (licensed_states, age_groups_served), uniqueness is handled by filtering options.
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setterFn('');
    }
  };

  const addEducation = () => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, year: parseInt(newEducation.year) || null }]
      }));
      setNewEducation({ degree: '', institution: '', year: '' });
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Edit Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="border-2 border-purple-300"
                  required
                />
              </div>
              <div>
                <Label>Professional Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Licensed Clinical Psychologist"
                  className="border-2 border-purple-300"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell clients about yourself, your approach, and what makes you unique..."
                rows={6}
                className="border-2 border-purple-300"
              />
            </div>

            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Credentials</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>License Type *</Label>
                  <Input
                    value={formData.license_type}
                    onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                    placeholder="e.g., LCSW, PhD, MD"
                    className="border-2 border-purple-300"
                    required
                  />
                </div>
                <div>
                  <Label>License Number *</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className="border-2 border-purple-300"
                    required
                  />
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
                    className="border-2 border-purple-300"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  States Licensed to Practice *
                </Label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select a state...</option>
                    {US_STATES.filter(s => !formData.licensed_states.includes(s)).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => addToArray('licensed_states', newState, setNewState)}
                    disabled={!newState}
                    className="bg-purple-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.licensed_states.map((state, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      {state}
                      <button
                        type="button"
                        onClick={() => removeFromArray('licensed_states', idx)}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Label>License Verification URL</Label>
                <Input
                  value={formData.license_verification_url}
                  onChange={(e) => setFormData({...formData, license_verification_url: e.target.value})}
                  placeholder="https://..."
                  className="border-2 border-purple-300"
                />
              </div>
            </div>

            {/* NEW Education Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Input
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  placeholder="Degree (e.g., PhD)"
                  className="border-2 border-purple-300"
                />
                <Input
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                  placeholder="Institution"
                  className="border-2 border-purple-300"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                    placeholder="Year"
                    className="border-2 border-purple-300 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addEducation}
                    disabled={!newEducation.degree.trim() || !newEducation.institution.trim()}
                    className="bg-purple-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.year && <p className="text-xs text-gray-500">{edu.year}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromArray('education', idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW Certifications Section (existing data field, new UI) */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Certifications
              </h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification"
                  className="border-2 border-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('certifications', newCertification, setNewCertification);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('certifications', newCertification, setNewCertification)}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-700">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeFromArray('certifications', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* NEW Treatment Approaches Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Treatment Approaches</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newTreatmentApproach}
                  onChange={(e) => setNewTreatmentApproach(e.target.value)}
                  placeholder="e.g., CBT, DBT, EMDR"
                  className="border-2 border-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('treatment_approaches', newTreatmentApproach, setNewTreatmentApproach);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('treatment_approaches', newTreatmentApproach, setNewTreatmentApproach)}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.treatment_approaches.map((approach, idx) => (
                  <Badge key={idx} className="bg-indigo-100 text-indigo-700">
                    {approach}
                    <button
                      type="button"
                      onClick={() => removeFromArray('treatment_approaches', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* NEW Age Groups Served Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Age Groups Served</h3>
              <div className="flex gap-2 mb-3">
                <select
                  value={newAgeGroup}
                  onChange={(e) => setNewAgeGroup(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select age group...</option>
                  {['Children (5-12)', 'Teens (13-17)', 'Young Adults (18-25)', 'Adults (26-64)', 'Seniors (65+)'].filter(g => !formData.age_groups_served.includes(g)).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => addToArray('age_groups_served', newAgeGroup, setNewAgeGroup)}
                  disabled={!newAgeGroup}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.age_groups_served.map((group, idx) => (
                  <Badge key={idx} className="bg-pink-100 text-pink-700">
                    {group}
                    <button
                      type="button"
                      onClick={() => removeFromArray('age_groups_served', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Existing Specializations Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Specializations</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add a specialization"
                  className="border-2 border-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('specializations', newSpecialization, setNewSpecialization);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('specializations', newSpecialization, setNewSpecialization)}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-700">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeFromArray('specializations', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Existing Languages Spoken Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Languages Spoken</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  className="border-2 border-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('languages_spoken', newLanguage, setNewLanguage);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('languages_spoken', newLanguage, setNewLanguage)}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages_spoken.map((lang, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-700">
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeFromArray('languages_spoken', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Existing Insurance Accepted Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Insurance Accepted</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newInsurance}
                  onChange={(e) => setNewInsurance(e.target.value)}
                  placeholder="Add insurance provider"
                  className="border-2 border-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('insurance_accepted', newInsurance, setNewInsurance);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addToArray('insurance_accepted', newInsurance, setNewInsurance)}
                  className="bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.insurance_accepted.map((ins, idx) => (
                  <Badge key={idx} variant="outline">
                    {ins}
                    <button
                      type="button"
                      onClick={() => removeFromArray('insurance_accepted', idx)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Existing Session Information Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Session Information</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.accepts_telehealth}
                    onChange={(e) => setFormData({...formData, accepts_telehealth: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label>Accept Telehealth</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.accepts_in_person}
                    onChange={(e) => setFormData({...formData, accepts_in_person: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label>Accept In-Person</Label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Session Rate (USD)</Label>
                  <Input
                    type="number"
                    value={formData.session_rate}
                    onChange={(e) => setFormData({...formData, session_rate: parseFloat(e.target.value) || ''})}
                    placeholder="150"
                    className="border-2 border-purple-300"
                  />
                </div>
              </div>
            </div>

            {/* Existing Contact Information Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="border-2 border-purple-300"
                    required
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="border-2 border-purple-300"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>Office Address</Label>
                <Input
                  value={formData.office_address}
                  onChange={(e) => setFormData({...formData, office_address: e.target.value})}
                  className="border-2 border-purple-300"
                />
              </div>
            </div>

            {/* Existing Social Media & Website Section */}
            <div className="border-t border-purple-200 pt-6">
              <h3 className="font-semibold text-lg mb-4">Social Media & Website</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>LinkedIn URL *</Label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                    className="border-2 border-purple-300"
                    required
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://..."
                    className="border-2 border-purple-300"
                  />
                </div>
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/..."
                    className="border-2 border-purple-300"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/..."
                    className="border-2 border-purple-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
