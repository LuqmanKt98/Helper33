
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { MapPin, Award, Star, Phone, Mail, Globe, Video, Briefcase, GraduationCap, Shield, Users, Heart,
  Sparkles, ExternalLink, Linkedin, Facebook, Instagram, Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import PractitionerMatchSurvey from '@/components/practitioners/PractitionerMatchSurvey';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function FindPractitioners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showSurvey, setShowSurvey] = useState(false);
  const [matchedIds, setMatchedIds] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [minRating, setMinRating] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Check if user has location set and hasn't dismissed the prompt
  useEffect(() => {
    if (user && user.id && !user.location_state && !localStorage.getItem('locationPromptDismissed')) {
      setShowLocationPrompt(true);
    } else if (user?.location_state) {
      setSelectedState(user.location_state);
    }
  }, [user]);

  const updateUserLocation = async (state) => {
    try {
      if (user && user.id) { // User is logged in, update their profile
        await base44.auth.updateMe({ location_state: state });
        toast.success(`Location set to ${state} ✅`);
      } else { // User is not logged in, just apply filter locally
        toast.info('Location set locally. Log in to save it permanently.');
      }
      setSelectedState(state);
      setShowLocationPrompt(false);
      localStorage.setItem('locationPromptDismissed', 'true'); // Dismiss the prompt after action
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => base44.entities.PractitionerProfile.filter({ status: 'approved' }, '-featured'),
    initialData: []
  });

  const filteredPractitioners = practitioners
    .filter(p => {
      const matchesSearch = !searchTerm ||
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSpecialization = selectedSpecialization === 'all' ||
        p.specializations?.includes(selectedSpecialization);

      const matchesSurvey = matchedIds.length === 0 || matchedIds.includes(p.id);

      const matchesRating = (p.average_rating || 0) >= minRating;

      const matchesLocation = !selectedState || (p.licensed_states && p.licensed_states.includes(selectedState));

      return matchesSearch && matchesSpecialization && matchesSurvey && matchesRating && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.average_rating || 0) - (a.average_rating || 0);
      if (sortBy === 'reviews') return (b.total_reviews || 0) - (a.total_reviews || 0);
      if (sortBy === 'experience') return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  const allSpecializations = [...new Set(practitioners.flatMap(p => p.specializations || []))];

  return (
    <>
      <SEO
        title="Find Licensed Practitioners | Helper33"
        description="Connect with verified, licensed mental health professionals, therapists, and wellness practitioners. Telehealth and in-person options available."
        keywords="licensed therapist, mental health professional, counselor, psychologist, telehealth, therapy"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full border-2 border-purple-300 mb-4 shadow-xl"
            >
              <Heart className="w-6 h-6 text-purple-600" />
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Licensed Practitioners Hub
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Connect with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Licensed Professionals</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Find verified, licensed mental health professionals, therapists, and wellness practitioners. All credentials verified for your safety.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setShowSurvey(!showSurvey)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Take Matching Survey
              </Button>
              <Link to={createPageUrl('BecomePractitioner')}>
                <Button variant="outline" className="border-2 border-purple-300 hover:bg-purple-50">
                  <Award className="w-4 h-4 mr-2" />
                  Apply as Practitioner
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Location Prompt */}
          {showLocationPrompt && (user && user.id) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">Set Your Location</h3>
                      <p className="text-gray-700 mb-4">
                        To ensure practitioners are licensed in your state, please select your location. This helps us filter for relevant professionals.
                      </p>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                          >
                            <option value="">Select your state...</option>
                            {US_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <Button
                          onClick={() => updateUserLocation(selectedState)}
                          disabled={!selectedState}
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          Save Location
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowLocationPrompt(false);
                            localStorage.setItem('locationPromptDismissed', 'true');
                            toast.info('Location prompt dismissed for now.');
                          }}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showSurvey && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <PractitionerMatchSurvey
                practitioners={practitioners}
                onMatch={(ids) => {
                  setMatchedIds(ids);
                  setShowSurvey(false);
                  toast.success(`Found ${ids.length} matching practitioners! 🎯`);
                }}
              />
            </motion.div>
          )}

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 mb-6 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, specialization, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-2 border-purple-300 focus:border-purple-500"
                  />
                </div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All States</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Specializations</option>
                  {allSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border-2 border-purple-300 rounded-lg text-sm"
                  >
                    <option value="featured">Featured First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="experience">Most Experience</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">Min Rating:</span>
                  <div className="flex gap-1">
                    {[0, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                          minRating === rating
                            ? 'bg-amber-100 border-amber-400 text-amber-700'
                            : 'border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        {rating === 0 ? 'All' : `${rating}+ ⭐`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedState && (
                <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                  <Badge className="bg-blue-100 text-blue-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    Showing practitioners licensed in {selectedState}
                  </Badge>
                </div>
              )}

              {matchedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Showing {filteredPractitioners.length} matched practitioner{filteredPractitioners.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMatchedIds([])}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPractitioners.map((practitioner, idx) => (
              <PractitionerCard key={practitioner.id} practitioner={practitioner} index={idx} />
            ))}
          </div>

          {filteredPractitioners.length === 0 && (
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">No practitioners found</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {selectedState
                    ? `No practitioners found licensed in ${selectedState}. Try a different state or clear filters.`
                    : 'Try adjusting your search or take the matching survey'}
                </p>
                <div className="flex gap-2 justify-center">
                  {selectedState && (
                    <Button
                      onClick={() => setSelectedState('')}
                      variant="outline"
                    >
                      Clear Location Filter
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowSurvey(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Take Matching Survey
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function PractitionerCard({ practitioner, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-2xl transition-all h-full flex flex-col">
        <CardHeader className="relative pb-2">
          {practitioner.featured && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}

          <div className="flex items-start gap-4 mb-4">
            {practitioner.profile_photo_url ? (
              <img
                src={practitioner.profile_photo_url}
                alt={practitioner.full_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-4 border-purple-200 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{practitioner.full_name}</h3>
              <p className="text-sm text-purple-700 font-semibold mb-2">{practitioner.title}</p>
              <div className="flex items-center gap-1 text-xs mb-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-semibold">{practitioner.license_type}</span>
                {practitioner.license_verification_url && (
                  <a href={practitioner.license_verification_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 text-blue-600 ml-1" />
                  </a>
                )}
              </div>
              {practitioner.licensed_states && practitioner.licensed_states.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {practitioner.licensed_states.slice(0, 2).map((state, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-blue-300 text-blue-700">
                      <MapPin className="w-2 h-2 mr-1" />
                      {state}
                    </Badge>
                  ))}
                  {practitioner.licensed_states.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{practitioner.licensed_states.length - 2}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {practitioner.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${n <= practitioner.average_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-sm text-gray-600">({practitioner.total_reviews} reviews)</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{practitioner.bio}</p>

          <div className="space-y-3 mb-4">
            {practitioner.specializations && practitioner.specializations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {practitioner.specializations.slice(0, 3).map((spec, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">{spec}</Badge>
                  ))}
                  {practitioner.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{practitioner.specializations.length - 3}</Badge>
                  )}
                </div>
              </div>
            )}

            {practitioner.education && practitioner.education.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Education:
                </p>
                <div className="text-xs text-gray-600">
                  {practitioner.education[0].degree} - {practitioner.education[0].institution}
                  {practitioner.education.length > 1 && ` (+${practitioner.education.length - 1} more)`}
                </div>
              </div>
            )}

            {practitioner.certifications && practitioner.certifications.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Certifications:
                </p>
                <div className="flex flex-wrap gap-1">
                  {practitioner.certifications.slice(0, 2).map((cert, i) => (
                    <Badge key={i} className="bg-green-100 text-green-700 text-xs">{cert}</Badge>
                  ))}
                  {practitioner.certifications.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{practitioner.certifications.length - 2}</Badge>
                  )}
                </div>
              </div>
            )}

            {practitioner.treatment_approaches && practitioner.treatment_approaches.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Approaches:</p>
                <div className="flex flex-wrap gap-1">
                  {practitioner.treatment_approaches.slice(0, 3).map((approach, i) => (
                    <Badge key={i} className="bg-indigo-100 text-indigo-700 text-xs">{approach}</Badge>
                  ))}
                  {practitioner.treatment_approaches.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{practitioner.treatment_approaches.length - 3}</Badge>
                  )}
                </div>
              </div>
            )}

            {practitioner.age_groups_served && practitioner.age_groups_served.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Age Groups:</p>
                <div className="flex flex-wrap gap-1">
                  {practitioner.age_groups_served.map((group, i) => (
                    <Badge key={i} className="bg-pink-100 text-pink-700 text-xs">{group}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {practitioner.years_of_experience} years
              </div>
              {practitioner.languages_spoken && practitioner.languages_spoken.length > 0 && (
                <div className="flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {practitioner.languages_spoken[0]}
                  {practitioner.languages_spoken.length > 1 && ` +${practitioner.languages_spoken.length - 1}`}
                </div>
              )}
            </div>

            {(practitioner.accepts_telehealth || practitioner.accepts_in_person) && (
              <div className="flex gap-2">
                {practitioner.accepts_telehealth && (
                  <Badge variant="outline" className="text-xs border-blue-300">
                    <Video className="w-3 h-3 mr-1" />
                    Telehealth
                  </Badge>
                )}
                {practitioner.accepts_in_person && (
                  <Badge variant="outline" className="text-xs border-green-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    In-Person
                  </Badge>
                )}
              </div>
            )}

            {practitioner.insurance_accepted && practitioner.insurance_accepted.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Insurance:</p>
                <div className="flex flex-wrap gap-1">
                  {practitioner.insurance_accepted.slice(0, 2).map((ins, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{ins}</Badge>
                  ))}
                  {practitioner.insurance_accepted.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{practitioner.insurance_accepted.length - 2}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap gap-2">
              {practitioner.linkedin_url && (
                <a href={practitioner.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <Linkedin className="w-3 h-3 text-blue-600" />
                  </Button>
                </a>
              )}
              {practitioner.facebook_url && (
                <a href={practitioner.facebook_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <Facebook className="w-3 h-3 text-blue-700" />
                  </Button>
                </a>
              )}
              {practitioner.instagram_url && (
                <a href={practitioner.instagram_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <Instagram className="w-3 h-3 text-pink-600" />
                  </Button>
                </a>
              )}
              {practitioner.website_url && (
                <a href={practitioner.website_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-8">
                    <Globe className="w-3 h-3 text-purple-600" />
                  </Button>
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {practitioner.contact_email && (
                <a href={`mailto:${practitioner.contact_email}`}>
                  <Button variant="outline" size="sm" className="w-full border-purple-300 hover:bg-purple-50">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </a>
              )}
              {practitioner.contact_phone && (
                <a href={`tel:${practitioner.contact_phone}`}>
                  <Button variant="outline" size="sm" className="w-full border-purple-300 hover:bg-purple-50">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                </a>
              )}
            </div>

            <Link to={createPageUrl(`PractitionerDetail?id=${practitioner.id}`)}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View Full Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
