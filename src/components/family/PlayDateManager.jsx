import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, PartyPopper } from 'lucide-react';

export default function PlayDateManager({ invitations, onUpdate }) {
  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const upcomingPlayDates = invitations.filter(i => i.status === 'accepted' && new Date(i.proposed_date) > new Date());

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button><Plus className="mr-2 h-4 w-4" /> Schedule Play Date</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock /> Pending Invitations ({pendingInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-500 py-10">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2"/>
            No pending invitations
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PartyPopper /> Upcoming Play Dates ({upcomingPlayDates.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-500 py-10">
            <PartyPopper className="mx-auto h-12 w-12 text-gray-300 mb-2"/>
            No upcoming play dates
          </CardContent>
        </Card>
      </div>
    </div>
  );
}