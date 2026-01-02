
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import {
  Mail,
  Send,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailTemplates = [
  {
    id: "meeting_request",
    name: "Meeting Request",
    subject: "Meeting Request: [Date] at [Time]",
    body: `Dear [Name],

I hope this email finds you well.

Could you please stop by [date] at [time]? I'd like to discuss [briefly state purpose, e.g., "the ongoing project" or "a quick matter"].

Please let me know if this time works for you.

Best regards,
[Your Name]`
  },
  {
    id: "collaboration",
    name: "Collaboration Proposal",
    subject: "Collaboration Opportunity",
    body: `Hi [Name],

I hope you're doing well! I've been following your work and would love to discuss a potential collaboration.

[Briefly describe the collaboration idea]

Would you be interested in connecting? I'd love to hear your thoughts.

Looking forward to hearing from you!

Best,
[Your Name]`
  },
  {
    id: "thank_you",
    name: "Thank You Note",
    subject: "Thank You!",
    body: `Dear [Name],

Thank you so much for [specific thing]. Your [support/help/collaboration] means a lot to me.

I truly appreciate [specific detail].

Warm regards,
[Your Name]`
  },
  {
    id: "follow_up",
    name: "Follow Up",
    subject: "Following Up: [Topic]",
    body: `Hi [Name],

I wanted to follow up on [topic/previous conversation].

[Add context or updates]

Please let me know if you have any questions or need additional information.

Thanks,
[Your Name]`
  }
];

export default function EmailCenter({ onBack }) {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: ""
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // AI and Voice States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState(''); // New state for speech errors
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.log("Error loading user:", error);
      }
    };
    loadUser();

    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Set language

      recognitionRef.current.onresult = (event) => {
        let currentFinalTranscript = "";
        // interimTranscript is not used to update aiPrompt directly
        // because we want a stable text for AI generation.
        // If real-time interim display was needed, another state would be used.
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinalTranscript += event.results[i][0].transcript;
          }
        }
        if (currentFinalTranscript) {
          // Append the new final spoken text to the existing aiPrompt
          setAiPrompt(prev => prev + currentFinalTranscript + ' ');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false); // Stop listening state when recognition ends
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setSpeechError("I didn't catch that. Please try speaking again.");
        } else if (event.error === 'not-allowed') {
          setSpeechError("Microphone access is not allowed. Please check browser permissions.");
        } else if (event.error === 'network') {
          setSpeechError("Speech recognition requires an internet connection. Please check your network.");
        }
        else {
          setSpeechError(`An error occurred: ${event.error}. Please try again.`);
        }
      };

    } else {
      console.warn("Speech recognition not supported in this browser.");
      setSpeechError("Speech recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleListenToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setAiPrompt(""); // Clear previous prompt before starting new listening
        setSpeechError(""); // Clear any previous speech errors
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        setSpeechError("Sorry, your browser doesn't support speech recognition.");
      }
    }
  };

  const generateEmailWithAI = async () => {
    if (!aiPrompt.trim()) return; // Trim to check for empty or just whitespace
    setIsGenerating(true);
    setSpeechError(""); // Clear any speech errors before generation
    try {
      const fullPrompt = `You are an expert email writing assistant. Based on the following instruction, write a professional and clear email.
      Instruction: "${aiPrompt}"
      
      Generate the subject line and the body of the email.
      Output a JSON object with two keys: "subject" and "body".`;

      const result = await InvokeLLM({
        prompt: fullPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          },
          required: ["subject", "body"]
        }
      });
      
      if (result && result.subject && result.body) {
        setNewEmail(prev => ({ ...prev, subject: result.subject, body: result.body }));
        setAiPrompt(""); // Clear AI prompt after generation
      } else {
        throw new Error("AI did not return expected subject and body.");
      }

    } catch (error) {
      console.error("AI email generation failed:", error);
      setSpeechError("There was an error generating the email. Please try again. " + (error.message || ""));
      alert("There was an error generating the email. Please try again. " + (error.message || ""));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakEmail = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (newEmail.body && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(newEmail.body);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setIsSpeaking(false);
          alert("Text-to-speech failed. Please try again.");
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      } else {
        alert("Sorry, your browser doesn't support text-to-speech.");
      }
    }
  };


  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setNewEmail({
      to: newEmail.to,
      subject: template.subject,
      body: template.body
    });
  };

  const sendEmail = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      alert("Please fill in all fields (To, Subject, and Body)");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.to)) {
      alert("Please enter a valid email address");
      return;
    }

    // Create mailto link
    const mailtoLink = `mailto:${newEmail.to}?subject=${encodeURIComponent(newEmail.subject)}&body=${encodeURIComponent(newEmail.body)}`;
    
    // Open user's email client
    window.location.href = mailtoLink;

    // Add to sent emails list
    const sentEmail = {
      id: Date.now().toString(),
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      sentAt: new Date().toISOString(),
      status: "sent"
    };

    setEmails([sentEmail, ...emails]);
    
    // Reset form
    setNewEmail({ to: "", subject: "", body: "" });
    setSelectedTemplate(null);
    setShowCompose(false);
  };

  const deleteEmail = (emailId) => {
    setEmails(emails.filter(e => e.id !== emailId));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Email Center</h1>
          <Button
            onClick={() => setShowCompose(!showCompose)}
            className="bg-gradient-to-r from-sky-500 to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  How Email Sending Works
                </p>
                <p className="text-sm text-blue-700">
                  Clicking "Send Email" will open your default email client (Gmail, Outlook, etc.) with the recipient, subject, and body pre-filled. You can review and send from there.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* AI Assistant Card */}
              <Card className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-5 h-5" />
                    AI Email Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="ai-prompt">Tell the AI what to write</Label>
                    <div className="relative">
                      <Textarea
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., 'Write a follow-up email to John about our meeting last week and ask for the project update...'"
                        className="pr-12 min-h-[80px]"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleListenToggle}
                        className="absolute top-2 right-2 text-gray-500 hover:text-indigo-600"
                        title={isListening ? "Stop listening" : "Use microphone"}
                        disabled={isGenerating} // Disable mic during generation
                      >
                        {isListening ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5" />}
                      </Button>
                    </div>
                    {speechError && <p className="text-xs text-red-500 mt-2">{speechError}</p>}
                  </div>
                  <Button
                    onClick={generateEmailWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGenerating ? 'Generating...' : 'Craft Email with AI'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-sky-600" />
                    Compose Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email Templates */}
                  <div>
                    <Label>Quick Templates</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {emailTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyTemplate(template)}
                          className="text-xs"
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Email Form */}
                  <div>
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      type="email"
                      value={newEmail.to}
                      onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newEmail.subject}
                      onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="body">Message</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSpeakEmail}
                        disabled={!newEmail.body || isSpeaking} // Disable if no body or already speaking
                        className="flex items-center gap-1 text-gray-600 hover:text-sky-700"
                      >
                        {isSpeaking ? (
                          <>
                            <Square className="w-3 h-3" /> Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" /> Listen
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="body"
                      value={newEmail.body}
                      onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                      placeholder="Write your message here..."
                      className="h-64"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use [Name], [Date], [Time] as placeholders - remember to replace them before sending!
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCompose(false);
                        setNewEmail({ to: "", subject: "", body: "" });
                        setSelectedTemplate(null);
                        setAiPrompt(""); // Clear AI prompt on cancel
                        setIsListening(false); // Stop listening if active
                        recognitionRef.current?.stop();
                        window.speechSynthesis.cancel(); // Stop speaking if active
                        setIsSpeaking(false);
                        setSpeechError(""); // Clear any speech errors
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={sendEmail} className="bg-gradient-to-r from-sky-500 to-blue-600">
                      <Send className="w-4 h-4 mr-2" />
                      Open in Email Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sent Emails */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recent Email Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails composed yet</p>
                <p className="text-sm mt-2">Start by clicking "Compose" above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">To: {email.to}</span>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Opened in client
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{email.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(email.sentAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEmail(email.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-white rounded border text-sm text-gray-600 whitespace-pre-wrap">
                      {email.body.substring(0, 150)}...
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
