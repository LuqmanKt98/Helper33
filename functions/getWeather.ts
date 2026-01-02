import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This function uses the "Weather" secret, which is assumed to be an OpenWeatherMap API key.
const API_KEY = Deno.env.get("Weather");

Deno.serve(async (req) => {
    // This function can be called by authenticated users.
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }


    if (!API_KEY) {
        console.error("Weather API key is not set in secrets.");
        return new Response(JSON.stringify({ error: "Server configuration error: Weather API key is missing." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { lat, lon, city } = await req.json();
        let url = '';

        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        } else {
            return new Response(JSON.stringify({ error: 'Latitude/longitude or a city name is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenWeatherMap API error:", errorData);
            // Provide a more user-friendly error if city not found
            if (response.status === 404) {
                 return new Response(JSON.stringify({ error: `Could not find weather for "${city}". Please check the spelling.` }), { status: 404, headers: { 'Content-Type': 'application/json' } });
            }
            throw new Error(errorData.message || `Weather API request failed with status ${response.status}`);
        }

        const data = await response.json();

        const weatherInfo = {
            temperature: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            location: data.name,
        };

        return new Response(JSON.stringify(weatherInfo), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Error in getWeather function:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});