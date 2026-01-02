
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditBudgetsForm from './EditBudgetsForm';
import AddExpenseForm from './AddExpenseForm';

export default function ExpenseTracker({ budgets, expenses, onUpdate }) {
  const [showEditBudgets, setShowEditBudgets] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategorySpending = (category) => {
      return expenses
        .filter(e => e.category === category)
        .reduce((s,e) => s + e.amount, 0);
  }

  const getCategoryBudget = (category) => {
      return budgets.find(b => b.category === category)?.amount || 0;
  }

  return (
    <div className="p-1">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => setShowEditBudgets(prev => !prev)}>
            {showEditBudgets ? 'Close Budgets' : 'Set/Edit Budgets'}
        </Button>
        <Button onClick={() => setShowAddExpense(prev => !prev)}>
            <Plus className="mr-2 h-4 w-4" /> {showAddExpense ? 'Cancel' : 'Log Expense'}
        </Button>
      </div>

      <AnimatePresence>
          {showEditBudgets && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-6 overflow-hidden">
                <EditBudgetsForm budgets={budgets} onUpdate={() => { onUpdate(); setShowEditBudgets(false); }} />
              </motion.div>
          )}
          {showAddExpense && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mb-6 overflow-hidden">
                <AddExpenseForm onUpdate={() => { onUpdate(); setShowAddExpense(false); }} />
              </motion.div>
          )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budgets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.map(budget => {
                  const spending = getCategorySpending(budget.category);
                  const budgetAmount = budget.amount;
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{budget.category.replace('_', ' ')}</span>
                        <span className="text-sm">${spending.toFixed(2)} / ${budgetAmount.toFixed(2)}</span>
                      </div>
                      <Progress value={(spending / budgetAmount) * 100} />
                    </div>
                  )
              })}
              {budgets.length === 0 && <p className="text-center text-gray-500 py-4">No budgets set yet.</p>}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart would go here. For now, a list. */}
            {expenses.slice(0, 10).map(expense => (
                <div key={expense.id} className="flex justify-between p-2 bg-gray-50 rounded-md mb-2">
                    <div>
                        <p>{expense.description}</p>
                        <p className="text-xs text-gray-500 capitalize">{new Date(expense.date).toLocaleDateString()} &bull; {expense.category.replace('_', ' ')}</p>
                    </div>
                    <span>${expense.amount.toFixed(2)}</span>
                </div>
            ))}
            {expenses.length === 0 && <p className="text-center text-gray-500 py-4">No expenses logged this month.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
