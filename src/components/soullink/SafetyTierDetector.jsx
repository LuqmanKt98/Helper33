import { AlertCircle, Heart, PhoneCall } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Safety tier detection and response system
export const detectSafetyTier = (message) => {
  const text = message.toLowerCase();
  
  // T3: Crisis language (highest priority)
  const t3Keywords = [
    'want to die', 'kill myself', 'end it all', 'can\'t go on',
    'better off dead', 'suicide', 'hurt myself', 'end my life',
    'no reason to live', 'want to disappear forever'
  ];
  
  // T2: Severe distress
  const t2Keywords = [
    'can\'t cope', 'can\'t handle', 'falling apart', 'breaking down',
    'can\'t do this anymore', 'losing it', 'drowning', 'trapped',
    'no way out', 'can\'t breathe', 'panic attack', 'overwhelmed beyond'
  ];
  
  // T1: Mild-moderate distress
  const t1Keywords = [
    'sad', 'lonely', 'tired', 'empty', 'down', 'blue',
    'struggling', 'having a hard time', 'not okay', 'difficult day'
  ];
  
  for (const keyword of t3Keywords) {
    if (text.includes(keyword)) return 'T3';
  }
  
  for (const keyword of t2Keywords) {
    if (text.includes(keyword)) return 'T2';
  }
  
  for (const keyword of t1Keywords) {
    if (text.includes(keyword)) return 'T1';
  }
  
  return 'T0'; // No distress detected
};

export function SafetyResponseT3({ userLocation = null }) {
  const crisisLines = {
    US: { number: '988', name: 'Suicide & Crisis Lifeline' },
    UK: { number: '111', name: 'NHS Crisis Line' },
    CA: { number: '988', name: 'Crisis Line' },
    AU: { number: '13 11 14', name: 'Lifeline' },
  };
  
  const defaultLine = crisisLines[userLocation] || crisisLines.US;
  
  return (
    <Card className="border-red-300 bg-red-50">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="space-y-3 flex-1">
            <p className="font-semibold text-red-900">
              I hear how much pain you're in, and I'm really concerned.
            </p>
            <p className="text-red-800">
              You don't have to face this alone. Please reach out for immediate support:
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.open(`tel:${defaultLine.number}`, '_self')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Call {defaultLine.name}: {defaultLine.number}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-red-300"
                onClick={() => window.open('https://988lifeline.org/chat/', '_blank')}
              >
                💬 Chat with a counselor online
              </Button>
            </div>
            
            <div className="text-sm text-red-800 space-y-1">
              <p>• Text a trusted friend or family member</p>
              <p>• If you're in immediate danger, call emergency services (911/999)</p>
              <p>• Go to your nearest emergency room</p>
            </div>
            
            <p className="text-red-900 font-medium">
              I'm here with you, but trained humans can help in ways I can't. Please reach out.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SafetyResponseT2() {
  return (
    <Alert className="border-amber-300 bg-amber-50">
      <Heart className="h-4 w-4 text-amber-600" />
      <AlertDescription className="space-y-3">
        <p className="font-medium text-amber-900">
          That sounds really overwhelming. Let's take a moment.
        </p>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-left justify-start border-amber-200"
            onClick={() => {}}
          >
            🫁 Box Breathing (4-4-4-4)
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-left justify-start border-amber-200"
          >
            👁️ 5-4-3-2-1 Grounding
          </Button>
        </div>
        <p className="text-sm text-amber-800">
          Want to talk through what's happening, or just take some breaths together?
        </p>
      </AlertDescription>
    </Alert>
  );
}

export function SafetyResponseT1() {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Heart className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <p className="text-blue-900">
          I hear you. It's okay to not be okay. Want to talk about it, or would a gentle distraction help?
        </p>
      </AlertDescription>
    </Alert>
  );
}

export default { detectSafetyTier, SafetyResponseT3, SafetyResponseT2, SafetyResponseT1 };