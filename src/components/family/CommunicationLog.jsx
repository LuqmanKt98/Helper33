
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  MessageCircle,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Trophy,
  HelpCircle,
  Star,
  Lightbulb,
  Filter,
  Calendar,
  User,
  X,
  Send,
  Search,
  SortAsc,
  SortDesc,
  Target,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationLog({
  childProgress,
  onUpdateProgress,
  currentUser,
  currentGuardian
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    entry_type: 'observation',
    visibility: 'parent_only',
    priority: 'medium',
    action_required: false,
    related_module: '',
    related_goal_id: '',
    tags: []
  });
  const [selectedEntry, setSelectedEntry] = useState(null);

  const communicationLog = childProgress?.communication_log || [];
  const canAddCommunication = currentGuardian?.permissions?.can_add_communication || currentGuardian?.role === 'primary';
  const canViewPrivateNotes = currentGuardian?.permissions?.can_view_private_notes || currentGuardian?.role === 'primary';
  const canDelete = currentGuardian?.permissions?.can_delete_entries || currentGuardian?.role === 'primary';

  const handleAddEntry = () => {
    if (!canAddCommunication) {
      toast.error('You do not have permission to add communication entries');
      return;
    }

    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    const entry = {
      log_id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author_name: currentUser?.full_name || 'Guardian',
      author_email: currentUser?.email || '',
      ...newEntry,
      child_acknowledged: false,
      action_completed: false
    };

    const updatedLog = [...communicationLog, entry];

    onUpdateProgress({
      communication_log: updatedLog
    });

    setNewEntry({
      title: '',
      content: '',
      entry_type: 'observation',
      visibility: 'parent_only',
      priority: 'medium',
      action_required: false,
      related_module: '',
      related_goal_id: '',
      tags: []
    });

    setShowAddForm(false);
    toast.success('Log entry added!');
  };

  const handleToggleAcknowledge = (logId) => {
    const updatedLog = communicationLog.map(entry =>
      entry.log_id === logId
        ? { ...entry, child_acknowledged: !entry.child_acknowledged }
        : entry
    );

    onUpdateProgress({ communication_log: updatedLog });
  };

  const handleToggleAction = (logId) => {
    const updatedLog = communicationLog.map(entry =>
      entry.log_id === logId
        ? { ...entry, action_completed: !entry.action_completed }
        : entry
    );

    onUpdateProgress({ communication_log: updatedLog });
  };

  const handleDeleteEntry = (logId) => {
    const entry = communicationLog.find(e => e.log_id === logId);
    
    if (!canDelete && entry?.author_email !== currentUser?.email) {
      toast.error('You can only delete your own entries');
      return;
    }

    const updatedLog = communicationLog.filter(entry => entry.log_id !== logId);
    onUpdateProgress({ communication_log: updatedLog });
    toast.success('Entry deleted');
  };

  const handleAddGuardianReaction = (logId, reaction, comment = '') => {
    const updatedLog = communicationLog.map(entry => {
      if (entry.log_id === logId) {
        const existingReactions = entry.guardian_reactions || [];
        const alreadyReacted = existingReactions.find(r => r.guardian_email === currentUser?.email);
        
        let newReactions;
        if (alreadyReacted) {
          newReactions = existingReactions.map(r =>
            r.guardian_email === currentUser?.email
              ? { ...r, reaction, comment, timestamp: new Date().toISOString() }
              : r
          );
        } else {
          newReactions = [
            ...existingReactions,
            {
              guardian_email: currentUser?.email,
              guardian_name: currentUser?.full_name,
              reaction,
              comment,
              timestamp: new Date().toISOString()
            }
          ];
        }
        
        return { ...entry, guardian_reactions: newReactions };
      }
      return entry;
    });

    onUpdateProgress({ communication_log: updatedLog });
    toast.success('Reaction added!');
  };

  // Filter and sort entries
  const filteredAndSortedEntries = communicationLog
    .filter(entry => {
      if (filterType !== 'all' && entry.entry_type !== filterType) return false;
      if (searchTerm && !entry.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !entry.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const entryTypeIcons = {
    observation: Eye,
    concern: AlertCircle,
    celebration: Trophy,
    request: HelpCircle,
    milestone: Star,
    question: HelpCircle,
    feedback: MessageCircle,
    note: Lightbulb
  };

  const entryTypeColors = {
    observation: 'from-blue-50 to-cyan-50 border-blue-300',
    concern: 'from-orange-50 to-red-50 border-orange-300',
    celebration: 'from-yellow-50 to-amber-50 border-yellow-300',
    request: 'from-purple-50 to-pink-50 border-purple-300',
    milestone: 'from-green-50 to-emerald-50 border-green-300',
    question: 'from-indigo-50 to-blue-50 border-indigo-300',
    feedback: 'from-pink-50 to-rose-50 border-pink-300',
    note: 'from-gray-50 to-slate-50 border-gray-300'
  };

  const visibilityLabels = {
    parent_only: { label: 'Parent Only', icon: EyeOff, color: 'gray' },
    shared_with_child: { label: 'Shared with Child', icon: Eye, color: 'green' },
    shared_with_mentors: { label: 'Shared with Teachers/Mentors', icon: User, color: 'blue' },
    shared_with_all: { label: 'Shared with Everyone', icon: User, color: 'purple' }
  };

  // Filter out private notes if user doesn't have permission
  const visibleEntries = filteredAndSortedEntries.filter(entry => {
    if (entry.visibility === 'parent_only' && !canViewPrivateNotes && entry.author_email !== currentUser?.email) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Permission Notice */}
      {!canAddCommunication && (
        <Card className="bg-blue-50 border-2 border-blue-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">View-Only Access</p>
                <p className="text-xs text-blue-700">
                  You can view communication logs but cannot add new entries. Contact the primary guardian to request access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Communication Log
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Document observations, set expectations, and communicate with {childProgress?.child_name}
          </p>
        </div>
        {canAddCommunication && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        )}
      </div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showAddForm && canAddCommunication && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Sparkles className="w-5 h-5" />
                  New Log Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Entry Type & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Entry Type</Label>
                    <Select value={newEntry.entry_type} onValueChange={(val) => setNewEntry({...newEntry, entry_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observation">📝 Observation</SelectItem>
                        <SelectItem value="concern">⚠️ Concern</SelectItem>
                        <SelectItem value="celebration">🎉 Celebration</SelectItem>
                        <SelectItem value="request">🙏 Request</SelectItem>
                        <SelectItem value="milestone">⭐ Milestone</SelectItem>
                        <SelectItem value="question">❓ Question</SelectItem>
                        <SelectItem value="feedback">💬 Feedback</SelectItem>
                        <SelectItem value="note">💡 Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Priority</Label>
                    <Select value={newEntry.priority} onValueChange={(val) => setNewEntry({...newEntry, priority: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">Title *</Label>
                  <Input
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    placeholder="E.g., 'Great progress in math today!'"
                    className="border-purple-200"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">Details *</Label>
                  <Textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    placeholder="Describe what you observed, your concern, or what you want to celebrate..."
                    rows={4}
                    className="border-purple-200"
                  />
                </div>

                {/* Related Module & Goal */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Related Module (Optional)</Label>
                    <Select value={newEntry.related_module} onValueChange={(val) => setNewEntry({...newEntry, related_module: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="letters">Letters</SelectItem>
                        <SelectItem value="shapes">Shapes</SelectItem>
                        <SelectItem value="creative_writing">Creative Writing</SelectItem>
                        <SelectItem value="journal">Journal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Related Goal (Optional)</Label>
                    <Select value={newEntry.related_goal_id} onValueChange={(val) => setNewEntry({...newEntry, related_goal_id: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {childProgress?.learning_goals?.filter(g => g.status === 'active').map(goal => (
                          <SelectItem key={goal.goal_id} value={goal.goal_id}>
                            {goal.description.substring(0, 40)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Visibility Settings */}
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <Label className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Who Can See This?
                  </Label>
                  <Select value={newEntry.visibility} onValueChange={(val) => setNewEntry({...newEntry, visibility: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent_only">
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          <span>Parent Only - Private notes</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="shared_with_child">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-600" />
                          <span>Share with {childProgress?.child_name}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="shared_with_mentors">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Share with Teachers/Mentors</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="shared_with_all">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span>Share with Everyone</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Sharing with your child promotes transparency and mutual understanding of learning goals
                  </p>
                </div>

                {/* Action Required */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="action"
                    checked={newEntry.action_required}
                    onCheckedChange={(checked) => setNewEntry({...newEntry, action_required: checked})}
                  />
                  <Label htmlFor="action" className="text-sm text-gray-700 cursor-pointer">
                    This requires follow-up action
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddEntry}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Add to Log
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <Card className="bg-white/80 border border-purple-200">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
                className="pl-10 border-purple-200"
              />
            </div>

            {/* Filter by Type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-purple-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="observation">Observations</SelectItem>
                <SelectItem value="concern">Concerns</SelectItem>
                <SelectItem value="celebration">Celebrations</SelectItem>
                <SelectItem value="request">Requests</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="border-purple-200">
                {sortOrder === 'newest' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{visibleEntries.length} entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <div className="space-y-3">
        {visibleEntries.length === 0 ? (
          <Card className="p-8 text-center bg-white/80">
            <MessageCircle className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No log entries yet</p>
            <p className="text-sm text-gray-500">Start documenting {childProgress?.child_name}'s learning journey!</p>
          </Card>
        ) : (
          visibleEntries.map((entry, idx) => {
            const Icon = entryTypeIcons[entry.entry_type];
            const VisibilityIcon = visibilityLabels[entry.visibility].icon;
            const isOwnEntry = entry.author_email === currentUser?.email;
            
            return (
              <motion.div
                key={entry.log_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`bg-gradient-to-br ${entryTypeColors[entry.entry_type]} border-2 hover:shadow-lg transition-all`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${
                          entry.priority === 'urgent' ? 'ring-2 ring-red-500' : ''
                        }`}>
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-800">{entry.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {entry.entry_type}
                            </Badge>
                            {entry.priority === 'urgent' && (
                              <Badge className="bg-red-500 text-white">URGENT</Badge>
                            )}
                            {entry.priority === 'high' && (
                              <Badge className="bg-orange-500 text-white">High Priority</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                              <span className="text-gray-400">•</span>
                              <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{entry.author_name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(isOwnEntry || canDelete) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteEntry(entry.log_id)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{entry.content}</p>
                    </div>

                    {/* Related Info */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {entry.related_module && (
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                          Module: {entry.related_module}
                        </Badge>
                      )}
                      {entry.related_goal_id && (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                          <Target className="w-3 h-3 mr-1" />
                          Linked to Goal
                        </Badge>
                      )}
                    </div>

                    {/* Guardian Reactions - NEW */}
                    {entry.guardian_reactions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Guardian Reactions:</p>
                        <div className="space-y-2">
                          {entry.guardian_reactions.map((reaction, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-2 bg-white/60 rounded p-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                {reaction.guardian_name?.charAt(0) || 'G'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-800">{reaction.guardian_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {reaction.reaction}
                                  </Badge>
                                </div>
                                {reaction.comment && (
                                  <p className="text-xs text-gray-700 mt-1">{reaction.comment}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Reactions for Other Guardians */}
                    {!isOwnEntry && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddGuardianReaction(entry.log_id, 'acknowledged')}
                            className="border-blue-300"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Seen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddGuardianReaction(entry.log_id, 'agreed')}
                            className="border-green-300"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Agree
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddGuardianReaction(entry.log_id, 'helpful')}
                            className="border-yellow-300"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Helpful
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Visibility & Status */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`flex items-center gap-1 text-xs text-${visibilityLabels[entry.visibility].color}-700`}>
                          <VisibilityIcon className="w-3 h-3" />
                          <span>{visibilityLabels[entry.visibility].label}</span>
                        </div>

                        {entry.visibility === 'shared_with_child' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAcknowledge(entry.log_id)}
                            className={entry.child_acknowledged ? 'text-green-600' : 'text-gray-500'}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {entry.child_acknowledged ? 'Child saw this' : 'Not seen yet'}
                          </Button>
                        )}

                        {entry.action_required && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAction(entry.log_id)}
                            className={entry.action_completed ? 'text-green-600' : 'text-orange-600'}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {entry.action_completed ? 'Action Complete' : 'Action Needed'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Child Response */}
                    {entry.child_response && (
                      <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs font-semibold text-green-800 mb-1">
                          {childProgress?.child_name}'s Response:
                        </p>
                        <p className="text-sm text-gray-700">{entry.child_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {communicationLog.filter(e => e.entry_type === 'celebration').length}
              </div>
              <div className="text-xs text-gray-600">Celebrations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">
                {communicationLog.filter(e => e.action_required && !e.action_completed).length}
              </div>
              <div className="text-xs text-gray-600">Actions Needed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {communicationLog.filter(e => e.visibility === 'shared_with_child').length}
              </div>
              <div className="text-xs text-gray-600">Shared with Child</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {communicationLog.filter(e => e.child_acknowledged).length}
              </div>
              <div className="text-xs text-gray-600">Child Acknowledged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
