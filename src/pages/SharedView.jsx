
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// This is a simplified calendar view. A real app would use a library.
const SharedScheduleView = ({ events }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const eventsByDate = events.reduce((acc, event) => {
        // Ensure event has a start_date before processing
        if (!event.start_date) {
            console.warn("Event missing start_date:", event);
            return acc;
        }
        const date = new Date(event.start_date).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(event);
        return acc;
    }, {});

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Calendar /> {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-secondary mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border border-slate-100 rounded-lg h-28"></div>)}
                    {monthDays.map(day => {
                        const dateStr = new Date(currentYear, currentMonth, day).toDateString();
                        const dayEvents = (eventsByDate[dateStr] || []).filter(e => e.start_date); // Ensure event has a start_date
                        const isToday = new Date().toDateString() === dateStr;

                        return (
                            <div key={day} className={`border rounded-lg h-28 p-2 overflow-y-auto ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white/50 border-slate-200'}`}>
                                <p className={`font-bold text-sm ${isToday ? 'text-indigo-600' : 'text-primary'}`}>{day}</p>
                                {dayEvents.map(event => (
                                    <div key={event.id} className="bg-blue-100 text-blue-800 text-xs rounded p-1 mt-1 truncate" title={event.title}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};


export default function SharedView() {
  const [events, setEvents] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const familyId = new URLSearchParams(location.search).get('familyId');

  useEffect(() => {
    const accessFamilyId = sessionStorage.getItem('sharedAccessFamilyId');
    const accessMemberName = sessionStorage.getItem('sharedAccessMemberName');

    if (familyId !== accessFamilyId) {
      setError('Access denied. Please use a valid access code.');
      setIsLoading(false);
      return;
    }
    
    setMemberName(accessMemberName);

    const fetchData = async () => {
      try {
        // Use the new backend function to securely fetch data
        const { data } = await base44.functions.invoke('getSharedFamilyData', { familyId: accessFamilyId });

        if (data.error) {
            throw new Error(data.error);
        }
        
        setEvents(data.events || []);
        if(data.profile) {
          setFamilyName(data.profile.family_name);
        } else {
          setFamilyName("The Family");
        }

      } catch (err) {
        setError('Failed to load shared information.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [familyId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Shared Schedule...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
        <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Shared Schedule for {familyName}</h1>
            <p className="text-md text-gray-600">Viewing as: <strong>{memberName}</strong></p>
        </header>
        <SharedScheduleView events={events} />
    </div>
  );
}
