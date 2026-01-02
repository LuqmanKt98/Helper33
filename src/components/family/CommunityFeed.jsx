import React from 'react';
import FamilyStatusUpdate from './FamilyStatusUpdate';
import FamilyActivityFeed from './FamilyActivityFeed';
import { Card, CardContent } from '@/components/ui/card';

export default function CommunityFeed({ updates, onUpdate }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6 p-1">
      <div className="lg:col-span-2">
        <FamilyActivityFeed updates={updates} onUpdate={onUpdate} />
      </div>
      <div>
        <Card>
          <CardContent className="p-4">
            <FamilyStatusUpdate onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}