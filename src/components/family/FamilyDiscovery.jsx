
import React, { useState, useEffect, useCallback } from 'react';
import { FamilyProfile, FamilyConnection } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Users, 
  Plus, 
  Camera, 
  UserCheck, 
  UserPlus,
  Baby,
  Clock
} from 'lucide-react';

export default function FamilyDiscovery({ currentUser, familyProfile, onProfileUpdate }) {
  const [nearbyFamilies, setNearbyFamilies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(!familyProfile);
  const [connections, setConnections] = useState([]);
  const [profileForm, setProfileForm] = useState({
    family_name: '',
    bio: '',
    location: '',
    kids_ages: [],
    interests: [],
    current_status: '',
    connection_preference: 'open'
  });

  const loadNearbyFamilies = useCallback(async () => {
    try {
      const families = await FamilyProfile.filter(
        { is_public: true }, 
        '-last_active', 
        20
      );
      setNearbyFamilies(families.filter(f => f.created_by !== currentUser?.email));
    } catch (error) {
      console.log("Error loading families");
    }
  }, [currentUser?.email]);

  const loadConnections = useCallback(async () => {
    try {
      const userConnections = await FamilyConnection.filter(
        {}, 
        '-created_date'
      );
      setConnections(userConnections);
    } catch (error) {
      console.log("Error loading connections");
    }
  }, []);

  useEffect(() => {
    if (familyProfile) {
      setProfileForm(familyProfile);
      setShowCreateProfile(false);
    }
    loadNearbyFamilies();
    loadConnections();
  }, [familyProfile, loadNearbyFamilies, loadConnections]);

  const createFamilyProfile = async (e) => {
    e.preventDefault();
    try {
      if (familyProfile) {
        await FamilyProfile.update(familyProfile.id, profileForm);
      } else {
        await FamilyProfile.create({
          ...profileForm,
          last_active: new Date().toISOString()
        });
      }
      setShowCreateProfile(false);
      onProfileUpdate();
    } catch (error) {
      console.log("Error saving profile");
    }
  };

  const sendConnectionRequest = async (targetFamilyId, note = '') => {
    try {
      await FamilyConnection.create({
        requester_family_id: currentUser.id,
        receiver_family_id: targetFamilyId,
        connection_note: note
      });
      loadConnections();
      alert('Connection request sent! 🤝');
    } catch (error) {
      console.log("Error sending connection request");
    }
  };

  const isConnected = (familyId) => {
    return connections.some(conn => 
      (conn.requester_family_id === familyId || conn.receiver_family_id === familyId) &&
      conn.status === 'accepted'
    );
  };

  const hasPendingRequest = (familyId) => {
    return connections.some(conn => 
      (conn.requester_family_id === familyId || conn.receiver_family_id === familyId) &&
      conn.status === 'pending'
    );
  };

  const filteredFamilies = nearbyFamilies.filter(family =>
    family.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.interests?.some(interest => 
      interest.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8">
      {/* Create/Edit Profile Section */}
      {showCreateProfile && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              {familyProfile ? 'Edit Family Profile' : 'Create Your Family Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createFamilyProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="family-name">Family Name *</Label>
                  <Input
                    id="family-name"
                    value={profileForm.family_name}
                    onChange={(e) => setProfileForm({...profileForm, family_name: e.target.value})}
                    placeholder="The Smith Family"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Family Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  placeholder="Tell other families about yourselves..."
                  className="h-20"
                />
              </div>

              <div>
                <Label htmlFor="status">Current Status</Label>
                <Input
                  id="status"
                  value={profileForm.current_status}
                  onChange={(e) => setProfileForm({...profileForm, current_status: e.target.value})}
                  placeholder="Looking for playdates, new to the area, etc."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {familyProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
                {familyProfile && (
                  <Button type="button" variant="outline" onClick={() => setShowCreateProfile(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Profile Display */}
      {familyProfile && !showCreateProfile && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {familyProfile.family_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{familyProfile.family_name}</h3>
                  {familyProfile.location && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {familyProfile.location}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateProfile(true)}
                className="bg-white/50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            {familyProfile.bio && (
              <p className="text-gray-700 mb-3">{familyProfile.bio}</p>
            )}
            {familyProfile.current_status && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">📍 {familyProfile.current_status}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Discovery */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search families by name, location, or interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="px-3 py-2">
          {filteredFamilies.length} families found
        </Badge>
      </div>

      {/* Family Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFamilies.map((family) => (
          <Card key={family.id} className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {family.family_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{family.family_name}</h4>
                  {family.location && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-3 h-3" />
                      {family.location}
                    </div>
                  )}
                </div>
              </div>

              {family.bio && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{family.bio}</p>
              )}

              {family.kids_ages && family.kids_ages.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Baby className="w-4 h-4 text-blue-500" />
                  <div className="flex gap-1">
                    {family.kids_ages.map((age, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {age}y
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {family.current_status && (
                <div className="p-2 bg-amber-50 rounded text-xs text-amber-800 mb-4">
                  {family.current_status}
                </div>
              )}

              <div className="flex gap-2">
                {isConnected(family.created_by) ? (
                  <Button variant="outline" className="flex-1 bg-green-50 text-green-600 border-green-200">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Connected
                  </Button>
                ) : hasPendingRequest(family.created_by) ? (
                  <Button variant="outline" className="flex-1 bg-yellow-50 text-yellow-600 border-yellow-200" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Pending
                  </Button>
                ) : (
                  <Button 
                    onClick={() => sendConnectionRequest(family.created_by, `Hi! We'd love to connect with your family.`)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFamilies.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No families found</h3>
            <p className="text-gray-500">Try adjusting your search terms or check back later</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
