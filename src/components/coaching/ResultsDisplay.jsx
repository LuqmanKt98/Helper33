
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Award, Sparkles, Star, ArrowRight, Repeat } from 'lucide-react';

export default function ResultsDisplay({ results, onReset }) {
  const navigate = useNavigate();

  const handleNavigation = (primaryApproach) => {
    let destination = '/coach'; // default
    if (['CGT', 'Continuing_Bonds', 'Meaning_Reconstruction'].includes(primaryApproach.key)) {
      destination = '/grief-coach';
    } else if (primaryApproach.key === 'CBT') {
      destination = '/wellness';
    } else if (primaryApproach.key === 'RTT') {
        // Assuming RTT might be a future page or handled by a specific coach.
        // For now, let's route to the general life coach.
        destination = '/life-coach';
    } else {
        destination = '/life-coach';
    }
    navigate(createPageUrl(destination.substring(1)));
  };

  const { primary, alternatives, why } = results;

  if (!primary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Calculating your results...</h2>
        <p className="text-gray-500">We couldn't determine a primary match. You might have a unique blend of needs!</p>
        <Button onClick={onReset} className="mt-6">Try Again</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Your Recommended Coaching Style</h1>
        <p className="mt-3 text-lg text-gray-600">Based on your answers, here's what we think will work best for you.</p>
      </div>

      {/* Primary Recommendation */}
      <Card className="overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
          <CardHeader className="bg-blue-50 p-6">
              <div className="flex items-center gap-4">
                  <div className="bg-blue-500 rounded-full p-3 text-white">
                      <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-blue-800">{primary.title}</CardTitle>
                    <CardDescription className="text-blue-600">Your Top Recommended Approach</CardDescription>
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">{primary.description}</p>
              {why && (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-blue-500"/>Why it's a good fit:</h4>
                    <p className="text-sm text-blue-700">{why}</p>
                </div>
              )}
          </CardContent>
          <CardFooter className="bg-gray-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 font-medium">Ready to start your journey?</p>
            <Button size="lg" onClick={() => handleNavigation(primary)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Start with this Coach <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
      </Card>

      {/* Alternative Recommendations */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-700">Other Good Options for You</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alternatives.map(alt => (
              <Card key={alt.key} className="flex flex-col">
                  <CardHeader>
                      <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2 text-gray-500"><Star className="w-5 h-5"/></div>
                          <CardTitle className="text-xl font-semibold">{alt.title}</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600">{alt.description}</p>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-6 border-t">
        <Button variant="outline" onClick={onReset}>
            <Repeat className="w-4 h-4 mr-2" /> Take the Survey Again
        </Button>
      </div>
    </motion.div>
  );
}
