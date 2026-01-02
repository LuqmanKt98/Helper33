import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function BackButton({ 
  showHomeButton = true, 
  customBackPath = null,
  className = "",
  variant = "outline",
  size = "default"
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (customBackPath) {
      navigate(createPageUrl(customBackPath));
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  const handleHome = () => {
    navigate(createPageUrl('Home'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <Button
        onClick={handleBack}
        variant={variant}
        size={size}
        className="gap-2 bg-white/80 hover:bg-white border-2 border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>

      {showHomeButton && (
        <Button
          onClick={handleHome}
          variant={variant}
          size={size}
          className="gap-2 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 hover:border-orange-300 shadow-md hover:shadow-lg transition-all"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      )}
    </motion.div>
  );
}