import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { vlogs } from '@/lib/vlog-data';

export default function VlogsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Urban Gardening Vlogs</h1>
        <p className="text-muted-foreground">Tips, tricks, and stories from our community of plant lovers.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {vlogs.map((vlog) => {
          const image = PlaceHolderImages.find(p => p.id === vlog.imageId);
          return (
            <Link href={`/dashboard/vlogs/${vlog.id}`} key={vlog.id}>
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <CardHeader>
                  <h2 className="text-xl font-bold font-headline leading-snug">{vlog.title}</h2>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">{vlog.excerpt}</p>
                </CardContent>
                <CardFooter className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={vlog.authorAvatar} alt={vlog.author} />
                    <AvatarFallback>{vlog.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold">{vlog.author}</p>
                    <p className="text-muted-foreground">{vlog.date}</p>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
