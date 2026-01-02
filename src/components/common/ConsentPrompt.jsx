import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Info, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConsentPrompt({
  title,
  description,
  dataSource,
  dataPurpose,
  onAllow,
  onDeny,
  onAlwaysAllow,
  onNeverAllow
}) {
  const [rememberChoice, setRememberChoice] = useState(false);

  const handleAllow = () => {
    if (rememberChoice) {
      onAlwaysAllow?.();
    } else {
      onAllow();
    }
  };

  const handleDeny = () => {
    if (rememberChoice) {
      onNeverAllow?.();
    } else {
      onDeny();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <div>
              <span className="font-medium">Data source:</span>
              <span className="ml-2 text-muted-foreground">{dataSource}</span>
            </div>
            <div>
              <span className="font-medium">Purpose:</span>
              <span className="ml-2 text-muted-foreground">{dataPurpose}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <label htmlFor="remember" className="text-sm font-medium cursor-pointer flex-1">
              Remember my choice
            </label>
            <Switch
              id="remember"
              checked={rememberChoice}
              onCheckedChange={setRememberChoice}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeny}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Not now
            </Button>
            <Button
              onClick={handleAllow}
              className="flex-1 bg-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Allow
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can change this anytime in Settings → Privacy
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}