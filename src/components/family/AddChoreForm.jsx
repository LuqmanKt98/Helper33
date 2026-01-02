import React, { useState } from 'react';
import { Chore } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AddChoreForm({ familyMembers, onChoreUpdate }) {
  const [chore, setChore] = useState({
    name: '',
    description: '',
    frequency: 'weekly',
    points: 10,
    assigned_member_ids: [],
  });
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Chore.create({
          ...chore,
          // Set the first assigned person as the current one
          current_assignee_id: chore.assigned_member_ids[0] || null 
      });
      onChoreUpdate();
    } catch (error) {
      console.error("Error creating chore:", error);
    }
  };

  const handleSuggestChores = async () => {
      setIsSuggesting(true);
      try {
        const ages = familyMembers.map(m => m.age).filter(Boolean).join(', ');
        const prompt = `Based on a family with members aged ${ages}, suggest 3 age-appropriate household chores. Provide a name, a brief description, a recommended frequency (daily, weekly, or monthly), and a suggested point value (1-50).`;
        
        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    chore_suggestions: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                description: { type: 'string' },
                                frequency: { type: 'string' },
                                points: { type: 'number' }
                            },
                            required: ['name', 'description', 'frequency', 'points']
                        }
                    }
                }
            }
        });
        
        if(response.output.chore_suggestions && response.output.chore_suggestions.length > 0) {
            setChore(prev => ({...prev, ...response.output.chore_suggestions[0]}));
        }

      } catch (error) {
        console.error("Error suggesting chores:", error);
      } finally {
        setIsSuggesting(false);
      }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add a New Chore</h3>
        <Button type="button" variant="outline" onClick={handleSuggestChores} disabled={isSuggesting}>
            <Sparkles className={`w-4 h-4 mr-2 ${isSuggesting ? 'animate-spin' : ''}`} />
            {isSuggesting ? 'Thinking...' : 'AI Suggest'}
        </Button>
      </div>
      <div>
        <Label htmlFor="name">Chore Name</Label>
        <Input id="name" value={chore.name} onChange={(e) => setChore({ ...chore, name: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={chore.description} onChange={(e) => setChore({ ...chore, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={chore.frequency} onValueChange={(value) => setChore({ ...chore, frequency: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="points">Points</Label>
          <Input id="points" type="number" value={chore.points} onChange={(e) => setChore({ ...chore, points: parseInt(e.target.value) })} />
        </div>
      </div>
      <div>
        <Label>Assign To (Rotation Order)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
            {familyMembers.map(member => (
                <Button 
                    key={member.id}
                    type="button"
                    variant={chore.assigned_member_ids.includes(member.id) ? "default" : "outline"}
                    onClick={() => {
                        const newAssigned = chore.assigned_member_ids.includes(member.id)
                            ? chore.assigned_member_ids.filter(id => id !== member.id)
                            : [...chore.assigned_member_ids, member.id];
                        setChore({...chore, assigned_member_ids: newAssigned});
                    }}
                >
                    {member.name}
                </Button>
            ))}
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Chore
      </Button>
    </form>
  );
}