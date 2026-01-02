import React, { useState } from 'react';
import { FamilyMember } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Palette } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#059669' },
];

const COMMON_EMOJIS = [
  '👨', '👩', '👦', '👧', '👶', '👴', '👵',
  '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
  '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
  '⭐', '💖', '🌟', '✨', '🌈', '🎈', '🎉',
  '🚀', '⚡', '🔥', '💫', '🌸', '🌺', '🌻'
];

export default function AddMemberForm({ onMemberAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'AdultMember',
    age: '',
    phone_number: '',
    email: '',
    color: '#3b82f6',
    emoji: '👤'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const memberData = {
        name: formData.name,
        role: formData.role,
        color: formData.color,
        emoji: formData.emoji,
        invitation_status: 'not_invited'
      };

      if (formData.age) memberData.age = parseInt(formData.age);
      if (formData.phone_number) memberData.phone_number = formData.phone_number;
      if (formData.email) memberData.email = formData.email;

      await FamilyMember.create(memberData);
      
      toast.success('Family member added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        role: 'AdultMember',
        age: '',
        phone_number: '',
        email: '',
        color: '#3b82f6',
        emoji: '👤'
      });

      if (onMemberAdded) onMemberAdded();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add Family Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PlatformFounder">Platform Founder</SelectItem>
                  <SelectItem value="FamilyAdmin">Family Admin</SelectItem>
                  <SelectItem value="ParentGuardian">Parent/Guardian</SelectItem>
                  <SelectItem value="AdultMember">Adult Member</SelectItem>
                  <SelectItem value="TeenMember">Teen Member</SelectItem>
                  <SelectItem value="ChildMember">Child Member</SelectItem>
                  <SelectItem value="GuestCaregiver">Guest Caregiver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Age"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
            />
          </div>

          {/* Color and Emoji Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Member Color
              </Label>
              <div className="flex gap-2 items-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
              
              {showColorPicker && (
                <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-xl border">
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, color: color.value });
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Label>Member Emoji</Label>
              <div className="flex gap-2 items-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-2xl shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  {formData.emoji}
                </button>
                <span className="text-sm text-gray-600">Click to change</span>
              </div>
              
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-xl border max-w-[280px]">
                  <div className="grid grid-cols-7 gap-2 max-h-[200px] overflow-y-auto">
                    {COMMON_EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, emoji });
                          setShowEmojiPicker(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}