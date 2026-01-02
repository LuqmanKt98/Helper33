import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Compass, Loader2, CloudSun, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const LOCAL_STORAGE_KEY = 'dobrylife-weather-city';

export default function WeatherInsight({ emotionalWeather }) {
  const [weather, setWeather] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');

  const fetchInsight = useCallback(async (currentWeather) => {
    if (!emotionalWeather || !currentWeather) return;
    try {
      const prompt = `My emotional state is '${emotionalWeather.replace('_', ' ')}'. The actual weather is ${Math.round(currentWeather.temperature)}°C and ${currentWeather.description}. Provide a short, compassionate insight (1-2 sentences) connecting these two things, followed by one simple, actionable tip to feel better. Format it as: "Insight: [Your insight].\n\nTip: [Your tip]."`;
      const insightResponse = await base44.integrations.Core.InvokeLLM({ prompt });
      setInsight(insightResponse);
    } catch (err) {
      console.error("Error fetching insight:", err);
      setError('Could not load AI insight.');
    }
  }, [emotionalWeather]);

  const fetchWeather = useCallback(async (params) => {
    setLoading(true);
    setError('');
    setInsight('');
    try {
      const weatherResponse = await base44.functions.invoke('getWeather', params);
      
      if (weatherResponse.data.error) {
          throw new Error(weatherResponse.data.error);
      }
      
      setWeather(weatherResponse.data);
      await fetchInsight(weatherResponse.data);

      if (params.city) {
          localStorage.setItem(LOCAL_STORAGE_KEY, params.city);
          setShowManualInput(false);
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message || 'Could not load weather data.');
      // If manual city fails, let them try again
      if (params.city) {
        setShowManualInput(true);
      } else {
        // If geolocation fails, show manual input
        setShowManualInput(true);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchInsight]);
  
  useEffect(() => {
    const savedCity = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCity) {
      fetchWeather({ city: savedCity });
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        () => {
          setError('Enable location or enter your city manually.');
          setShowManualInput(true);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported. Please enter your city.');
      setShowManualInput(true);
      setLoading(false);
    }
  }, []); // Runs only on initial mount

  useEffect(() => {
    // This effect runs when emotionalWeather changes, to refetch the insight
    if (weather && emotionalWeather) {
      fetchInsight(weather);
    }
  }, [emotionalWeather, weather, fetchInsight]);


  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCity.trim()) {
      fetchWeather({ city: manualCity.trim() });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading personal climate...</p>
        </div>
      );
    }
    
    if (showManualInput && !weather) {
      return (
         <div className="space-y-3">
             <p className="text-sm text-center text-amber-700">{error || 'Please enter your city to get weather insights.'}</p>
             <form onSubmit={handleManualSubmit} className="flex gap-2">
                 <Input
                     type="text"
                     value={manualCity}
                     onChange={(e) => setManualCity(e.target.value)}
                     placeholder="e.g., New York"
                 />
                 <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                 </Button>
             </form>
         </div>
      )
    }

    if (!weather) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <Compass className="w-8 h-8 mb-2" />
            <p className="text-center text-sm">Select your emotional weather to generate a personalized insight.</p>
        </div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center justify-center gap-4 p-3 bg-blue-50/50 rounded-lg">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
            alt={weather.description}
            className="w-16 h-16"
          />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{Math.round(weather.temperature)}°C</p>
            <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
            <p className="text-xs text-gray-400">{weather.location}</p>
          </div>
        </div>
        {insight ? (
            <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-100/60 p-4 rounded-lg">
                {insight}
            </div>
        ) : (
             <div className="text-center text-sm text-gray-500 py-4">Select your emotional weather to see your personalized insight.</div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-500" />
          Today's Climate & You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}