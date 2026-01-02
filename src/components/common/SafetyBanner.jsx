import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Phone, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SafetyBanner({ 
  tier = 1, 
  onDismiss, 
  onContactTrusted, 
  onGetResources 
}) {
  const tierConfig = {
    1: {
      show: false
    },
    2: {
      show: true,
      title: "We care about you",
      message: "It sounds like things are tough right now. Would talking to someone you trust help?",
      variant: "default",
      actions: [
        { label: "Talk to someone", action: onContactTrusted, icon: MessageSquare },
        { label: "Find resources", action: onGetResources, icon: Shield }
      ]
    },
    3: {
      show: true,
      title: "You deserve support right now",
      message: "What you're feeling matters. Please reach out to someone who can help—a friend, family, or professional support.",
      variant: "destructive",
      urgent: true,
      actions: [
        { label: "Call crisis line", action: () => window.open('tel:988'), icon: Phone, primary: true },
        { label: "Find local help", action: onGetResources, icon: Shield }
      ]
    }
  };

  const config = tierConfig[tier];

  if (!config.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto"
      >
        <Alert 
          variant={config.variant}
          className={`border-2 shadow-lg backdrop-blur-sm ${
            config.urgent 
              ? 'border-red-300 bg-red-50/95' 
              : 'border-amber-300 bg-amber-50/95'
          }`}
        >
          <div className="flex items-start gap-3">
            <Shield className={`w-5 h-5 mt-0.5 ${config.urgent ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${config.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                {config.title}
              </h3>
              <AlertDescription className={config.urgent ? 'text-red-800' : 'text-amber-800'}>
                {config.message}
              </AlertDescription>
              <div className="flex flex-wrap gap-2 mt-3">
                {config.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={action.action}
                    size="sm"
                    variant={action.primary ? "default" : "outline"}
                    className={action.primary ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            {!config.urgent && onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}