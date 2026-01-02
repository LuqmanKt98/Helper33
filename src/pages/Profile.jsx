import React from 'react';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
  // Redirect to ProfileSettings
  return <Navigate to={createPageUrl('ProfileSettings')} replace />;
}