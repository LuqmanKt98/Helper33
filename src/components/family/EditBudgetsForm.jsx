import React, { useState } from 'react';
import { FamilyBudget } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save } from 'lucide-react';

export default function EditBudgetsForm({ budgets, onUpdate }) {
  const [localBudgets, setLocalBudgets] = useState(budgets);

  const handleBudgetChange = (id, amount) => {
    setLocalBudgets(localBudgets.map(b => b.id === id ? { ...b, amount: parseFloat(amount) || 0 } : b));
  };
  
  const handleSave = async () => {
    try {
        const promises = localBudgets.map(b => {
            const original = budgets.find(ob => ob.id === b.id);
            if (original && original.amount !== b.amount) {
                return FamilyBudget.update(b.id, { amount: b.amount });
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
        onUpdate();
    } catch(error) {
        console.error("Error updating budgets", error);
    }
  }

  const categories = ["groceries", "utilities", "rent_mortgage", "transportation", "health", "education", "entertainment", "kids", "other"];
  const usedCategories = localBudgets.map(b => b.category);
  const availableCategories = categories.filter(c => !usedCategories.includes(c));

  const addBudgetCategory = async (category) => {
      try {
          await FamilyBudget.create({ category, amount: 0, period: 'monthly' });
          onUpdate();
      } catch (error) {
          console.error("Error adding budget category", error)
      }
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold">Set Monthly Budgets</h3>
      <div className="space-y-3">
        {localBudgets.map(budget => (
          <div key={budget.id} className="flex items-center gap-3">
            <Label htmlFor={`budget-${budget.id}`} className="flex-1 capitalize">{budget.category.replace('_', ' ')}</Label>
            <Input
              id={`budget-${budget.id}`}
              type="number"
              value={budget.amount}
              onChange={(e) => handleBudgetChange(budget.id, e.target.value)}
              className="w-32"
            />
          </div>
        ))}
      </div>
       <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Add Category</h4>
            <div className="flex flex-wrap gap-2">
                {availableCategories.map(cat => (
                    <Button key={cat} variant="outline" size="sm" onClick={() => addBudgetCategory(cat)}>
                        <Plus className="w-3 h-3 mr-1" /> {cat.replace('_', ' ')}
                    </Button>
                ))}
            </div>
        </div>
      <Button onClick={handleSave} className="w-full mt-4">
        <Save className="w-4 h-4 mr-2" /> Save Budgets
      </Button>
    </div>
  );
}