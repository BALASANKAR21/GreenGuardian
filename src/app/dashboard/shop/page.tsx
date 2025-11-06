
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ExternalLink } from 'lucide-react';

const products = [
  {
    id: 'prod-1',
    name: 'Gardening Tool Set',
    description: 'A 3-piece set including a trowel, transplanter, and cultivator. Perfect for indoor and outdoor gardening.',
    imageId: 'product-tools',
    links: {
      amazon: 'https://www.amazon.in/s?k=gardening+tool+set',
      flipkart: 'https://www.flipkart.com/search?q=gardening+tool+set',
    }
  },
  {
    id: 'prod-2',
    name: 'Durable Gardening Gloves',
    description: 'Protect your hands with these comfortable, breathable, and water-resistant gloves.',
    imageId: 'product-gloves',
    links: {
      amazon: 'https://www.amazon.in/s?k=gardening+gloves',
      flipkart: 'https://www.flipkart.com/search?q=gardening+gloves',
    }
  },
  {
    id: 'prod-3',
    name: 'Modern Ceramic Pots',
    description: 'A stylish set of 2 ceramic pots with drainage holes and saucers. Ideal for succulents and small plants.',
    imageId: 'product-pot',
    links: {
      amazon: 'https://www.amazon.in/s?k=ceramic+plant+pots',
      flipkart: 'https://www.flipkart.com/search?q=ceramic+plant+pots',
    }
  },
  {
    id: 'prod-4',
    name: 'Premium Potting Mix',
    description: 'Enriched with organic nutrients, this soil provides an ideal environment for healthy plant growth.',
    imageId: 'product-soil',
    links: {
      amazon: 'https://www.amazon.in/s?k=potting+mix+soil',
      flipkart: 'https://www.flipkart.com/search?q=potting+mix+soil',
    }
  }
];

export default function ShopPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Shop Gardening Essentials</h1>
        <p className="text-muted-foreground">Find the best tools and supplies from popular Indian retailers.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const image = PlaceHolderImages.find(p => p.id === product.imageId);
          return (
            <Card key={product.id} className="flex flex-col">
              {image && (
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                  data-ai-hint={image.imageHint}
                />
              )}
              <CardHeader>
                <CardTitle className="font-headline">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter className="flex flex-col items-start gap-2">
                <h4 className="text-sm font-semibold">Buy on:</h4>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={product.links.amazon} target="_blank" rel="noopener noreferrer">
                      Amazon India <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={product.links.flipkart} target="_blank" rel="noopener noreferrer">
                      Flipkart <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            GreenGuardian provides links to third-party e-commerce sites for your convenience. We are not affiliated with these retailers and do not earn any commission. Product availability and prices are subject to change on the retailer's website.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
