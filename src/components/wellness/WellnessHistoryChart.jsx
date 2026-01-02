import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun, TrendingUp, Brain } from 'lucide-react';
import { format, subDays } from 'date-fns';

const moodIcons = {
  sunny: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const MoodIcon = moodIcons[data.mood];

    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{label}</p>
        {MoodIcon && 
          <div className="flex items-center gap-2 my-2">
            <MoodIcon className="w-5 h-5 text-gray-600" />
            <span className="capitalize text-gray-700">{data.mood.replace('_', ' ')}</span>
          </div>
        }
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {`${p.name}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WellnessHistoryChart({ entries }) {
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();

  const data = last7Days.map(date => {
    const dateString = format(date, 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === dateString);
    return {
      date: format(date, 'EEE'),
      fullDate: dateString,
      'Energy': entry?.energy_level || 0,
      'Sleep (hrs)': entry?.sleep_hours || 0,
      mood: entry?.emotional_weather,
    };
  });

  if (!entries || entries.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Wellness Trends
          </CardTitle>
          <CardDescription>Your 7-day wellness history will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-semibold">Your wellness journey starts now!</p>
            <p className="text-sm">Complete your first check-in to see your trends.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Your 7-Day Trend
          </CardTitle>
          <CardDescription>Visualize your energy and sleep patterns over the last week.</CardDescription>
        </CardHeader>
        <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: '#4b5563' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Energy', angle: -90, position: 'insideLeft', fill: '#8884d8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Sleep', angle: -90, position: 'insideRight', fill: '#82ca9d' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Energy" yAxisId="left" barSize={20} fill="#8884d8" fillOpacity={0.6} />
                  <Line type="monotone" dataKey="Sleep (hrs)" yAxisId="right" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  );
}