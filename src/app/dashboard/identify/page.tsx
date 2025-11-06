'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { identifyPlant, PlantIdentificationOutput } from '@/ai/flows/plant-identification';

export default function IdentifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationOutput | null>(null);
  const [fileData, setFileData] = useState<{ file: File, dataUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File, dataUri: string) => {
    setFileData({ file, dataUri });
    setResult(null); // Clear previous results
  };

  const handleIdentify = async () => {
    if (!fileData) {
      toast({
        variant: 'destructive',
        title: 'No image selected',
        description: 'Please upload an image of a plant to identify.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const identification = await identifyPlant({ photoDataUri: fileData.dataUri });
      setResult(identification);
    } catch (error) {
      console.error('Error identifying plant:', error);
      toast({
        variant: 'destructive',
        title: 'Identification Failed',
        description: 'The AI could not identify the plant. Please try another image.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Plant Identifier</h1>
        <p className="text-muted-foreground">Upload a photo to identify a plant species.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Plant Image</CardTitle>
          <CardDescription>
            For best results, use a clear image of the plant's leaves or flowers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <ImageUploader onFileSelect={handleFileSelect} />
          {fileData && (
            <Button onClick={handleIdentify} disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Identify Plant
            </Button>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Identification Result</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 items-center">
            {fileData && (
              <Image
                src={fileData.dataUri}
                alt="Identified plant"
                width={400}
                height={400}
                className="rounded-lg object-cover w-full aspect-square"
              />
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Common Name</h3>
                <p className="text-2xl font-bold font-headline">{result.commonName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Scientific Name</h3>
                <p className="text-xl italic">{result.scientificName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Confidence</h3>
                <div className="flex items-center gap-2">
                  <Progress value={result.probability * 100} className="w-full" />
                  <span className="font-semibold">{Math.round(result.probability * 100)}%</span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                 { result.probability > 0.7 ? <CheckCircle className="h-6 w-6 text-primary" /> : <HelpCircle className="h-6 w-6 text-yellow-500" /> }
                <div className="flex-1">
                  <h4 className="font-semibold">Note</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.probability > 0.7 
                      ? "The AI is quite confident in this identification." 
                      : "The AI has low confidence. The image might be unclear or the plant could be rare. Please double-check with other resources."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
