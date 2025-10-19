import Link from 'next/link';
import Image from 'next/image';
import { Leaf } from 'lucide-react';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { AirQualityWidget } from '@/components/dashboard/air-quality-widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const featuredPlants = [
  { id: 'plant-snake', name: 'Snake Plant', description: 'Extremely hardy and great for beginners.'},
  { id: 'plant-pothos', name: 'Golden Pothos', description: 'A forgiving and fast-growing vine.'},
  { id: 'plant-zz', name: 'ZZ Plant', description: 'Thrives on neglect and low light.'},
];

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
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={400}
                      height={300}
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
