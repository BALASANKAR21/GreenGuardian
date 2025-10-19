'use client';

import { useState } from 'react';
import { PlantCard } from '@/components/dashboard/plant-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { smartPlantSuggestions, SmartPlantSuggestionsOutput } from '@/ai/flows/smart-plant-suggestions';
import { Loader2, Sparkles } from 'lucide-react';
import type { Plant } from '@/lib/types';

const allPlants: Plant[] = [
  { id: '1', name: 'Snake Plant', imageId: 'plant-snake', careLevel: 'Newbie', light: 'low', space: 'small', pros: ['Air purifying', 'Low water needs'], cons: ['Toxic if ingested'], description: 'A super hardy plant that thrives on neglect.' },
  { id: '2', name: 'Monstera Deliciosa', imageId: 'plant-monstera', careLevel: 'Intermediate', light: 'medium', space: 'large', pros: ['Iconic look', 'Fast growing'], cons: ['Needs support when large'], description: 'Famous for its split leaves, it adds a tropical feel.' },
  { id: '3', name: 'Fiddle Leaf Fig', imageId: 'plant-fiddle-leaf', careLevel: 'Expert', light: 'high', space: 'large', pros: ['Statement piece', 'Tree-like look'], cons: ['Finicky about light/water'], description: 'A beautiful but challenging plant for experienced owners.' },
  { id: '4', name: 'ZZ Plant', imageId: 'plant-zz', careLevel: 'Newbie', light: 'low', space: 'medium', pros: ['Drought tolerant', 'Low light tolerant'], cons: ['Slow growing'], description: 'Almost indestructible, perfect for forgetful waterers.' },
  { id: '5', name: 'Golden Pothos', imageId: 'plant-pothos', careLevel: 'Newbie', light: 'medium', space: 'small', pros: ['Easy to propagate', 'Trailing vine'], cons: ['Can become leggy'], description: 'A versatile plant that can hang or climb.' },
  { id: '6', name: 'Spider Plant', imageId: 'plant-spider', careLevel: 'Newbie', light: 'medium', space: 'medium', pros: ['Produces "babies"', 'Air purifying'], cons: ['Prone to brown tips'], description: 'A classic, easy-to-care-for houseplant.' },
];

export default function RecommendationsPage() {
  const [filters, setFilters] = useState({ light: 'all', careLevel: 'all', space: 'all' });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<SmartPlantSuggestionsOutput | null>(null);
  const [plantDescription, setPlantDescription] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const { toast } = useToast();

  const handleFilterChange = (filterType: keyof typeof filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const filteredPlants = allPlants.filter((plant) => {
    return (
      (filters.light === 'all' || plant.light === filters.light) &&
      (filters.careLevel === 'all' || plant.careLevel === filters.careLevel) &&
      (filters.space === 'all' || plant.space === filters.space)
    );
  });
  
  const handleGetSuggestion = async () => {
    if (!plantDescription || !environmentDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please describe both the plant and your environment.',
      });
      return;
    }
    setIsLoading(true);
    setSuggestionResult(null);
    try {
      const result = await smartPlantSuggestions({ plantDescription, environmentDescription });
      setSuggestionResult(result);
    } catch (error) {
      console.error('Error getting smart suggestion:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a suggestion at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Plant Recommendations</h1>
        <p className="text-muted-foreground">Find the perfect green companion for your space.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Plants</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Light Level</Label>
            <Select onValueChange={handleFilterChange('light')} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Select light level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low Light</SelectItem>
                <SelectItem value="medium">Medium Light</SelectItem>
                <SelectItem value="high">High Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Care Level</Label>
            <Select onValueChange={handleFilterChange('careLevel')} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Select care level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Newbie">Newbie</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Space</Label>
            <Select onValueChange={handleFilterChange('space')} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Select space required" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
      {filteredPlants.length === 0 && <p className="text-center text-muted-foreground">No plants match your criteria.</p>}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> Smart Suggestions Tool</CardTitle>
          <CardDescription>Have a specific plant in mind? Let our AI determine if it's a good fit for your environment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="plant-desc">Plant Description</Label>
                <Textarea id="plant-desc" placeholder="e.g., 'A Fiddle Leaf Fig that needs bright, indirect light and consistent watering...'" value={plantDescription} onChange={e => setPlantDescription(e.target.value)} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="env-desc">Your Environment</Label>
                <Textarea id="env-desc" placeholder="e.g., 'A small apartment with a south-facing window that gets hot in the afternoon. I travel a lot...'" value={environmentDescription} onChange={e => setEnvironmentDescription(e.target.value)} />
             </div>
          </div>
          <Button onClick={handleGetSuggestion} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Get AI Suggestion
          </Button>
          {suggestionResult && (
            <Card className={suggestionResult.isGoodFit ? 'border-primary' : 'border-destructive'}>
              <CardHeader>
                <CardTitle className={suggestionResult.isGoodFit ? 'text-primary' : 'text-destructive'}>
                  {suggestionResult.isGoodFit ? "It's a good fit!" : "May not be the best fit."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">AI Reasoning:</p>
                <p className="text-muted-foreground">{suggestionResult.reasoning}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
