import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ClientOnboarding from '@/components/client/ClientOnboarding';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function ClientOnboardingPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEO title="Client Onboarding | Helper33" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Please Log In</h2>
              <p className="text-gray-600 mb-4">You need to be logged in to complete onboarding</p>
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Log In / Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Welcome to Helper33 | Client Onboarding" description="Complete your profile and find the perfect practitioner match" />
      <ClientOnboarding user={user} />
    </>
  );
}