"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const greenSpaces = [
  { name: "City Park", address: "123 Main St, Vellore", coordinates: [79.1559, 12.9719] },
  { name: "Riverfront Greenway", address: "456 River Rd, Vellore", coordinates: [79.1602, 12.9705] },
  { name: "Community Garden", address: "789 Oak Ave, Vellore", coordinates: [79.1583, 12.9687] },
];

const nurseries = [
  { name: "The Green Spot", address: "101 Plant Ln, Vellore", coordinates: [79.1575, 12.9728] },
  { name: "Urban Roots Nursery", address: "202 Flower Blvd, Vellore", coordinates: [79.161, 12.9732] },
  { name: "Leafy Wonders", address: "303 Garden Ct, Vellore", coordinates: [79.154, 12.9698] },
];

// Fixed VIT Vellore coordinates
const VIT_VELLORE_LOCATION: [number, number] = [79.1594, 12.9692];

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: VIT_VELLORE_LOCATION,
      zoom: 13,
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

    // Add fixed user (VIT Vellore) marker
    new mapboxgl.Marker({ color: "#ff0000" })
      .setLngLat(VIT_VELLORE_LOCATION)
      .setPopup(new mapboxgl.Popup().setText("You are here (VIT Vellore)"))
      .addTo(map.current!);

    return () => map.current?.remove();
  }, [MAPBOX_TOKEN]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Local Greenery Map</h1>
        <p className="text-muted-foreground">
          Discover green spaces and plant shops around You!
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
