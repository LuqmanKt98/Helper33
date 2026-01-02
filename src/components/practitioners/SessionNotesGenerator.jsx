import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Download, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionNotesGenerator({ appointment }) {
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateNotes = async () => {
    setGenerating(true);
    try {
      const { output } = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate professional session notes template for a practitioner.

Appointment Details:
- Client: ${appointment.client_name}
- Date: ${new Date(appointment.appointment_date).toLocaleDateString()}
- Type: ${appointment.appointment_type}
- Duration: ${appointment.duration_minutes} minutes
- Client Notes: ${appointment.notes || 'None provided'}

Create a structured session notes template with these sections:
1. Session Overview (date, client, modality)
2. Presenting Concerns (to be filled in)
3. Interventions Used (to be filled in)
4. Client Response (to be filled in)
5. Plan for Next Session (to be filled in)
6. Risk Assessment (to be filled in)

Make it professional, HIPAA-compliant, and ready for practitioner to complete.`,
        response_json_schema: {
          type: "object",
          properties: {
            notes_template: { type: "string" }
          }
        }
      });

      const template = output.notes_template;
      setNotes(template);
      setEditedNotes(template);
    } catch (error) {
      toast.error('Failed to generate notes');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedNotes);
    setCopied(true);
    toast.success('Notes copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editedNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-notes-${appointment.client_name}-${appointment.appointment_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Notes downloaded! 📥');
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          AI Session Notes Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <p className="font-semibold mb-1">⚕️ Professional Use Only</p>
              <p>AI-generated notes are templates to assist your documentation. Always review, edit, and ensure compliance with HIPAA and your professional standards before saving.</p>
            </div>
          </div>
        </div>

        {!notes ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Generate a professional session notes template</p>
            <Button
              onClick={generateNotes}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Notes Template
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              rows={15}
              className="border-2 border-purple-300 bg-white font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="border-2 border-cyan-300"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="border-2 border-blue-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={generateNotes}
                size="sm"
                variant="outline"
                className="border-2 border-purple-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}