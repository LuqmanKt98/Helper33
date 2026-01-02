import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, ListChecks, Heart, MessageCircle } from 'lucide-react';

export default function FamilyOverview({ members, events, tasks, onTabChange }) {
  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).slice(0, 3);
  const activeTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Family Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                <Badge variant="outline">{member.age} yrs</Badge>
              </div>
            ))}
             <Button onClick={() => onTabChange('global_family')} className="w-full mt-4">Manage Members</Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart /> Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">Not set up yet.</p>
            <Button variant="outline" className="mt-2" size="sm">Set Up</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar /> Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <div key={event.id} className="mb-2">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.start_date).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-gray-500">No upcoming events.</p>}
            <Button onClick={() => onTabChange('schedule')} className="w-full mt-2">View Full Schedule</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks /> Family Tasks</CardTitle>
          </CardHeader>
          <CardContent>
             {activeTasks.length > 0 ? activeTasks.map(task => (
              <div key={task.id} className="mb-2">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-500">Assigned to: {task.assigned_to_family_member || 'Unassigned'}</p>
              </div>
            )) : <p className="text-sm text-gray-500">No active tasks.</p>}
            <Button onClick={() => onTabChange('chores')} className="w-full mt-2">View Chores</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle /> Communication Hub</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">Start a conversation with your family.</p>
            <Button onClick={() => onTabChange('community')} className="w-full mt-2">Go to Chat</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}