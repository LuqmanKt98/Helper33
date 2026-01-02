
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Heart,
  Target,
  Users,
  Home,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  Settings,
  X,
  Printer,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TemplatePreview from '../components/templates/TemplatePreview';

export default function LifeTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [customSectionInput, setCustomSectionInput] = useState(''); // New state for custom section input

  const [customization, setCustomization] = useState({
    personalInfo: {
      name: '',
      email: '',
      familySize: '1',
      primaryGoal: ''
    },
    preferences: {
      complexity: 'intermediate',
      updateFrequency: 'weekly',
      includeGoals: true,
      includeTracking: true
    },
    customSections: []
  });

  const templateCategories = {
    financial: {
      title: 'Financial Management',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      templates: [
        {
          id: 'monthly-budget',
          title: 'Monthly Budget Planner',
          description: 'Track income, expenses, and savings goals with customizable categories',
          difficulty: 'Beginner',
          time: '30 minutes',
          sections: ['Income Sources', 'Fixed Expenses', 'Variable Expenses', 'Savings Goals', 'Notes']
        },
        {
          id: 'debt-payoff',
          title: 'Debt Payoff Strategy',
          description: 'Plan your debt elimination with snowball or avalanche methods',
          difficulty: 'Intermediate',
          time: '45 minutes',
          sections: ['Debt List', 'Payment Strategy', 'Progress Tracking', 'Milestones', 'Monthly Review']
        },
        {
          id: 'emergency-fund',
          title: 'Emergency Fund Builder',
          description: 'Build your financial safety net with systematic saving',
          difficulty: 'Beginner',
          time: '20 minutes',
          sections: ['Current Savings', 'Target Amount', 'Monthly Contributions', 'Timeline']
        }
      ]
    },
    health: {
      title: 'Health & Wellness',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      templates: [
        {
          id: 'meal-prep',
          title: 'Weekly Meal Prep Planner',
          description: 'Plan nutritious meals, create shopping lists, and prep schedules',
          difficulty: 'Intermediate',
          time: '60 minutes',
          sections: ['Meal Planning', 'Shopping List', 'Prep Schedule', 'Nutrition Tracking', 'Recipe Notes']
        },
        {
          id: 'fitness-routine',
          title: 'Personal Fitness Plan',
          description: 'Create a sustainable workout routine based on your goals',
          difficulty: 'Beginner',
          time: '40 minutes',
          sections: ['Fitness Goals', 'Weekly Schedule', 'Exercise Library', 'Progress Log']
        }
      ]
    },
    personal: {
      title: 'Personal Development',
      icon: Target,
      color: 'from-blue-500 to-indigo-600',
      templates: [
        {
          id: 'goal-setting',
          title: 'SMART Goals Framework',
          description: 'Set and track meaningful personal and professional goals',
          difficulty: 'Intermediate',
          time: '50 minutes',
          sections: ['Goal Categories', 'SMART Criteria', 'Action Plans', 'Progress Reviews', 'Reflection']
        },
        {
          id: 'habit-tracker',
          title: 'Daily Habit Builder',
          description: 'Build positive habits and break negative ones systematically',
          difficulty: 'Beginner',
          time: '30 minutes',
          sections: ['Current Habits', 'Target Habits', 'Daily Tracking', 'Weekly Review']
        }
      ]
    },
    family: {
      title: 'Family & Relationships',
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      templates: [
        {
          id: 'family-calendar',
          title: 'Family Activity Planner',
          description: 'Coordinate schedules, activities, and family time',
          difficulty: 'Beginner',
          time: '40 minutes',
          sections: ['Family Members', 'Regular Activities', 'Special Events', 'Notes']
        },
        {
          id: 'chore-chart',
          title: 'Household Chore System',
          description: 'Fair distribution of household tasks with rewards',
          difficulty: 'Beginner',
          time: '25 minutes',
          sections: ['Chore List', 'Assignments', 'Reward System', 'Weekly Rotation']
        }
      ]
    },
    home: {
      title: 'Home & Lifestyle',
      icon: Home,
      color: 'from-orange-500 to-amber-600',
      templates: [
        {
          id: 'moving-checklist',
          title: 'Moving House Checklist',
          description: 'Complete guide for relocating with timeline and tasks',
          difficulty: 'Advanced',
          time: '90 minutes',
          sections: ['8 Weeks Before', '4 Weeks Before', '1 Week Before', 'Moving Day', 'After Move']
        },
        {
          id: 'home-maintenance',
          title: 'Seasonal Home Maintenance',
          description: 'Keep your home in top condition with regular upkeep',
          difficulty: 'Intermediate',
          time: '45 minutes',
          sections: ['Spring Tasks', 'Summer Tasks', 'Fall Tasks', 'Winter Tasks', 'Emergency Contacts']
        }
      ]
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomization({
      personalInfo: { name: '', email: '', familySize: '1', primaryGoal: '' },
      preferences: { complexity: 'intermediate', updateFrequency: 'weekly', includeGoals: true, includeTracking: true },
      customSections: []
    });
    setCustomSectionInput(''); // Reset custom section input on new template selection
    setShowCustomizer(true);
  };

  const handleCustomizationChange = (section, field, value) => {
    setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddCustomSection = () => {
    if (customSectionInput.trim()) {
      setCustomization(prev => ({
        ...prev,
        customSections: [...prev.customSections, customSectionInput.trim()]
      }));
      setCustomSectionInput(''); // Clear the input after adding
    }
  };

  const generateTemplate = () => {
    setGeneratedContent({
      template: selectedTemplate,
      customization: customization
    });
    setShowCustomizer(false);
    setShowDownloadModal(true);
  };

  const copyTemplateLink = () => {
    alert('Template link copied to clipboard!');
  };

  // Get all templates for filtering
  const getAllTemplates = () => {
    if (selectedCategory === 'all') {
      return Object.entries(templateCategories).flatMap(([key, category]) =>
        category.templates.map(t => ({ ...t, category: key, categoryInfo: category }))
      );
    }
    return templateCategories[selectedCategory].templates.map(t => ({
      ...t,
      category: selectedCategory,
      categoryInfo: templateCategories[selectedCategory]
    }));
  };

  // Filter templates
  const filteredTemplates = getAllTemplates().filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-indigo-200 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Life Templates</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Organize Every Aspect of Life</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready-to-print templates for budgeting, planning, and organizing all areas of your life.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="flex-shrink-0"
            >
              All Templates
            </Button>
            {Object.entries(templateCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(key)}
                  className="flex-shrink-0 gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.title}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTemplates.map((template) => {
            const CategoryIcon = template.categoryInfo.icon;
            return (
              <Card key={template.id} className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${template.categoryInfo.color} text-white`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.time}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Includes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.map((section) => (
                        <Badge key={section} variant="secondary" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className={`flex-1 bg-gradient-to-br ${template.categoryInfo.color}`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-1" />
                      Customize & Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No templates found matching your criteria.</p>
          </div>
        )}

        {/* Popular Templates */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Most Popular Templates This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-medium">Monthly Budget Planner</div>
                  <div className="text-sm text-gray-600">2,341 downloads</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-medium">SMART Goals Framework</div>
                  <div className="text-sm text-gray-600">1,892 downloads</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <Heart className="w-8 h-8 text-pink-500" />
                <div>
                  <div className="font-medium">Weekly Meal Prep</div>
                  <div className="text-sm text-gray-600">1,654 downloads</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customizer Modal */}
      {showCustomizer && selectedTemplate && (
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Customize: {selectedTemplate.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Your Information</TabsTrigger>
                  <TabsTrigger value="sections">Custom Sections</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name (Optional)</Label>
                      <Input
                        id="name"
                        value={customization.personalInfo.name}
                        onChange={(e) => handleCustomizationChange('personalInfo', 'name', e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal">Primary Goal (Optional)</Label>
                      <Input
                        id="goal"
                        value={customization.personalInfo.primaryGoal}
                        onChange={(e) => handleCustomizationChange('personalInfo', 'primaryGoal', e.target.value)}
                        placeholder="e.g., Save $10,000"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-4">
                  <div>
                    <Label>Add Custom Sections</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Add personalized sections specific to your needs
                    </p>
                    <Input
                      placeholder="e.g., Pet Care Expenses, Side Hustle Income"
                      value={customSectionInput} // Controlled input
                      onChange={(e) => setCustomSectionInput(e.target.value)} // Update state
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); // Prevent default form submission
                          handleAddCustomSection();
                        }
                      }}
                    />
                    <p className="text-xs text-indigo-600 mt-2">
                      Press Enter to add. You'll fill in details on the preview screen.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {customization.customSections.map((section, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {section}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => {
                              setCustomization(prev => ({
                                ...prev,
                                customSections: prev.customSections.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCustomizer(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={generateTemplate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Printer className="w-4 h-4" />
                  Preview & Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Download Preview Modal */}
      {showDownloadModal && generatedContent && (
        <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <TemplatePreview
              content={generatedContent}
              onClose={() => setShowDownloadModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
