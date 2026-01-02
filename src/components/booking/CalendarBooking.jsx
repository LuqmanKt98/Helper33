
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
];

const consultationTypes = [
  { value: 'discovery', label: 'Discovery Call (30 min)', duration: 30, price: 'Free' },
  { value: 'strategy', label: 'Strategy Session (60 min)', duration: 60, price: '$150' },
  { value: 'implementation', label: 'Implementation Planning (90 min)', duration: 90, price: '$225' },
  { value: 'follow_up', label: 'Follow-up Session (30 min)', duration: 30, price: '$75' }
];

export default function CalendarBooking({ consultant, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Type, 2: Calendar, 3: Details, 4: Confirmation
  const [selectedType, setSelectedType] = useState('discovery');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    project_details: '',
    budget_range: '',
    meeting_platform: 'zoom'
  });
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentWeek), i)
  );

  // Mock busy times (in real app, this would come from consultant's calendar)
  const busyTimes = [
    { date: '2024-01-15', times: ['10:00', '14:00', '15:30'] },
    { date: '2024-01-16', times: ['09:30', '11:00', '16:00'] },
  ];

  const isTimeAvailable = (date, time) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const busyDay = busyTimes.find(busy => busy.date === dateStr);
    return !busyDay || !busyDay.times.includes(time);
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    try {
      const selectedConsultationType = consultationTypes.find(t => t.value === selectedType);
      
      const bookingData = {
        consultant_id: String(consultant.id), // Ensure ID is a string
        client_name: bookingDetails.client_name,
        client_email: bookingDetails.client_email,
        client_phone: bookingDetails.client_phone,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime,
        duration_minutes: selectedConsultationType.duration,
        consultation_type: selectedType,
        meeting_platform: bookingDetails.meeting_platform,
        project_details: bookingDetails.project_details,
        budget_range: bookingDetails.budget_range,
        zoom_link: bookingDetails.meeting_platform === 'zoom' ? 'https://zoom.us/j/mock-meeting-id' : null,
        status: 'confirmed'
      };

      // Create booking record
      const booking = await base44.entities.ConsultationBooking.create(bookingData);

      // Send confirmation email to client
      await base44.functions.invoke('sendExternalEmail', {
        to: bookingDetails.client_email,
        from_name: 'DobryLife Bookings',
        subject: `Confirmed: AI Consultation with ${consultant.name}`,
        body: `
          <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Your AI consultation has been confirmed!</h2>
              <p>Dear ${bookingDetails.client_name},</p>
              
              <div style="background-color: #f8f8f8; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                  <p><strong>Consultant:</strong> ${consultant.name}</p>
                  <p><strong>Service:</strong> ${selectedConsultationType.label}</p>
                  <p><strong>Date:</strong> ${format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
                  <p><strong>Time:</strong> ${selectedTime}</p>
                  <p><strong>Platform:</strong> ${bookingDetails.meeting_platform}</p>
                  ${bookingDetails.meeting_platform === 'zoom' ? `<p><strong>Zoom Link:</strong> <a href="https://zoom.us/j/mock-meeting-id">https://zoom.us/j/mock-meeting-id</a></p>` : ''}
              </div>

              <p style="margin-top: 20px;">If you need to reschedule or have questions, please reply to this email.</p>
              <p>Looking forward to our session!</p>
              <br/>
              <p>Best regards,</p>
              <p>The DobryLife Team</p>
          </div>
        `,
      });

      // Send notification email to admin
       try {
        const emailBody = `
            <div style="font-family: sans-serif;">
                <h2>New Confirmed Booking</h2>
                <p>A client has booked a session directly with a consultant.</p>
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Consultant:</strong> ${consultant.name}</li>
                    <li><strong>Client:</strong> ${bookingDetails.client_name}</li>
                    <li><strong>Email:</strong> ${bookingDetails.client_email}</li>
                    <li><strong>Date:</strong> ${format(selectedDate, 'EEEE, MMMM do, yyyy')} at ${selectedTime}</li>
                    <li><strong>Type:</strong> ${selectedConsultationType.label}</li>
                    <li><strong>Platform:</strong> ${bookingDetails.meeting_platform}</li>
                    ${bookingDetails.client_phone ? `<li><strong>Phone:</strong> ${bookingDetails.client_phone}</li>` : ''}
                    ${bookingDetails.budget_range ? `<li><strong>Budget Range:</strong> ${bookingDetails.budget_range}</li>` : ''}
                    ${bookingDetails.project_details ? `<li><strong>Project Details:</strong> ${bookingDetails.project_details}</li>` : ''}
                </ul>
                <p>Please log in to the admin panel for more details.</p>
            </div>
        `;
        await base44.functions.invoke('sendAdminNotification', {
            subject: `New Booking with ${consultant.name}`,
            body: emailBody,
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email for direct booking:", emailError);
      }


      setStep(4);
      if (onSuccess) onSuccess(booking);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarLinks = () => {
    const startDate = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`);
    const endDate = new Date(startDate.getTime() + (30 * 60 * 1000)); // 30 minutes
    
    const googleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI%20Consultation%20with%20${consultant.name}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=AI%20consultation%20session`;
    
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=AI%20Consultation%20with%20${consultant.name}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`;

    return { googleCalendar, outlook };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="text-xl font-bold">Book Consultation</h2>
              <p className="text-gray-600">with {consultant.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Consultation Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Consultation Type</h3>
                  <div className="grid gap-3">
                    {consultationTypes.map((type) => (
                      <Card 
                        key={type.value}
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedType === type.value 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedType(type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-sm text-gray-600">Duration: {type.duration} minutes</p>
                            </div>
                            <Badge variant={type.price === 'Free' ? 'default' : 'secondary'}>
                              {type.price}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!selectedType}
                >
                  Continue to Calendar
                </Button>
              </motion.div>
            )}

            {/* Step 2: Calendar Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                    >
                      ← Previous Week
                    </Button>
                    <span className="font-medium">
                      {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                    >
                      Next Week →
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {weekDates.map((date) => (
                      <Card 
                        key={date.toISOString()}
                        className={`cursor-pointer text-center p-3 ${
                          selectedDate && isSameDay(date, selectedDate)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-xs text-gray-500">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-medium">
                          {format(date, 'd')}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <h4 className="font-medium mb-3">Available Times</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const available = isTimeAvailable(selectedDate, time);
                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? 'default' : 'outline'}
                              size="sm"
                              disabled={!available}
                              onClick={() => setSelectedTime(time)}
                              className={!available ? 'opacity-50' : ''}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => setStep(3)} 
                  className="w-full"
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue to Details
                </Button>
              </motion.div>
            )}

            {/* Step 3: Booking Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Details</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={bookingDetails.client_name}
                          onChange={(e) => setBookingDetails({
                            ...bookingDetails, 
                            client_name: e.target.value
                          })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingDetails.client_email}
                          onChange={(e) => setBookingDetails({
                            ...bookingDetails, 
                            client_email: e.target.value
                          })}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={bookingDetails.client_phone}
                        onChange={(e) => setBookingDetails({
                          ...bookingDetails, 
                          client_phone: e.target.value
                        })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="platform">Meeting Platform</Label>
                      <Select 
                        value={bookingDetails.meeting_platform}
                        onValueChange={(value) => setBookingDetails({
                          ...bookingDetails, 
                          meeting_platform: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              Zoom Video Call
                            </div>
                          </SelectItem>
                          <SelectItem value="google_meet">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              Google Meet
                            </div>
                          </SelectItem>
                          <SelectItem value="phone">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone Call
                            </div>
                          </SelectItem>
                          <SelectItem value="in_person">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              In Person
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select 
                        value={bookingDetails.budget_range}
                        onValueChange={(value) => setBookingDetails({
                          ...bookingDetails, 
                          budget_range: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_5k">Under $5,000</SelectItem>
                          <SelectItem value="5k_15k">$5,000 - $15,000</SelectItem>
                          <SelectItem value="15k_50k">$15,000 - $50,000</SelectItem>
                          <SelectItem value="50k_plus">$50,000+</SelectItem>
                          <SelectItem value="hourly">Hourly Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="project">Project Details</Label>
                      <Textarea
                        id="project"
                        value={bookingDetails.project_details}
                        onChange={(e) => setBookingDetails({
                          ...bookingDetails, 
                          project_details: e.target.value
                        })}
                        placeholder="Describe your AI project or consultation needs..."
                        className="h-24"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleBookingSubmit}
                  className="w-full"
                  disabled={!bookingDetails.client_name || !bookingDetails.client_email || loading}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600">Your consultation has been scheduled successfully.</p>
                </div>

                <Card className="bg-gray-50 text-left">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span>{bookingDetails.meeting_platform}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Add to your calendar:</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(generateCalendarLinks().googleCalendar, '_blank')}
                    >
                      Google Calendar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(generateCalendarLinks().outlook, '_blank')}
                    >
                      Outlook
                    </Button>
                  </div>
                </div>

                <Button onClick={onClose} className="w-full">
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
