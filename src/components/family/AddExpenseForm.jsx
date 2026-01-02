import React, { useState } from 'react';
import { FamilyExpense } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AddExpenseForm({ onUpdate }) {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await FamilyExpense.create({
        ...expense,
        amount: parseFloat(expense.amount),
      });
      onUpdate();
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const handleParseExpense = async () => {
      if (!aiPrompt) return;
      setIsParsing(true);
      try {
        const prompt = `Parse the following text into a structured expense record: "${aiPrompt}". The category must be one of: groceries, utilities, rent_mortgage, transportation, health, education, entertainment, kids, other.`;
        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    category: { type: 'string' }
                },
                required: ['description', 'amount', 'category']
            }
        });
        if (response.output) {
            setExpense(prev => ({
                ...prev,
                description: response.output.description || prev.description,
                amount: response.output.amount || prev.amount,
                category: response.output.category || prev.category,
            }));
            setAiPrompt('');
        }
      } catch (error) {
          console.error("Error parsing expense:", error);
      } finally {
          setIsParsing(false);
      }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold">Log a New Expense</h3>
      
      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Log with AI</Label>
        <div className="flex gap-2">
            <Input 
                id="ai-prompt" 
                placeholder="e.g., spent $45 on groceries at Whole Foods"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleParseExpense} disabled={isParsing}>
                <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input id="amount" type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} required />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={expense.category} onValueChange={(value) => setExpense({ ...expense, category: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="groceries">Groceries</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="rent_mortgage">Rent/Mortgage</SelectItem>
            <SelectItem value="transportation">Transportation</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Log Expense
      </Button>
    </form>
  );
}