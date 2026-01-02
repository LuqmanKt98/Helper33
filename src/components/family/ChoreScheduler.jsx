
import React, { useState } from 'react';
import { Chore } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Trophy, Plus, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddChoreForm from './AddChoreForm'; // Import the new form

export default function ChoreScheduler({ chores, familyMembers, onChoreUpdate }) {
  const [showAddChoreForm, setShowAddChoreForm] = useState(false);
  
  const handleCompleteChore = async (chore) => {
    try {
      const assignedIds = chore.assigned_member_ids || [];
      const currentIndex = assignedIds.indexOf(chore.current_assignee_id);
      const nextIndex = (currentIndex + 1) % (assignedIds.length || 1);
      const nextAssigneeId = assignedIds[nextIndex] || null;

      await Chore.update(chore.id, {
        current_assignee_id: nextAssigneeId,
        last_completed_date: new Date().toISOString(),
        status: 'completed',
      });
      // You'd also update the user's points/streaks here
      onChoreUpdate();
    } catch (error) {
      console.error("Error completing chore:", error);
    }
  };

  const getMemberName = (memberId) => familyMembers.find(m => m.id === memberId)?.name || 'Unassigned';

  const totalPoints = chores.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.points || 0), 0);

  return (
    <div className="p-1">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800"><Trophy /> Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-800">{totalPoints}</p>
            <p className="text-sm text-blue-600">Well done, team!</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800"><Star /> Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-800">14 Days</p>
            <p className="text-sm text-yellow-600">Keep it up!</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800"><Check /> Chores Done This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-800">23</p>
            <p className="text-sm text-green-600">Amazing effort!</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddChoreForm(prev => !prev)}>
            <Plus className="mr-2 h-4 w-4" /> {showAddChoreForm ? 'Cancel' : 'Add New Chore'}
        </Button>
      </div>

      <AnimatePresence>
        {showAddChoreForm && (
            <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-6"
            >
                <AddChoreForm 
                    familyMembers={familyMembers} 
                    onChoreUpdate={() => {
                        onChoreUpdate();
                        setShowAddChoreForm(false);
                    }} 
                />
            </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {chores.map(chore => (
          <motion.div key={chore.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{chore.name} <span className="text-yellow-500 font-normal">({chore.points || 0} pts)</span></p>
                  <p className="text-sm text-gray-500">
                    Assigned to: {getMemberName(chore.current_assignee_id)}
                  </p>
                   <p className="text-xs text-gray-400">Frequency: {chore.frequency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" title="Rotate Assignee (Coming Soon)" disabled><RotateCw className="h-4 w-4" /></Button>
                  <Button onClick={() => handleCompleteChore(chore)}><Check className="mr-2 h-4 w-4"/> Mark as Done</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
