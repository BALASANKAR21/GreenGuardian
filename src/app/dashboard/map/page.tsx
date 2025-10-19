"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const greenSpaces = [
  { name: "City Park", address: "123 Main St, Your City", coordinates: [77.5946, 12.9716] },
  { name: "Riverfront Greenway", address: "456 River Rd, Your City", coordinates: [77.59, 12.97] },
  { name: "Community Garden", address: "789 Oak Ave, Your City", coordinates: [77.6, 12.965] },
];

const nurseries = [
  { name: "The Green Spot", address: "101 Plant Ln, Your City", coordinates: [77.595, 12.975] },
  { name: "Urban Roots Nursery", address: "202 Flower Blvd, Your City", coordinates: [77.598, 12.973] },
  { name: "Leafy Wonders", address: "303 Garden Ct, Your City", coordinates: [77.592, 12.97] },
];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  // Fetch user's location based on IP
  useEffect(() => {
    async function fetchUserLocation() {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data && data.latitude && data.longitude) {
          setUserLocation([data.longitude, data.latitude]);
        } else {
          // Default to Bangalore if no IP data found
          setUserLocation([77.5946, 12.9716]);
        }
      } catch (error) {
        console.error("Error fetching location by IP:", error);
        setUserLocation([77.5946, 12.9716]); // fallback
      }
    }

    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || !userLocation) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Add green space markers
    greenSpaces.forEach((space) => {
      new mapboxgl.Marker({ color: "#16a34a" })
        .setLngLat(space.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setText(space.name))
        .addTo(map.current!);
    });

    // Add nursery markers
    nurseries.forEach((nursery) => {
      new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat(nursery.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup().setText(nursery.name))
        .addTo(map.current!);
    });

    // Add user location marker
    new mapboxgl.Marker({ color: "#ff0000" })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setText("You are here"))
      .addTo(map.current!);

    return () => map.current?.remove();
  }, [MAPBOX_TOKEN, userLocation]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Local Greenery Map</h1>
        <p className="text-muted-foreground">
          Discover green spaces and plant shops in your area.
        </p>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-lg overflow-hidden shadow-sm"
          />
        </CardContent>
      </Card>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-primary" /> Local Green Spaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {greenSpaces.map((space, index) => (
              <div key={space.name}>
                <div className="font-semibold">{space.name}</div>
                <p className="text-sm text-muted-foreground">{space.address}</p>
                {index < greenSpaces.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="text-primary" /> Nearby Nurseries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nurseries.map((nursery, index) => (
              <div key={nursery.name}>
                <div className="font-semibold">{nursery.name}</div>
                <p className="text-sm text-muted-foreground">{nursery.address}</p>
                {index < nurseries.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
