import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Heart,
  Users,
  Briefcase,
  Home,
  Activity,
  Edit,
  Phone,
  Download,
  Eye,
  ChevronUp
} from 'lucide-react';

export default function SafetyPlanQuickView({ crisisSupport, onEdit, onExport }) {
  const [expanded, setExpanded] = React.useState(false);

  if (!crisisSupport?.safety_plan_created) {
    return null;
  }

  const sections = [
    {
      title: 'Warning Signs',
      icon: AlertTriangle,
      color: 'amber',
      emoji: '⚠️',
      items: crisisSupport.warning_signs || [],
      field: 'warning_signs'
    },
    {
      title: 'Coping Strategies',
      icon: Activity,
      color: 'green',
      emoji: '🌿',
      items: crisisSupport.coping_strategies || [],
      field: 'coping_strategies'
    },
    {
      title: 'Reasons to Live',
      icon: Heart,
      color: 'rose',
      emoji: '💖',
      items: crisisSupport.reasons_for_living || [],
      field: 'reasons_for_living'
    },
    {
      title: 'Safe People',
      icon: Users,
      color: 'blue',
      emoji: '👥',
      items: crisisSupport.safe_people || [],
      field: 'safe_people',
      isPeople: true
    },
    {
      title: 'Professional Contacts',
      icon: Briefcase,
      color: 'purple',
      emoji: '👨‍⚕️',
      items: crisisSupport.professional_contacts || [],
      field: 'professional_contacts',
      isProfessional: true
    },
    {
      title: 'Safe Environments',
      icon: Home,
      color: 'cyan',
      emoji: '🏡',
      items: crisisSupport.safe_environments || [],
      field: 'safe_environments'
    }
  ];

  const totalItems = sections.reduce((acc, section) => acc + (section.items?.length || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-4 border-purple-300 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  ✅ Your Safety Plan
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {totalItems} items • Last updated {new Date(crisisSupport.updated_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setExpanded(!expanded)}
                variant="outline"
                size="sm"
                className="border-2 border-purple-300"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </>
                )}
              </Button>
              <Button
                onClick={onEdit}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Summary Badges */}
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {sections.map((section) => (
              section.items.length > 0 && (
                <Badge
                  key={section.field}
                  className={`bg-${section.color}-500 text-white`}
                  style={{ 
                    backgroundColor: section.color === 'amber' ? '#f59e0b' : 
                                     section.color === 'green' ? '#10b981' :
                                     section.color === 'rose' ? '#f43f5e' :
                                     section.color === 'blue' ? '#3b82f6' :
                                     section.color === 'purple' ? '#a855f7' :
                                     section.color === 'cyan' ? '#06b6d4' : undefined
                  }}
                >
                  {section.emoji} {section.title} ({section.items.length})
                </Badge>
              )
            ))}
          </div>

          {/* Expanded View */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t-2 border-purple-200"
            >
              {sections.map((section) => {
                if (!section.items || section.items.length === 0) return null;

                const SectionIcon = section.icon;

                return (
                  <div key={section.field} className={`p-4 rounded-xl border-2 bg-${section.color}-50 border-${section.color}-200`}
                    style={{
                      backgroundColor: section.color === 'amber' ? '#fef3c7' :
                                      section.color === 'green' ? '#d1fae5' :
                                      section.color === 'rose' ? '#ffe4e6' :
                                      section.color === 'blue' ? '#dbeafe' :
                                      section.color === 'purple' ? '#f3e8ff' :
                                      section.color === 'cyan' ? '#cffafe' : undefined,
                      borderColor: section.color === 'amber' ? '#fbbf24' :
                                  section.color === 'green' ? '#34d399' :
                                  section.color === 'rose' ? '#fb7185' :
                                  section.color === 'blue' ? '#60a5fa' :
                                  section.color === 'purple' ? '#c084fc' :
                                  section.color === 'cyan' ? '#22d3ee' : undefined
                    }}
                  >
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <SectionIcon className="w-5 h-5" />
                      {section.emoji} {section.title}
                    </h4>

                    {section.isPeople ? (
                      <div className="space-y-2">
                        {section.items.map((person, idx) => (
                          <div key={idx} className="bg-white/60 rounded-lg p-3 border border-gray-200">
                            <p className="font-semibold text-gray-900">{person.name}</p>
                            {person.relationship && (
                              <p className="text-sm text-gray-700">{person.relationship}</p>
                            )}
                            {person.phone && (
                              <a href={`tel:${person.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {person.phone}
                              </a>
                            )}
                            {person.notify_in_crisis && (
                              <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Emergency Contact</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : section.isProfessional ? (
                      <div className="space-y-2">
                        {section.items.map((prof, idx) => (
                          <div key={idx} className="bg-white/60 rounded-lg p-3 border border-gray-200">
                            <p className="font-semibold text-gray-900">{prof.name}</p>
                            {prof.role && (
                              <p className="text-sm text-gray-700">{prof.role}</p>
                            )}
                            {prof.phone && (
                              <a href={`tel:${prof.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {prof.phone}
                              </a>
                            )}
                            {prof.availability && (
                              <p className="text-xs text-gray-600 mt-1">Available: {prof.availability}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={onEdit}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
                <Button
                  onClick={onExport}
                  variant="outline"
                  className="flex-1 border-2 border-blue-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}