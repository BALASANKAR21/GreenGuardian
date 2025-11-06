import Link from 'next/link';
import { Leaf, Sun, Cloud, CloudRain, CloudDrizzle, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock placeholder images data - using your specific image URLs
const PlaceHolderImages = [
  { 
    id: 'plant-snake', 
    imageUrl: 'https://plantorbit.com/cdn/shop/files/white-Photoroom_-_2025-08-08T104716.259_e771088d-5f1f-44e9-96e1-4d2e1e9f1811.jpg?v=1754630343', 
    description: 'Snake Plant', 
    imageHint: 'A tall snake plant with green and yellow edges' 
  },
  { 
    id: 'plant-pothos', 
    imageUrl: 'https://budsnblush.com/cdn/shop/files/Spring_Starter_Pack_Flowers_Instagram_Post_Instagram_Post__o6b6QGiC2y.jpg?v=1730602659', 
    description: 'Golden Pothos', 
    imageHint: 'A trailing golden pothos plant with heart-shaped leaves' 
  },
  { 
    id: 'plant-zz', 
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjiGJ9xgRVRCBLJSWmtvTdvsI6nCMep-BOqw&s', 
    description: 'ZZ Plant', 
    imageHint: 'A glossy ZZ plant with dark green leaves' 
  },
];

const featuredPlants = [
  { id: 'plant-snake', name: 'Snake Plant', description: 'Extremely hardy and great for beginners.'},
  { id: 'plant-pothos', name: 'Golden Pothos', description: 'A forgiving and fast-growing vine.'},
  { id: 'plant-zz', name: 'ZZ Plant', description: 'Thrives on neglect and low light.'},
];

// Weather Widget Component
function WeatherWidget() {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'partly cloudy':
        return <Cloud className="h-8 w-8 text-gray-400" />;
      case 'rainy':
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Static weather data - ONLY LOCATION CHANGED
  const weather = {
    temperature: 30,
    condition: 'Sunny',
    humidity: 64,
    windSpeed: 13,
    location: 'Vellore'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-headline">Weather</CardTitle>
          <CardDescription>{weather.location}</CardDescription>
        </div>
        {getWeatherIcon(weather.condition)}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
            <span className="text-muted-foreground capitalize">{weather.condition}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Humidity</span>
              <div className="font-medium">{weather.humidity}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Wind</span>
              <div className="font-medium">{weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Air Quality Widget Component
function AirQualityWidget() {
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', bgColor: 'bg-orange-500' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', bgColor: 'bg-red-500' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500', bgColor: 'bg-purple-500' };
    return { level: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-800' };
  };

  // Static air quality data - ONLY LOCATION CHANGED
  const airQuality = {
    aqi: 117,
    level: 'Poor',
    pm25: 42,
    pm10: 66,
    location: 'Vellore'
  };

  const aqiInfo = getAQILevel(airQuality.aqi);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-headline">Air Quality</CardTitle>
          <CardDescription>{airQuality.location}</CardDescription>
        </div>
        <Gauge className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${aqiInfo.color}`}>{airQuality.aqi}</span>
            <span className="text-muted-foreground">AQI</span>
            <span className={`text-sm font-medium ${aqiInfo.color} ml-2`}>{aqiInfo.level}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PM2.5</span>
              <span className="font-medium">{airQuality.pm25} μg/m³</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PM10</span>
              <span className="font-medium">{airQuality.pm10} μg/m³</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${aqiInfo.bgColor}`}
              style={{ width: `${Math.min(100, (airQuality.aqi / 300) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Urban Gardener!</h1>
        <p className="text-muted-foreground">Here's what's happening in your environment today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WeatherWidget />
        <AirQualityWidget />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Featured Plants for Beginners</CardTitle>
          <CardDescription>
            Looking for a new green friend? These are some of the easiest plants to start with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlants.map((plant) => {
              const image = PlaceHolderImages.find(p => p.id === plant.id);
              return (
                <div key={plant.id} className="group relative">
                  {image && (
                    // Using regular img tag instead of Next.js Image component
                    <img
                      src={image.imageUrl}
                      alt={image.description}
                      className="rounded-lg object-cover w-full aspect-[4/3]"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                  <div className="absolute bottom-0 left-0 p-4 text-primary-foreground">
                    <h3 className="font-bold text-lg">{plant.name}</h3>
                    <p className="text-sm">{plant.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button asChild className="mt-6">
            <Link href="/dashboard/recommendations">
              <Leaf className="mr-2 h-4 w-4" /> Find more plants
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}