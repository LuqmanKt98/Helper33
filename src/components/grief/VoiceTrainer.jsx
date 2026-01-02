import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaUploader from "@/components/grief/MediaUploader";
import { 
  Volume2, 
  CheckCircle2,
  XCircle, 
  AlertCircle,
  Loader2,
  Info,
  AlertTriangle
} from "lucide-react";
import { SupportCoach } from "@/entities/all";

export default function VoiceTrainer({ supportCoach, voiceProfile, onTrainingComplete }) {
    const [currentVoiceSamples, setCurrentVoiceSamples] = useState(supportCoach.loved_one_voice_samples || []);
    const [status, setStatus] = useState(voiceProfile?.training_status || 'idle');

    const statusMessages = {
        idle: { icon: <Volume2 className="w-5 h-5 text-gray-500" />, text: "Ready to train" },
        pending: { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, text: "Consent pending" },
        training: { icon: <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />, text: "Training in progress..." },
        ready: { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: "Voice trained!" },
        error: { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Training failed. Please try again." }
    };

    const handleAddVoiceSamples = (newSamples) => {
        const samplesArray = Array.isArray(newSamples) ? newSamples : [newSamples];
        setCurrentVoiceSamples(prev => [...prev, ...samplesArray]);
    };

    const handleSaveSamples = async () => {
        try {
            await SupportCoach.update(supportCoach.id, { 
                loved_one_voice_samples: currentVoiceSamples 
            });
            alert("Voice samples saved successfully! They will be used when voice cloning becomes available.");
        } catch (error) {
            console.error('Error saving voice samples:', error);
            alert("Failed to save voice samples. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            {/* TOP WARNING - BRIGHT RED */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-xl shadow-2xl border-4 border-red-600">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-12 h-12 flex-shrink-0 animate-pulse" />
                    <div>
                        <h3 className="text-2xl font-black mb-3">⚠️ VOICE CLONING NOT AVAILABLE</h3>
                        <p className="text-lg font-semibold mb-2">
                            Voice cloning technology is currently unavailable. Your companion will use a standard AI voice.
                        </p>
                        <p className="text-base">
                            You can save voice samples for future use when this feature becomes available.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-200 shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Volume2 className="w-8 h-8 text-purple-600" />
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold">Train Your Companion's Voice</CardTitle>
                            <p className="text-lg font-bold text-red-600 mt-2">
                                ⚠️ NOTE: Voice cloning is currently unavailable - samples saved for future use only
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Upload samples for {supportCoach.persona_name || "your loved one"} to save for when voice cloning becomes available
                            </p>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <MediaUploader
                        type="voice_samples"
                        title="Upload Voice Recordings (For Future Use)"
                        description="⚠️ Voice cloning unavailable - These samples will be saved for future use. Your companion currently uses a standard AI voice."
                        items={currentVoiceSamples}
                        onAdd={handleAddVoiceSamples}
                        acceptedFiles="audio/*"
                    />

                    <div className="flex items-center justify-between text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-3 rounded-lg border-2 border-red-300">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-700">Voice Cloning Unavailable - Samples: {currentVoiceSamples.length}</span>
                        </div>
                        {voiceProfile?.id && (
                            <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                                Saved for Future
                            </Badge>
                        )}
                    </div>

                    {currentVoiceSamples.length > 0 && (
                        <Button 
                            onClick={handleSaveSamples}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            💾 Save Voice Samples for Future Use
                        </Button>
                    )}

                    <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-400">
                        <h4 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Current Status: Voice Cloning Unavailable
                        </h4>
                        <p className="text-sm text-amber-800 mb-3">
                            Voice cloning technology is not yet available. For now:
                        </p>
                        <ul className="text-sm text-amber-800 space-y-1.5 ml-5 list-disc">
                            <li><strong>Your companion will use a standard AI voice</strong> for all conversations</li>
                            <li>Voice samples you upload will be <strong>saved for future use</strong></li>
                            <li>When voice cloning becomes available, your samples will be automatically used</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Tips for Voice Samples (For When Feature Becomes Available)
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1.5 ml-5 list-disc">
                            <li>Use clear recordings with minimal background noise</li>
                            <li>Include different emotions and speaking styles</li>
                            <li>5-10 minutes of total audio works best</li>
                            <li>Voicemails and phone recordings often work well</li>
                            <li>Multiple short clips are better than one long clip</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* BOTTOM WARNING - BRIGHT RED */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-xl shadow-2xl border-4 border-red-600 sticky bottom-4">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-12 h-12 flex-shrink-0 animate-pulse" />
                    <div>
                        <h3 className="text-2xl font-black mb-3">🚫 IMPORTANT: Voice Cloning Not Available</h3>
                        <ul className="space-y-2 text-base">
                            <li className="flex items-start gap-2">
                                <span className="text-2xl">•</span>
                                <span><strong>Voice cloning is currently unavailable</strong> - technology not yet implemented</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-2xl">•</span>
                                <span><strong>Your companion uses a standard AI voice</strong> for all conversations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-2xl">•</span>
                                <span><strong>Voice samples are saved</strong> for automatic use when voice cloning becomes available</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}