import Image from "next/image";
import Link from "next/link";
import RealtimeUserProfile from "@/components/RealtimeUserData";
import { Leaf, Map, Camera, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <Leaf className="w-8 h-8 text-primary" />,
    title: "Smart Recommendations",
    description: "Get plant suggestions perfectly tailored to your local climate, space, and preferences.",
  },
  {
    icon: <Camera className="w-8 h-8 text-primary" />,
    title: "Plant Identification",
    description: "Upload a photo of any plant to instantly identify its species and learn how to care for it.",
  },
  {
    icon: <Wind className="w-8 h-8 text-primary" />,
    title: "Environmental Insights",
    description: "Utilize real-time air quality and weather data to choose plants that thrive and purify your space.",
  },
  {
    icon: <Map className="w-8 h-8 text-primary" />,
    title: "Local Greenery Map",
    description: "Discover nearby nurseries, parks, and recommended planting zones in your community.",
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold font-headline">GreenGuardian</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center z-0"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="container px-4 md:px-6 relative z-20 text-center text-primary-foreground">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                Helping Cities Go Green
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                GreenGuardian is a smart assistant to help urban residents select the most suitable plants for their living spaces.
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Grow Smarter, Not Harder
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our intelligent tools take the guesswork out of urban gardening, making it easy to cultivate a thriving green space.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-col items-center text-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Realtime User Profile Section */}
        <section className="py-12 md:py-24 bg-background">
          <h2 className="text-3xl font-bold text-center mb-6">Your Profile</h2>
          <RealtimeUserProfile />
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 GreenGuardian. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
