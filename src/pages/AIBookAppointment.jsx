import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Calendar, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react';
import AIBookingAssistant from '../components/appointments/AIBookingAssistant';
import AppointmentConfirmation from '../components/appointments/AppointmentConfirmation';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function AIBookAppointment() {
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: practitioners, isLoading } = useQuery({
    queryKey: ['practitioners'],
    queryFn: async () => {
      const profiles = await base44.entities.PractitionerProfile.filter({ status: 'approved' });
      return profiles;
    }
  });

  if (confirmedAppointment) {
    return (
      <AppointmentConfirmation
        appointment={confirmedAppointment}
        onClose={() => setConfirmedAppointment(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bot className="w-12 h-12 text-purple-600" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Appointment Booking
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book appointments with our practitioners using our intelligent AI assistant. 
            Simply chat naturally to find available times and schedule your session.
          </p>
        </motion.div>

        {!selectedPractitioner ? (
          <>
            {/* Practitioner Selection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-200 mb-6">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Select a Practitioner
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading practitioners...</p>
                    </div>
                  ) : practitioners?.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {practitioners.map((practitioner) => (
                        <motion.div
                          key={practitioner.id}
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-purple-200 hover:border-purple-400">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                {practitioner.profile_photo_url ? (
                                  <img
                                    src={practitioner.profile_photo_url}
                                    alt={practitioner.full_name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                                    {practitioner.full_name?.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-800">{practitioner.full_name}</h3>
                                  <p className="text-sm text-gray-600">{practitioner.title}</p>
                                </div>
                              </div>
                              
                              {practitioner.specializations && practitioner.specializations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {practitioner.specializations.slice(0, 3).map((spec, idx) => (
                                    <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {practitioner.scheduling_link ? (
                                <a
                                  href={practitioner.scheduling_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Book via {practitioner.full_name.split(' ')[0]}'s Link
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  onClick={() => setSelectedPractitioner(practitioner)}
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  <Bot className="w-4 h-4 mr-2" />
                                  Book with AI
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No practitioners available yet</p>
                      <Link to={createPageUrl('FindPractitioners')}>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                          Browse All Practitioners
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            {/* AI Booking Interface */}
            <Button
              onClick={() => setSelectedPractitioner(null)}
              variant="outline"
              className="mb-6 border-2 border-purple-300 hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practitioner Selection
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Practitioner Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-200 sticky top-6">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      {selectedPractitioner.profile_photo_url ? (
                        <img
                          src={selectedPractitioner.profile_photo_url}
                          alt={selectedPractitioner.full_name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 mx-auto mb-4"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                          {selectedPractitioner.full_name?.charAt(0)}
                        </div>
                      )}
                      <h3 className="font-bold text-xl text-gray-800">{selectedPractitioner.full_name}</h3>
                      <p className="text-gray-600">{selectedPractitioner.title}</p>
                    </div>

                    {selectedPractitioner.bio && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                        <p className="text-sm text-gray-600 line-clamp-4">{selectedPractitioner.bio}</p>
                      </div>
                    )}

                    {selectedPractitioner.specializations && selectedPractitioner.specializations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPractitioner.specializations.map((spec, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
                      <p className="text-xs text-gray-600">
                        <strong>💡 Booking Tip:</strong> Chat naturally with the AI to find and book your preferred time slot.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Chat */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <AIBookingAssistant
                  practitionerId={selectedPractitioner.id}
                  practitionerName={selectedPractitioner.full_name}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}