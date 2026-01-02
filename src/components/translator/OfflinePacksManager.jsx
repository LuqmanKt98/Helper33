import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Check, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PACK_TEMPLATES = [
  {
    category: 'travel',
    name: 'Travel Essentials',
    icon: '✈️',
    description: 'Common phrases for airports, hotels, restaurants',
    phrases: [
      { original: 'Hello', context: 'Greeting' },
      { original: 'Thank you', context: 'Gratitude' },
      { original: 'Where is the bathroom?', context: 'Directions' },
      { original: 'How much does this cost?', context: 'Shopping' },
      { original: 'I need help', context: 'Emergency' },
      { original: 'Can you help me?', context: 'Assistance' },
      { original: 'I don\'t understand', context: 'Communication' },
      { original: 'Do you speak English?', context: 'Communication' },
      { original: 'Where is the nearest hospital?', context: 'Emergency' },
      { original: 'I would like to order...', context: 'Restaurant' },
    ]
  },
  {
    category: 'medical',
    name: 'Medical Phrases',
    icon: '🏥',
    description: 'Essential medical and health-related terms',
    phrases: [
      { original: 'I am sick', context: 'Health' },
      { original: 'I have pain here', context: 'Symptoms' },
      { original: 'I am allergic to...', context: 'Allergies' },
      { original: 'I need a doctor', context: 'Emergency' },
      { original: 'Where is the pharmacy?', context: 'Medication' },
      { original: 'I take these medications', context: 'Treatment' },
      { original: 'I have diabetes', context: 'Conditions' },
      { original: 'Call an ambulance', context: 'Emergency' },
    ]
  },
  {
    category: 'business',
    name: 'Business Communication',
    icon: '💼',
    description: 'Professional phrases for meetings and emails',
    phrases: [
      { original: 'Good morning', context: 'Greeting' },
      { original: 'Nice to meet you', context: 'Introduction' },
      { original: 'Let\'s schedule a meeting', context: 'Planning' },
      { original: 'Can you send me the report?', context: 'Request' },
      { original: 'I agree with your proposal', context: 'Agreement' },
      { original: 'When is the deadline?', context: 'Timeline' },
      { original: 'Thank you for your time', context: 'Closing' },
    ]
  },
  {
    category: 'emergency',
    name: 'Emergency Phrases',
    icon: '🚨',
    description: 'Critical phrases for urgent situations',
    phrases: [
      { original: 'Help!', context: 'Emergency' },
      { original: 'Call the police', context: 'Emergency' },
      { original: 'I need an ambulance', context: 'Medical Emergency' },
      { original: 'Fire!', context: 'Emergency' },
      { original: 'I am lost', context: 'Navigation' },
      { original: 'I need my embassy', context: 'Legal' },
      { original: 'Someone stole my wallet', context: 'Crime' },
      { original: 'I need a lawyer', context: 'Legal' },
    ]
  }
];

export default function OfflinePacksManager({ sourceLang, targetLang, languages }) {
  const queryClient = useQueryClient();
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);

  const { data: myPacks = [], isLoading } = useQuery({
    queryKey: ['translationPacks'],
    queryFn: () => base44.entities.TranslationPack.list('-created_date'),
    initialData: []
  });

  const createPackMutation = useMutation({
    mutationFn: (packData) => base44.entities.TranslationPack.create(packData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationPacks'] });
      toast.success('Translation pack created!');
    }
  });

  const deletePackMutation = useMutation({
    mutationFn: (id) => base44.entities.TranslationPack.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationPacks'] });
      toast.success('Pack deleted');
    }
  });

  const generatePack = async (template) => {
    setIsGeneratingPack(true);
    
    try {
      const sourceLangName = languages.find(l => l.code === sourceLang)?.name;
      const targetLangName = languages.find(l => l.code === targetLang)?.name;

      // Translate all phrases
      const translatedPhrases = [];
      
      for (const phrase of template.phrases) {
        const prompt = `Translate this ${sourceLangName} phrase to ${targetLangName}. Also provide a phonetic pronunciation guide for the ${targetLangName} translation.

Phrase: "${phrase.original}"
Context: ${phrase.context}

Return a JSON object with: {"translation": "...", "pronunciation": "..."}`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              translation: { type: "string" },
              pronunciation: { type: "string" }
            }
          }
        });

        translatedPhrases.push({
          original: phrase.original,
          translation: response.translation,
          pronunciation: response.pronunciation,
          context: phrase.context
        });
      }

      // Create the pack
      const packData = {
        pack_name: `${template.name} (${sourceLangName} → ${targetLangName})`,
        source_language: sourceLang,
        target_language: targetLang,
        category: template.category,
        phrases: translatedPhrases,
        pack_size_kb: Math.round(JSON.stringify(translatedPhrases).length / 1024),
        is_offline_available: true
      };

      await createPackMutation.mutateAsync(packData);
      
    } catch (error) {
      console.error('Pack generation error:', error);
      toast.error('Failed to generate pack. Please try again.');
    } finally {
      setIsGeneratingPack(false);
    }
  };

  const downloadPack = (pack) => {
    const packData = {
      name: pack.pack_name,
      source_language: pack.source_language,
      target_language: pack.target_language,
      category: pack.category,
      phrases: pack.phrases,
      downloaded_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(packData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.pack_name.replace(/\s/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    // Update download count
    base44.entities.TranslationPack.update(pack.id, {
      download_count: (pack.download_count || 0) + 1,
      last_downloaded: new Date().toISOString()
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['translationPacks'] });
    });

    toast.success('Pack downloaded for offline use!');
  };

  return (
    <div className="space-y-6">
      {/* Pack Templates */}
      <div className="grid md:grid-cols-2 gap-4">
        {PACK_TEMPLATES.map((template, index) => (
          <motion.div
            key={template.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{template.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    {template.phrases.length} phrases
                  </Badge>
                </div>
                <Button
                  onClick={() => generatePack(template)}
                  disabled={isGeneratingPack}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  size="sm"
                >
                  {isGeneratingPack ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My Downloaded Packs */}
      {myPacks.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              My Translation Packs ({myPacks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPacks.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pack.pack_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {pack.phrases?.length || 0} phrases
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pack.category}
                      </Badge>
                      {pack.download_count > 0 && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          <Download className="w-3 h-3 mr-1" />
                          {pack.download_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPack(pack)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePackMutation.mutate(pack.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            How Offline Packs Work
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Generate a pack for your language pair and category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Download the JSON file to your device</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Access phrases anytime, even without internet!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Each pack includes phonetic pronunciations</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}