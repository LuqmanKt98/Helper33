import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Bell, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WellnessReminders() {

    // This is a placeholder component.
    // The logic would involve creating and managing a 'WellnessReminder' entity.
    // For now, it will guide users to the main Wellness and Organizer pages.

    const sampleReminders = [
        { title: "Grandma's Morning Meds", time: "8:00 AM", member: "Grandma" },
        { title: "Leo's Asthma Inhaler", time: "7:30 PM", member: "Leo" },
        { title: "Family Walk", time: "6:00 PM", member: "Everyone" },
    ];

    return (
        <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500" />
                    Family Wellness
                </CardTitle>
                <CardDescription>
                    Set up reminders for medications, health check-ins, and self-care routines for the whole family.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 bg-pink-50 rounded-lg text-center">
                        <h4 className="font-semibold text-pink-800 mb-2">A Central Place for Care</h4>
                        <p className="text-sm text-pink-700">
                            The full Family Wellness feature is coming soon! For now, you can manage individual wellness habits and health tasks using the main app sections.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link to={createPageUrl('Wellness')}>
                            <Button className="w-full" variant="outline">
                                <Heart className="w-4 h-4 mr-2" /> Go to My Wellness
                            </Button>
                        </Link>
                         <Link to={createPageUrl('Organizer')}>
                            <Button className="w-full" variant="outline">
                                <ListChecks className="w-4 h-4 mr-2" /> Go to Life Organizer
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-3">Example Reminders:</h4>
                        <div className="space-y-3">
                            {sampleReminders.map(reminder => (
                                <div key={reminder.title} className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                                    <div>
                                        <p className="font-medium">{reminder.title}</p>
                                        <p className="text-xs text-gray-500">{reminder.member}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Bell className="w-4 h-4" />
                                        <span>{reminder.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}