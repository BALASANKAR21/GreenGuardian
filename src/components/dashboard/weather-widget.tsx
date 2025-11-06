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
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        // 1. Get location from IP (use /json endpoint and guard against missing fields)
  const ipInfoResponse = await fetch(`https://ipinfo.io/json?token=${IPINFO_API_KEY}`);
  if (!ipInfoResponse.ok) throw new Error('Failed to fetch location data.');
  const ipInfo = await ipInfoResponse.json();
  // expose the IP so UI shows it explicitly - strip IPv6 zone ids like "%en0"
  const rawIp = ipInfo?.ip || null;
  setIpAddress(rawIp ? String(rawIp).replace(/%.+$/, '') : null);

        let weatherResponse;
        if (ipInfo?.loc) {
          const [lat, lon] = String(ipInfo.loc).split(',');

          // 2a. Get weather from coordinates
          weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
        } else if (ipInfo?.city) {
          // 2b. Fallback: query by city name if coords are unavailable
          const city = `${ipInfo.city}${ipInfo.region ? ',' + ipInfo.region : ''}${ipInfo.country ? ',' + ipInfo.country : ''}`;
          weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
        } else {
          // 2c. Final fallback: use a sensible default (Chennai)
          const defaultLat = '13.0827';
          const defaultLon = '80.2707';
          weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${defaultLat}&lon=${defaultLon}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
        }

  if (!weatherResponse || !weatherResponse.ok) throw new Error('Failed to fetch weather data.');
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
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <span className="text-sm text-muted-foreground">{ipAddress ? `IP: ${ipAddress}` : 'Fetching IP...'}</span>
          </div>
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

  // Use optional chaining to avoid runtime errors if data shape is unexpected
  const mainWeather = weather.weather?.[0]?.main;
  const description = weather.weather?.[0]?.description || 'N/A';
  const temp = weather.main?.temp != null ? Math.round(weather.main.temp) : '--';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Weather in {weather.name || 'Unknown'}</span>
            <span className="text-sm text-muted-foreground">{ipAddress ? `IP: ${ipAddress}` : null}</span>
          </div>
          {weatherIcons[mainWeather || ''] || <Thermometer className="h-6 w-6" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{temp}°C</p>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
