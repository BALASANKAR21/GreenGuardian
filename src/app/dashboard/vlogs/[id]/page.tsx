import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { vlogs } from '@/lib/vlog-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function VlogPostPage({ params }: { params: { id: string } }) {
  const vlog = vlogs.find((v) => v.id === params.id);

  if (!vlog) {
    notFound();
  }

  const heroImage = PlaceHolderImages.find((img) => img.id === 'vlog-hero');

  return (
    <div className="space-y-8">
      <Button asChild variant="outline">
        <Link href="/dashboard/vlogs" className="inline-flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Vlogs
        </Link>
      </Button>

      <article>
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
          {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={vlog.title}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
             />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
             <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline text-primary-foreground">
                {vlog.title}
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={vlog.authorAvatar} alt={vlog.author} />
                <AvatarFallback>{vlog.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{vlog.author}</p>
                <p>{vlog.date}</p>
              </div>
            </div>
        </div>
        
        <Separator className="my-8"/>

        <div className="prose prose-stone dark:prose-invert max-w-none text-foreground text-lg">
          {vlog.content.map((paragraph, index) => {
             const parts = paragraph.split(/(\*\*.*?\*\*)/g);
             return (
                <p key={index}>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
             )
          })}
        </div>
      </article>

    </div>
  );
}

// Helper to generate static pages for each vlog post
export async function generateStaticParams() {
  return vlogs.map((vlog) => ({
    id: vlog.id,
  }));
}
