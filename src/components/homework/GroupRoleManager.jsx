import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Crown, Shield, User, UserMinus, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function GroupRoleManager({ group, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState(null);

  const isAdmin = group.creator_email === currentUserEmail;
  const isModerator = group.member_roles?.[currentUserEmail] === 'moderator';

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberEmail, newRole }) => {
      const updatedRoles = { ...(group.member_roles || {}), [memberEmail]: newRole };
      return await base44.entities.StudyGroup.update(group.id, {
        member_roles: updatedRoles
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('👑 Role updated!');
      setSelectedMember(null);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberEmail) => {
      const updatedMembers = group.member_emails.filter(e => e !== memberEmail);
      const updatedRoles = { ...group.member_roles };
      delete updatedRoles[memberEmail];

      return await base44.entities.StudyGroup.update(group.id, {
        member_emails: updatedMembers,
        member_count: updatedMembers.length,
        member_roles: updatedRoles
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('Member removed');
      setSelectedMember(null);
    }
  });

  const getRoleIcon = (email) => {
    if (group.creator_email === email) return <Crown className="w-4 h-4 text-yellow-600" />;
    if (group.member_roles?.[email] === 'moderator') return <Shield className="w-4 h-4 text-blue-600" />;
    return <User className="w-4 h-4 text-gray-600" />;
  };

  const getRoleBadge = (email) => {
    if (group.creator_email === email) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
    }
    if (group.member_roles?.[email] === 'moderator') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><Shield className="w-3 h-3 mr-1" />Moderator</Badge>;
    }
    return <Badge variant="outline" className="border-gray-300">Member</Badge>;
  };

  if (!isAdmin && !isModerator) {
    return null; // Only admins and moderators can manage roles
  }

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Member Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.member_emails?.map((memberEmail, idx) => (
          <motion.div
            key={memberEmail}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                {memberEmail[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{memberEmail}</p>
                {getRoleBadge(memberEmail)}
              </div>
            </div>

            {isAdmin && memberEmail !== group.creator_email && (
              <div className="flex items-center gap-2">
                {group.member_roles?.[memberEmail] !== 'moderator' ? (
                  <Button
                    onClick={() => updateRoleMutation.mutate({ memberEmail, newRole: 'moderator' })}
                    disabled={updateRoleMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Make Mod
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateRoleMutation.mutate({ memberEmail, newRole: 'member' })}
                    disabled={updateRoleMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Remove Mod
                  </Button>
                )}
                
                <Button
                  onClick={() => removeMemberMutation.mutate(memberEmail)}
                  disabled={removeMemberMutation.isPending}
                  size="sm"
                  variant="outline"
                  className="border-red-300 hover:bg-red-50 text-red-600"
                >
                  <UserMinus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}

        {/* Permissions Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Moderator Permissions:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Schedule study sessions
            </li>
            <li className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Manage shared materials
            </li>
            <li className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Moderate discussions
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}