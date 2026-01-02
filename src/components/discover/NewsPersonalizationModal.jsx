import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { MapPin, Target, Heart, Trash2, Plus } from 'lucide-react';

const availableCategories = [
  "Technology", "Health", "Wellness", "Business", "Science", 
  "Lifestyle", "Community", "World", "Entertainment", "Sports"
];

export default function NewsPersonalizationModal({ isOpen, onClose, currentSettings, onSave }) {
  const [settings, setSettings] = useState({
    preferred_categories: [],
    location: '',
    interests: [],
    life_goals: [],
    news_frequency: 'medium',
    include_trending: true,
    include_local: true
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        preferred_categories: currentSettings.preferred_categories || [],
        location: currentSettings.location || '',
        interests: currentSettings.interests || [],
        life_goals: currentSettings.life_goals || [],
        news_frequency: currentSettings.news_frequency || 'medium',
        include_trending: currentSettings.include_trending ?? true,
        include_local: currentSettings.include_local ?? true
      });
    }
  }, [currentSettings]);

  const toggleCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(category)
        ? prev.preferred_categories.filter(c => c !== category)
        : [...prev.preferred_categories, category]
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !settings.interests.includes(newInterest.trim())) {
      setSettings(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addGoal = () => {
    if (newGoal.trim() && !settings.life_goals.includes(newGoal.trim())) {
      setSettings(prev => ({
        ...prev,
        life_goals: [...prev.life_goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (goal) => {
    setSettings(prev => ({
      ...prev,
      life_goals: prev.life_goals.filter(g => g !== goal)
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Personalize Your News Feed</DialogTitle>
          <DialogDescription>
            Customize your news experience based on your interests, location, and life goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* News Categories */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Preferred News Categories</Label>
            <p className="text-sm text-gray-600 mb-4">Select the topics you're most interested in</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableCategories.map(category => (
                <Button
                  key={category}
                  variant={settings.preferred_categories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="justify-start h-auto py-3"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-base font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (Optional)
            </Label>
            <p className="text-sm text-gray-600 mb-3">Get local news relevant to your area</p>
            <Input
              id="location"
              placeholder="e.g., New York, NY or San Francisco, CA"
              value={settings.location}
              onChange={(e) => setSettings(prev => ({...prev, location: e.target.value}))}
            />
          </div>

          {/* Interests */}
          <div>
            <Label className="text-base font-semibold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Specific Interests & Niches
            </Label>
            <p className="text-sm text-gray-600 mb-3">Add topics you're passionate about</p>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., AI, cooking, meditation, startups..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {settings.interests.map(interest => (
                <Badge key={interest} variant="secondary" className="px-3 py-1">
                  {interest}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Life Goals */}
          <div>
            <Label className="text-base font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Life Goals & Aspirations
            </Label>
            <p className="text-sm text-gray-600 mb-3">Get news that relates to your personal and professional goals</p>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., start a business, improve health, learn new skills..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              />
              <Button onClick={addGoal} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {settings.life_goals.map(goal => (
                <Badge key={goal} variant="secondary" className="px-3 py-1">
                  {goal}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* News Preferences */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="frequency" className="text-base font-semibold mb-2 block">
                News Frequency
              </Label>
              <Select value={settings.news_frequency} onValueChange={(value) => 
                setSettings(prev => ({...prev, news_frequency: value}))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (15 articles)</SelectItem>
                  <SelectItem value="medium">Medium (25 articles)</SelectItem>
                  <SelectItem value="high">High (30+ articles)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="trending">Include Trending News</Label>
                <p className="text-xs text-gray-600">Show the top trending stories of the day</p>
              </div>
              <Switch
                id="trending"
                checked={settings.include_trending}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, include_trending: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="local">Include Local News</Label>
                <p className="text-xs text-gray-600">Show news relevant to your location</p>
              </div>
              <Switch
                id="local"
                checked={settings.include_local}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, include_local: checked}))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}