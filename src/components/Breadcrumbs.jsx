import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Breadcrumbs({ items = [], className = "" }) {
  // Always start with Home
  const breadcrumbItems = [
    { label: 'Home', path: 'Home', icon: Home },
    ...items
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-sm mb-4 ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-1 text-gray-700 font-semibold">
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={createPageUrl(item.path)}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
}