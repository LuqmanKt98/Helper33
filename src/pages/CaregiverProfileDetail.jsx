import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CaregiverProfile, Review, Booking, User } from '@/entities/all';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ShieldCheck, MapPin, Star, Briefcase, Clock, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import ReviewList from '@/components/care_hub/ReviewList';
import ReviewForm from '@/components/care_hub/ReviewForm';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CaregiverProfileDetail() {
  const query = useQuery();
  const caregiverId = query.get('id');
  const [caregiver, setCaregiver] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Booking state
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  
  // Contact state
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const fetchCaregiverAndReviews = useCallback(async () => {
    if (!caregiverId) {
        setIsLoading(false);
        return;
    };
    
    setIsLoading(true);
    try {
        const [profile, fetchedReviews, currentUser] = await Promise.all([
            CaregiverProfile.get(caregiverId),
            Review.filter({ caregiver_id: caregiverId }, '-created_date'),
            User.me().catch(() => null)
        ]);
        setCaregiver(profile);
        setReviews(fetchedReviews);
        setUser(currentUser);
    } catch (error) {
        console.error("Failed to fetch caregiver details:", error);
    } finally {
        setIsLoading(false);
    }
  }, [caregiverId]);

  useEffect(() => {
    fetchCaregiverAndReviews();
  }, [fetchCaregiverAndReviews]);

  const handleBooking = async () => {
    if (!bookingData.start_time || !bookingData.end_time) {
      alert('Please select both start and end times.');
      return;
    }

    const startTime = new Date(bookingData.start_time);
    const endTime = new Date(bookingData.end_time);
    
    if (endTime <= startTime) {
      alert('End time must be after start time.');
      return;
    }

    const hours = (endTime - startTime) / (1000 * 60 * 60);
    const totalCost = hours * caregiver.hourly_rate;

    setIsSubmittingBooking(true);
    try {
      await Booking.create({
        caregiver_id: caregiverId,
        family_id: user.id,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        total_cost: totalCost,
        status: 'pending'
      });
      
      alert(`Booking request submitted! Total cost: $${totalCost.toFixed(2)}. The caregiver will be notified.`);
      setShowBookingDialog(false);
      setBookingData({ start_time: '', end_time: '', notes: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
    setIsSubmittingBooking(false);
  };

  const handleContact = async () => {
    if (!contactMessage.trim()) {
      alert('Please write a message.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      // In a real app, this would send an email or create a message thread
      // For now, we'll just show a success message
      alert(`Message sent to ${caregiver.full_name}! They will receive your contact request via email.`);
      setShowContactDialog(false);
      setContactMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setIsSubmittingContact(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  }

  if (!caregiver) {
    return <div className="text-center py-12">Caregiver not found.</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <img src={caregiver.profile_picture_url || `https://i.pravatar.cc/150?u=${caregiver.id}`} alt={caregiver.full_name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800">{caregiver.full_name}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-600">
                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {caregiver.location}</div>
                                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {averageRating} ({reviews.length} reviews)</div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                {caregiver.is_id_verified && <Badge className="bg-blue-100 text-blue-800"><ShieldCheck className="w-3 h-3 mr-1" />ID Verified</Badge>}
                                {caregiver.is_background_checked && <Badge className="bg-green-100 text-green-800"><ShieldCheck className="w-3 h-3 mr-1" />Background Checked</Badge>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-2">About Me</h3>
                        <p className="text-gray-700 leading-relaxed">{caregiver.bio}</p>
                    </div>
                    {caregiver.portfolio_url && (
                        <div className="mt-4">
                            <a href={caregiver.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                                View Portfolio
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Client Reviews</h2>
                <ReviewList reviews={reviews} />
            </div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                        <div>
                            <div className="font-bold text-xl text-emerald-600">${caregiver.hourly_rate}</div>
                            <div className="text-sm text-gray-500">per hour</div>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">{caregiver.experience_years} years of experience</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700 capitalize">{caregiver.availability.replace('_', ' ')} availability</span>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                            {caregiver.services.map(service => (
                                <Badge key={service} variant="outline" className="capitalize">{service.replace('_', ' ')}</Badge>
                            ))}
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {user && (
                        <div className="space-y-2 pt-4 border-t">
                            <Button 
                                onClick={() => setShowBookingDialog(true)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Book Now
                            </Button>
                            <Button 
                                onClick={() => setShowContactDialog(true)}
                                variant="outline"
                                className="w-full"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send Message
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {user && <ReviewForm caregiverId={caregiverId} onReviewSubmit={fetchCaregiverAndReviews} />}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {caregiver.full_name}</DialogTitle>
            <DialogDescription>
              Select your preferred date and time. The caregiver will confirm your booking request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date & Time</label>
              <Input
                type="datetime-local"
                value={bookingData.start_time}
                onChange={(e) => setBookingData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date & Time</label>
              <Input
                type="datetime-local"
                value={bookingData.end_time}
                onChange={(e) => setBookingData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes (Optional)</label>
              <Textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific requirements or information..."
                className="h-24"
              />
            </div>
            {bookingData.start_time && bookingData.end_time && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Estimated Cost: ${((new Date(bookingData.end_time) - new Date(bookingData.start_time)) / (1000 * 60 * 60) * caregiver.hourly_rate).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBooking} disabled={isSubmittingBooking}>
              {isSubmittingBooking ? 'Submitting...' : 'Request Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {caregiver.full_name}</DialogTitle>
            <DialogDescription>
              Send a message to introduce yourself and discuss your needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi! I'm interested in your services. I'd like to discuss..."
              className="h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleContact} disabled={isSubmittingContact}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {isSubmittingContact ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}