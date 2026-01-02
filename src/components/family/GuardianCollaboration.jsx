import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Check,
  Clock,
  Eye,
  Edit,
  Trash2,
  Crown,
  Award,
  BookOpen,
  Heart,
  Settings,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function GuardianCollaboration({
  childProgress,
  onUpdateProgress,
  currentUserEmail
}) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    guardian_email: '',
    guardian_name: '',
    role: 'secondary',
    permissions: {
      can_edit_goals: true,
      can_add_communication: true,
      can_view_private_notes: false,
      can_manage_guardians: false,
      can_delete_entries: false
    }
  });
  const [showPermissionsModal, setShowPermissionsModal] = useState(null);

  const guardians = childProgress?.guardians || [];
  const currentGuardian = guardians.find(g => g.guardian_email === currentUserEmail);
  const isPrimary = currentGuardian?.role === 'primary';
  const canManageGuardians = currentGuardian?.permissions?.can_manage_guardians || isPrimary;

  const roleInfo = {
    primary: {
      label: 'Primary Guardian',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      description: 'Full access and control'
    },
    secondary: {
      label: 'Secondary Guardian',
      icon: Shield,
      color: 'from-blue-500 to-indigo-500',
      description: 'Collaborative access'
    },
    mentor: {
      label: 'Mentor/Teacher',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      description: 'Educational guidance'
    },
    teacher: {
      label: 'Teacher',
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      description: 'Academic support'
    },
    therapist: {
      label: 'Therapist',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'Professional support'
    },
    family_member: {
      label: 'Family Member',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      description: 'Family support'
    }
  };

  const handleInviteGuardian = () => {
    if (!inviteData.guardian_email.trim() || !inviteData.guardian_name.trim()) {
      toast.error('Please fill in name and email');
      return;
    }

    // Check if already invited
    if (guardians.some(g => g.guardian_email === inviteData.guardian_email)) {
      toast.error('This person is already a guardian');
      return;
    }

    const newGuardian = {
      guardian_id: `guardian-${Date.now()}`,
      guardian_email: inviteData.guardian_email,
      guardian_name: inviteData.guardian_name,
      role: inviteData.role,
      permissions: inviteData.permissions,
      added_by: currentUserEmail,
      added_date: new Date().toISOString(),
      invitation_status: 'pending',
      notification_preferences: {
        goal_updates: true,
        milestone_alerts: true,
        communication_alerts: true,
        weekly_summary: true
      }
    };

    const updatedGuardians = [...guardians, newGuardian];

    onUpdateProgress({
      guardians: updatedGuardians
    });

    // TODO: Send email invitation
    toast.success(`Invitation sent to ${inviteData.guardian_name}!`);

    setInviteData({
      guardian_email: '',
      guardian_name: '',
      role: 'secondary',
      permissions: {
        can_edit_goals: true,
        can_add_communication: true,
        can_view_private_notes: false,
        can_manage_guardians: false,
        can_delete_entries: false
      }
    });
    setShowInviteForm(false);
  };

  const handleUpdatePermissions = (guardianId, newPermissions) => {
    const updatedGuardians = guardians.map(g =>
      g.guardian_id === guardianId
        ? { ...g, permissions: newPermissions }
        : g
    );

    onUpdateProgress({ guardians: updatedGuardians });
    setShowPermissionsModal(null);
    toast.success('Permissions updated');
  };

  const handleRemoveGuardian = (guardianId) => {
    const guardian = guardians.find(g => g.guardian_id === guardianId);
    
    if (!canManageGuardians) {
      toast.error('You do not have permission to remove guardians');
      return;
    }

    if (guardian?.role === 'primary') {
      toast.error('Cannot remove primary guardian');
      return;
    }

    const updatedGuardians = guardians.filter(g => g.guardian_id !== guardianId);
    onUpdateProgress({ guardians: updatedGuardians });
    toast.success('Guardian removed');
  };

  const handleUpdateRole = (guardianId, newRole) => {
    if (!canManageGuardians) {
      toast.error('You do not have permission to change roles');
      return;
    }

    const updatedGuardians = guardians.map(g =>
      g.guardian_id === guardianId
        ? { ...g, role: newRole }
        : g
    );

    onUpdateProgress({ guardians: updatedGuardians });
    toast.success('Role updated');
  };

  const getDefaultPermissionsForRole = (role) => {
    switch (role) {
      case 'primary':
        return {
          can_edit_goals: true,
          can_add_communication: true,
          can_view_private_notes: true,
          can_manage_guardians: true,
          can_delete_entries: true
        };
      case 'secondary':
        return {
          can_edit_goals: true,
          can_add_communication: true,
          can_view_private_notes: false,
          can_manage_guardians: false,
          can_delete_entries: false
        };
      case 'mentor':
      case 'teacher':
        return {
          can_edit_goals: false,
          can_add_communication: true,
          can_view_private_notes: false,
          can_manage_guardians: false,
          can_delete_entries: false
        };
      case 'therapist':
        return {
          can_edit_goals: false,
          can_add_communication: true,
          can_view_private_notes: true,
          can_manage_guardians: false,
          can_delete_entries: false
        };
      case 'family_member':
        return {
          can_edit_goals: false,
          can_add_communication: false,
          can_view_private_notes: false,
          can_manage_guardians: false,
          can_delete_entries: false
        };
      default:
        return inviteData.permissions;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Guardian Team
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Collaborate with other guardians on {childProgress?.child_name}'s learning journey
          </p>
        </div>
        {canManageGuardians && (
          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Guardian
          </Button>
        )}
      </div>

      {/* Invite Form */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Sparkles className="w-5 h-5" />
                  Invite Guardian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Name *</Label>
                    <Input
                      value={inviteData.guardian_name}
                      onChange={(e) => setInviteData({...inviteData, guardian_name: e.target.value})}
                      placeholder="Guardian's name"
                      className="border-purple-200"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Email *</Label>
                    <Input
                      type="email"
                      value={inviteData.guardian_email}
                      onChange={(e) => setInviteData({...inviteData, guardian_email: e.target.value})}
                      placeholder="guardian@example.com"
                      className="border-purple-200"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">Role</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(val) => setInviteData({
                      ...inviteData, 
                      role: val,
                      permissions: getDefaultPermissionsForRole(val)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secondary">👥 Secondary Guardian - Co-parent</SelectItem>
                      <SelectItem value="mentor">🎓 Mentor/Teacher</SelectItem>
                      <SelectItem value="teacher">📚 Teacher</SelectItem>
                      <SelectItem value="therapist">💚 Therapist</SelectItem>
                      <SelectItem value="family_member">👨‍👩‍👧 Family Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">
                    {roleInfo[inviteData.role]?.description}
                  </p>
                </div>

                {/* Permissions */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200 space-y-3">
                  <Label className="font-semibold text-purple-800">Permissions</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="edit_goals"
                        checked={inviteData.permissions.can_edit_goals}
                        onCheckedChange={(checked) => setInviteData({
                          ...inviteData,
                          permissions: {...inviteData.permissions, can_edit_goals: checked}
                        })}
                      />
                      <Label htmlFor="edit_goals" className="text-sm cursor-pointer">
                        Can set and edit learning goals
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="add_communication"
                        checked={inviteData.permissions.can_add_communication}
                        onCheckedChange={(checked) => setInviteData({
                          ...inviteData,
                          permissions: {...inviteData.permissions, can_add_communication: checked}
                        })}
                      />
                      <Label htmlFor="add_communication" className="text-sm cursor-pointer">
                        Can add to communication log
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="view_private"
                        checked={inviteData.permissions.can_view_private_notes}
                        onCheckedChange={(checked) => setInviteData({
                          ...inviteData,
                          permissions: {...inviteData.permissions, can_view_private_notes: checked}
                        })}
                      />
                      <Label htmlFor="view_private" className="text-sm cursor-pointer">
                        Can view private parent-only notes
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="manage_guardians"
                        checked={inviteData.permissions.can_manage_guardians}
                        onCheckedChange={(checked) => setInviteData({
                          ...inviteData,
                          permissions: {...inviteData.permissions, can_manage_guardians: checked}
                        })}
                      />
                      <Label htmlFor="manage_guardians" className="text-sm cursor-pointer">
                        Can invite and manage other guardians
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="delete_entries"
                        checked={inviteData.permissions.can_delete_entries}
                        onCheckedChange={(checked) => setInviteData({
                          ...inviteData,
                          permissions: {...inviteData.permissions, can_delete_entries: checked}
                        })}
                      />
                      <Label htmlFor="delete_entries" className="text-sm cursor-pointer">
                        Can delete communication log entries
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleInviteGuardian}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Guardians */}
      <div className="grid md:grid-cols-2 gap-4">
        {guardians.map((guardian, idx) => {
          const RoleIcon = roleInfo[guardian.role]?.icon || Users;
          const isCurrentUser = guardian.guardian_email === currentUserEmail;
          
          return (
            <motion.div
              key={guardian.guardian_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-2 ${
                isCurrentUser ? 'border-purple-400 bg-purple-50/50' : 'border-gray-200 bg-white'
              }`}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleInfo[guardian.role]?.color} flex items-center justify-center flex-shrink-0`}>
                        <RoleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{guardian.guardian_name}</h3>
                          {isCurrentUser && (
                            <Badge className="bg-purple-600 text-white">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{guardian.guardian_email}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {roleInfo[guardian.role]?.label}
                        </Badge>
                      </div>
                    </div>

                    {canManageGuardians && !isCurrentUser && guardian.role !== 'primary' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveGuardian(guardian.guardian_id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-3">
                    {guardian.invitation_status === 'pending' ? (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        <Clock className="w-3 h-3 mr-1" />
                        Invitation Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}

                    {guardian.last_viewed && (
                      <span className="text-xs text-gray-500">
                        Last seen: {new Date(guardian.last_viewed).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Permissions Summary */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {guardian.permissions?.can_edit_goals && (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Goals
                        </Badge>
                      )}
                      {guardian.permissions?.can_add_communication && (
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Add Logs
                        </Badge>
                      )}
                      {guardian.permissions?.can_view_private_notes && (
                        <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                          <Eye className="w-3 h-3 mr-1" />
                          Private Notes
                        </Badge>
                      )}
                      {guardian.permissions?.can_manage_guardians && (
                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                          <Shield className="w-3 h-3 mr-1" />
                          Manage Team
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageGuardians && !isCurrentUser && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPermissionsModal(guardian)}
                        className="flex-1 border-purple-300"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Permissions
                      </Button>
                      {guardian.role !== 'primary' && (
                        <Select 
                          value={guardian.role} 
                          onValueChange={(val) => handleUpdateRole(guardian.guardian_id, val)}
                        >
                          <SelectTrigger className="flex-1 border-purple-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="therapist">Therapist</SelectItem>
                            <SelectItem value="family_member">Family</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Collaboration Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {guardians.length}
              </div>
              <div className="text-xs text-gray-600">Total Guardians</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {guardians.filter(g => g.invitation_status === 'accepted').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">
                {guardians.filter(g => g.invitation_status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {guardians.filter(g => g.permissions?.can_edit_goals).length}
              </div>
              <div className="text-xs text-gray-600">Can Edit Goals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      <AnimatePresence>
        {showPermissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPermissionsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Edit Permissions for {showPermissionsModal.guardian_name}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="perm_edit_goals"
                    checked={showPermissionsModal.permissions?.can_edit_goals}
                    onCheckedChange={(checked) => setShowPermissionsModal({
                      ...showPermissionsModal,
                      permissions: {...showPermissionsModal.permissions, can_edit_goals: checked}
                    })}
                  />
                  <Label htmlFor="perm_edit_goals" className="text-sm cursor-pointer">
                    Can set and edit learning goals
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="perm_add_comm"
                    checked={showPermissionsModal.permissions?.can_add_communication}
                    onCheckedChange={(checked) => setShowPermissionsModal({
                      ...showPermissionsModal,
                      permissions: {...showPermissionsModal.permissions, can_add_communication: checked}
                    })}
                  />
                  <Label htmlFor="perm_add_comm" className="text-sm cursor-pointer">
                    Can add to communication log
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="perm_view_private"
                    checked={showPermissionsModal.permissions?.can_view_private_notes}
                    onCheckedChange={(checked) => setShowPermissionsModal({
                      ...showPermissionsModal,
                      permissions: {...showPermissionsModal.permissions, can_view_private_notes: checked}
                    })}
                  />
                  <Label htmlFor="perm_view_private" className="text-sm cursor-pointer">
                    Can view private parent-only notes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="perm_manage"
                    checked={showPermissionsModal.permissions?.can_manage_guardians}
                    onCheckedChange={(checked) => setShowPermissionsModal({
                      ...showPermissionsModal,
                      permissions: {...showPermissionsModal.permissions, can_manage_guardians: checked}
                    })}
                  />
                  <Label htmlFor="perm_manage" className="text-sm cursor-pointer">
                    Can invite and manage other guardians
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="perm_delete"
                    checked={showPermissionsModal.permissions?.can_delete_entries}
                    onCheckedChange={(checked) => setShowPermissionsModal({
                      ...showPermissionsModal,
                      permissions: {...showPermissionsModal.permissions, can_delete_entries: checked}
                    })}
                  />
                  <Label htmlFor="perm_delete" className="text-sm cursor-pointer">
                    Can delete communication entries
                  </Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdatePermissions(showPermissionsModal.guardian_id, showPermissionsModal.permissions)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowPermissionsModal(null)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}