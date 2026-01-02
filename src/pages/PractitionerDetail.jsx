
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Star, Shield, MapPin, Video, Phone, Mail, Globe, Briefcase,
  Award, Heart, CheckCircle, ExternalLink, MessageSquare,
  Linkedin, Facebook, Instagram, Languages, AlertCircle, Calendar, User // Added User icon
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import BookingSystem from '@/components/practitioners/BookingSystem'; // Changed from BookingCalendar
import ReviewReportSystem from '../components/practitioners/ReviewReportSystem';

export default function PractitionerDetail() {
  const params = new URLSearchParams(window.location.search);
  const practitionerId = params.get('id');
  const [showBooking, setShowBooking] = useState(false); // This state might become unused due to BookingSystem
  const queryClient = useQueryClient();

  // Renamed 'practitioner' to 'profile' for consistency with outline
  const { data: profile } = useQuery({
    queryKey: ['practitioner', practitionerId],
    queryFn: async () => {
      const practitioners = await base44.entities.PractitionerProfile.filter({ id: practitionerId });
      return practitioners[0];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading practitioner profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${profile?.full_name || 'Practitioner'} - Licensed Professional | Helper33`}
        description={profile?.bio || 'Connect with licensed mental health professionals'}
        keywords={`${profile.full_name}, ${profile.specializations?.join(', ')}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"> {/* Removed p-4 sm:p-6 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Updated padding and added py-8 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Overview Sidebar */}
            <div className="lg:col-span-1 space-y-6"> {/* Added space-y-6 for vertical spacing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-yellow-50 border-2 border-yellow-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">Directory Listing Only</p>
                        <p>Helper33 provides this directory as a resource to connect you with licensed practitioners. We do not provide clinical services, book appointments, or process payments. Please contact practitioners directly to inquire about their services, availability, and fees.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
                  <CardHeader className="relative">
                    {profile.featured && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {profile.profile_photo_url ? (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={profile.profile_photo_url}
                          alt={profile.full_name}
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-purple-300 shadow-xl"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-4 border-purple-300 shadow-xl">
                          <Heart className="w-16 h-16 text-white" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.full_name}</h1>
                        <p className="text-lg text-purple-700 font-semibold mb-3">{profile.title}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {profile.license_type} - {profile.license_state}
                            {profile.license_verification_url && (
                              <a href={profile.license_verification_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {profile.years_of_experience} years experience
                          </Badge>
                        </div>

                        {profile.average_rating > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                className={`w-5 h-5 ${n <= profile.average_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="font-semibold text-gray-700">
                              {profile.average_rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">({profile.total_reviews} reviews)</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {profile.contact_email && (
                            <a href={`mailto:${profile.contact_email}`}>
                              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                <Mail className="w-4 h-4 mr-2" />
                                Contact via Email
                              </Button>
                            </a>
                          )}
                          {profile.contact_phone && (
                            <a href={`tel:${profile.contact_phone}`}>
                              <Button variant="outline" className="border-purple-300">
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-purple-300 shadow-md w-full grid grid-cols-2">
                  <TabsTrigger value="about" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    About
                  </TabsTrigger>
                  <TabsTrigger value="book" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                        <CardHeader>
                          <CardTitle>About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                        </CardContent>
                      </Card>

                      {profile.treatment_approaches && profile.treatment_approaches.length > 0 && (
                        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-purple-600" />
                              Treatment Approaches
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {profile.treatment_approaches.map((approach, i) => (
                                <Badge key={i} className="bg-purple-100 text-purple-700">{approach}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {profile.specializations && profile.specializations.length > 0 && (
                        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                          <CardHeader>
                            <CardTitle>Areas of Expertise</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-3 gap-3">
                              {profile.specializations.map((spec, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
                                >
                                  <CheckCircle className="w-5 h-5 text-purple-600 mb-2" />
                                  <p className="font-semibold text-gray-800">{spec}</p>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    </div>

                    <div className="space-y-6">
                      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-700 mb-1">Session Options</p>
                            <div className="flex gap-2">
                              {profile.accepts_telehealth && (
                                <Badge variant="outline" className="border-blue-300">
                                  <Video className="w-3 h-3 mr-1" />
                                  Telehealth
                                </Badge>
                              )}
                              {profile.accepts_in_person && (
                                <Badge variant="outline" className="border-green-300">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  In-Person
                                </Badge>
                              )}
                            </div>
                          </div>

                          {profile.languages_spoken && profile.languages_spoken.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Languages className="w-4 h-4" />
                                Languages Spoken
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {profile.languages_spoken.map((lang, i) => (
                                  <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">{lang}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {profile.insurance_accepted && profile.insurance_accepted.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                Insurance Accepted
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {profile.insurance_accepted.map((ins, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{ins}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {profile.age_groups_served && profile.age_groups_served.length > 0 && (
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Age Groups</p>
                              <div className="flex flex-wrap gap-1">
                                {profile.age_groups_served.map((age, i) => (
                                  <Badge key={i} variant="outline" className="capitalize text-xs">{age}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-200">
                            <p className="font-semibold text-gray-700 mb-2">Connect Online</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">
                                    <Linkedin className="w-4 h-4 text-blue-600" />
                                  </Button>
                                </a>
                              )}
                              {profile.facebook_url && (
                                <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">
                                    <Facebook className="w-4 h-4 text-blue-700" />
                                  </Button>
                                </a>
                              )}
                              {profile.instagram_url && (
                                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">
                                    <Instagram className="w-4 h-4 text-pink-600" />
                                  </Button>
                                </a>
                              )}
                              {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm">
                                    <Globe className="w-4 h-4 text-purple-600" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Please contact this practitioner directly</strong> to inquire about their services, availability, insurance, and fees. Helper33 does not book appointments or process payments.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {profile.contact_email && (
                              <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all">
                                <Mail className="w-5 h-5 text-purple-600" />
                                <div>
                                  <p className="font-semibold text-gray-800">Email</p>
                                  <p className="text-purple-700">{profile.contact_email}</p>
                                </div>
                              </a>
                            )}
                            {profile.contact_phone && (
                              <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all">
                                <Phone className="w-5 h-5 text-purple-600" />
                                <div>
                                  <p className="font-semibold text-gray-800">Phone</p>
                                  <p className="text-purple-700">{profile.contact_phone}</p>
                                </div>
                              </a>
                            )}
                            {profile.office_address && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                                <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                                <div>
                                  <p className="font-semibold text-gray-800">Office Location</p>
                                  <p className="text-gray-700">{profile.office_address}</p>
                                </div>
                              </div>
                            )}
                            {profile.website_url && (
                              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all">
                                <Globe className="w-5 h-5 text-purple-600" />
                                <div>
                                  <p className="font-semibold text-gray-800">Website</p>
                                  <p className="text-purple-700">{profile.website_url}</p>
                                </div>
                              </a>
                            )}
                          </div>

                          {profile.availability && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                              <p className="font-semibold text-gray-800 mb-2">General Availability</p>
                              <p className="text-gray-700 text-sm">{profile.availability}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="book" className="mt-6">
                  <BookingSystem
                    practitioner={profile}
                    onBookingComplete={() => {
                      queryClient.invalidateQueries(['appointments']);
                      toast.success('Appointment request sent! The practitioner will confirm shortly. 📅');
                    }}
                  />
                </TabsContent>
              </Tabs>

              {user ? (
                <ReviewReportSystem
                  practitionerId={profile.id}
                  practitionerName={profile.full_name}
                  practitionerEmail={profile.created_by} // Assuming created_by holds the practitioner's email or ID suitable for the component
                />
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Please log in to share feedback or report issues</p>
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Log In to Continue
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
