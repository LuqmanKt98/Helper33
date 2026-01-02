import React from 'react';
import SEO from '@/components/SEO';
import PractitionerOnboarding from '@/components/practitioners/PractitionerOnboarding';

export default function BecomePractitioner() {
  return (
    <>
      <SEO
        title="Become a Practitioner | Helper33"
        description="Join our network of licensed mental health professionals and reach clients who need your expertise"
        keywords="therapist application, licensed counselor, mental health provider"
      />
      <PractitionerOnboarding />
    </>
  );
}