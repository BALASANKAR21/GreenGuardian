import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Plant } from '@/lib/types';

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === plant.imageId);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {image && (
        <Image
          src={image.imageUrl}
          alt={image.description}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint={image.imageHint}
        />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{plant.name}</CardTitle>
          <Badge variant={plant.careLevel === 'Newbie' ? 'secondary' : 'default'}
             className={plant.careLevel === 'Expert' ? 'bg-accent text-accent-foreground' : ''}>
            {plant.careLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{plant.description}</p>
        <div className="space-y-2 text-sm">
          <div>
            <h4 className="font-semibold">Pros:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              {plant.pros.map((pro, i) => <li key={i}>{pro}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Cons:</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              {plant.cons.map((con, i) => <li key={i}>{con}</li>)}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
