'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { IPINFO_API_KEY, OPENWEATHER_API_KEY } from '@/lib/api-keys';
import type { WeatherData } from '@/lib/types';

const weatherIcons: { [key: string]: React.ReactNode } = {
  Clear: <Sun className="h-6 w-6 text-yellow-400" />,
  Clouds: <Cloud className="h-6 w-6 text-gray-400" />,
  Rain: <CloudRain className="h-6 w-6 text-blue-400" />,
  Snow: <CloudSnow className="h-6 w-6 text-blue-200" />,
  Wind: <Wind className="h-6 w-6 text-gray-500" />,
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        // 1. Get location from IP
        const ipInfoResponse = await fetch(`https://ipinfo.io?token=${IPINFO_API_KEY}`);
        if (!ipInfoResponse.ok) throw new Error('Failed to fetch location data.');
        const ipInfo = await ipInfoResponse.json();
        const [lat, lon] = ipInfo.loc.split(',');

        // 2. Get weather from location
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );
        if (!weatherResponse.ok) throw new Error('Failed to fetch weather data.');
        const weatherData = await weatherResponse.json();

        setWeather(weatherData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error fetching weather',
          description: 'Could not load weather data for your location.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load weather data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weather in {weather.name}</span>
          {weatherIcons[weather.weather[0].main] || <Thermometer className="h-6 w-6" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
        <p className="text-muted-foreground">{weather.weather[0].description}</p>
      </CardContent>
    </Card>
  );
}
