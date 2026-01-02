
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyEvent } from '@/entities/all';
import { Loader2, Trash2, Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventModal({ isOpen, event, familyMembers, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        event_type: 'other',
        color: '#3b82f6',
        participants: [],
        reminder_enabled: false,
        reminder_minutes: 15,
        recurring: 'none'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                description: event.description || '',
                start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
                end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
                location: event.location || '',
                event_type: event.event_type || 'other',
                color: event.color || '#3b82f6',
                participants: event.participants || [],
                reminder_enabled: event.reminder_enabled || false,
                reminder_minutes: event.reminder_minutes || 15,
                recurring: event.recurring || 'none'
            });
        } else {
            // Reset for new event
            const now = new Date();
            now.setMinutes(0, 0, 0);
            setFormData({
                title: '',
                description: '',
                start_date: now.toISOString().slice(0, 16),
                end_date: '',
                location: '',
                event_type: 'other',
                color: '#3b82f6',
                participants: [],
                reminder_enabled: false,
                reminder_minutes: 15,
                recurring: 'none'
            });
        }
    }, [event, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.start_date) {
            toast.error('Please fill in required fields');
            return;
        }

        setIsLoading(true);
        try {
            if (event) {
                await FamilyEvent.update(event.id, formData);
                toast.success('Event updated successfully!');
            } else {
                await FamilyEvent.create(formData);
                toast.success('Event created successfully!');
            }
            onClose(true);
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error('Failed to save event');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        
        setIsLoading(true);
        try {
            await FamilyEvent.delete(event.id);
            toast.success('Event deleted successfully!');
            setShowDeleteConfirm(false);
            onClose(true);
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleParticipant = (memberId) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.includes(memberId)
                ? prev.participants.filter(id => id !== memberId)
                : [...prev.participants, memberId]
        }));
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {event ? 'Edit Event' : 'New Event'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Event title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Event details..."
                                className="h-20"
                            />
                        </div>

                        {/* Event Type */}
                        <div>
                            <Label htmlFor="event-type" className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Event Type
                            </Label>
                            <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appointment">Appointment</SelectItem>
                                    <SelectItem value="activity">Activity</SelectItem>
                                    <SelectItem value="meal">Meal</SelectItem>
                                    <SelectItem value="chore">Chore</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="celebration">Celebration</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start-date" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Start Date & Time *
                                </Label>
                                <Input
                                    id="start-date"
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="end-date">End Date & Time</Label>
                                <Input
                                    id="end-date"
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Event location"
                            />
                        </div>

                        {/* Participants */}
                        {familyMembers && familyMembers.length > 0 && (
                            <div>
                                <Label className="flex items-center gap-2 mb-3">
                                    <Users className="w-4 h-4" />
                                    Participants
                                </Label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                                    {familyMembers.map(member => (
                                        <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <Checkbox
                                                id={`member-${member.id}`}
                                                checked={formData.participants.includes(member.id)}
                                                onCheckedChange={() => toggleParticipant(member.id)}
                                            />
                                            <div 
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                                                style={{ backgroundColor: `${member.color || '#3b82f6'}30` }}
                                            >
                                                {member.emoji || '👤'}
                                            </div>
                                            <label
                                                htmlFor={`member-${member.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                            >
                                                {member.name}
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {member.role.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recurring */}
                        <div>
                            <Label htmlFor="recurring">Recurring</Label>
                            <Select value={formData.recurring} onValueChange={(value) => setFormData({ ...formData, recurring: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Does not repeat</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reminder */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="reminder"
                                checked={formData.reminder_enabled}
                                onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
                            />
                            <label htmlFor="reminder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Send reminder
                            </label>
                            {formData.reminder_enabled && (
                                <Select 
                                    value={formData.reminder_minutes.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, reminder_minutes: parseInt(value) })}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 mins before</SelectItem>
                                        <SelectItem value="15">15 mins before</SelectItem>
                                        <SelectItem value="30">30 mins before</SelectItem>
                                        <SelectItem value="60">1 hour before</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            {event && (
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {event ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{event?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
