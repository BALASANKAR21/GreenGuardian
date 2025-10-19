"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { app } from "../../../../firebase";
import { getAuth, signOut } from "firebase/auth";
import { User } from "lucide-react";

function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    username: "",
    location: "",
    profilePicture: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data from backend
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name || "",
            email: data.email || auth.currentUser?.email || "",
            username: data.username || "",
            location: data.location || "",
            profilePicture: data.profilePicture || "",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch user data. Showing defaults.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch user data. Showing defaults.",
          variant: "destructive",
        });
      }
    };

    fetchUser();
  }, [userId]);

  // Handle profile picture selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUserData((prev) => ({
        ...prev,
        profilePicture: URL.createObjectURL(file), // preview
      }));
    }
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      let profilePictureUrl = userData.profilePicture;

      // Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("profilePicture", imageFile);

        const uploadRes = await fetch(`/api/users/${userId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        profilePictureUrl = uploadData.url;
      }

      // Update user info
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          location: userData.location,
          profilePicture: profilePictureUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      setImageFile(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      toast({
        title: "Logout Failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          View and edit your personal information.
        </p>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your photo and personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  userData.profilePicture || "https://i.pravatar.cc/150?u=default"
                }
                alt={userData.name || "User"}
              />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button variant="outline">Change Photo</Button>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={userData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={userData.username}
                onChange={(e) =>
                  setUserData({ ...userData, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={userData.location}
                onChange={(e) =>
                  setUserData({ ...userData, location: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveChanges} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
