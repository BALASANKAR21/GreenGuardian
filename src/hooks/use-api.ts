import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  UserService,
  PlantService,
  GardenService,
  EnvironmentalService,
  UserProfile,
  Plant,
  GardenPlant,
  EnvironmentalData
} from '@/lib/api-services';

// User Profile Hooks
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const userService = new UserService();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    try {
      const updated = await userService.updateProfile(data);
      setProfile(updated);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  }

  return { profile, loading, updateProfile };
}

// Plant Hooks
export function usePlants(initialQuery: string = '') {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const { toast } = useToast();
  const plantService = new PlantService();

  useEffect(() => {
    if (query) {
      searchPlants(query);
    }
  }, [query]);

  async function searchPlants(searchQuery: string) {
    setLoading(true);
    try {
      const result = await plantService.searchPlants(searchQuery);
      setPlants(result.plants);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search plants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return { plants, loading, setQuery };
}

// Garden Hooks
export function useGarden() {
  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const gardenService = new GardenService();

  useEffect(() => {
    fetchGarden();
  }, []);

  async function fetchGarden() {
    try {
      const data = await gardenService.getUserGarden();
      setPlants(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load garden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function addPlant(plantId: string, location: { latitude: number; longitude: number }, notes?: string) {
    try {
      const plant = await gardenService.addPlant({ plantId, location, notes });
      setPlants([...plants, plant]);
      toast({
        title: 'Success',
        description: 'Plant added to garden',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add plant',
        variant: 'destructive',
      });
    }
  }

  async function updatePlant(plantId: string, data: Partial<GardenPlant>) {
    try {
      const updated = await gardenService.updatePlant(plantId, data);
      setPlants(plants.map(p => p.id === plantId ? updated : p));
      toast({
        title: 'Success',
        description: 'Plant updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update plant',
        variant: 'destructive',
      });
    }
  }

  async function removePlant(plantId: string) {
    try {
      await gardenService.removePlant(plantId);
      setPlants(plants.filter(p => p.id !== plantId));
      toast({
        title: 'Success',
        description: 'Plant removed from garden',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove plant',
        variant: 'destructive',
      });
    }
  }

  return { plants, loading, addPlant, updatePlant, removePlant };
}

// Environmental Data Hooks
export function useEnvironmentalData() {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [history, setHistory] = useState<EnvironmentalData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const envService = new EnvironmentalService();

  useEffect(() => {
    fetchLatestData();
  }, []);

  async function fetchLatestData() {
    try {
      const latest = await envService.getLatestData();
      setData(latest);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load environmental data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory(startDate: string, endDate: string) {
    setLoading(true);
    try {
      const data = await envService.getHistory(startDate, endDate);
      setHistory(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return { data, history, loading, fetchHistory };
}