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

  const DEFAULT_USER = {
    name: "bala sankar",
    email: auth.currentUser?.email || "balasankar21@gmail.com",
    username: "balasankar",
    location: "Vellore, India",
    profilePicture: "",
  };

  const [userData, setUserData] = useState({
    name: DEFAULT_USER.name,
    email: DEFAULT_USER.email,
    username: DEFAULT_USER.username,
    location: DEFAULT_USER.location,
    profilePicture: DEFAULT_USER.profilePicture,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data from backend — with safe defaults on any failure or empty response
  useEffect(() => {
    if (!userId) {
      // No user signed in — ensure defaults are visible
      setUserData({
        name: DEFAULT_USER.name,
        email: DEFAULT_USER.email,
        username: DEFAULT_USER.username,
        location: DEFAULT_USER.location,
        profilePicture: DEFAULT_USER.profilePicture,
      });
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/v1/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          // set defaults if non-OK
          if (!cancelled)
            setUserData({
              name: DEFAULT_USER.name,
              email: DEFAULT_USER.email,
              username: DEFAULT_USER.username,
              location: DEFAULT_USER.location,
              profilePicture: DEFAULT_USER.profilePicture,
            });

          toast({
            title: "Error",
            description: "Failed to fetch user data. Showing defaults.",
            variant: "destructive",
          });
          return;
        }

        const json = await res.json();
        const data = json?.data || json?.user || json || {};

        // If response is empty / missing critical fields, merge with defaults
        const merged = {
          name: data.name || DEFAULT_USER.name,
          email: data.email || auth.currentUser?.email || DEFAULT_USER.email,
          username: data.username || DEFAULT_USER.username,
          location: data.location || DEFAULT_USER.location,
          profilePicture: data.profilePicture || DEFAULT_USER.profilePicture,
        };

        if (!cancelled) setUserData(merged);
      } catch (e) {
        if (!cancelled)
          setUserData({
            name: DEFAULT_USER.name,
            email: DEFAULT_USER.email,
            username: DEFAULT_USER.username,
            location: DEFAULT_USER.location,
            profilePicture: DEFAULT_USER.profilePicture,
          });

        toast({
          title: "Error",
          description:
            e instanceof Error
              ? e.message
              : "Failed to fetch user data. Showing defaults.",
          variant: "destructive",
        });
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Clean up object URL previews to avoid memory leaks
  useEffect(() => {
    return () => {
      if (userData.profilePicture && userData.profilePicture.startsWith("blob:")) {
        URL.revokeObjectURL(userData.profilePicture);
      }
    };
  }, [userData.profilePicture]);

  // Handle profile picture selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // revoke previous blob url if any
      if (userData.profilePicture && userData.profilePicture.startsWith("blob:")) {
        URL.revokeObjectURL(userData.profilePicture);
      }

      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setUserData((prev) => ({
        ...prev,
        profilePicture: previewUrl, // preview
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
        const token = await auth.currentUser?.getIdToken();
        const formData = new FormData();
        formData.append("profilePicture", imageFile);

        const uploadRes = await fetch(`/api/v1/profile/upload`, {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        profilePictureUrl = uploadData.url || uploadData?.data?.url || profilePictureUrl;
      }

      // Update user info
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/v1/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
                  userData.profilePicture ||
                  "https://images.icon-icons.com/2483/PNG/512/user_icon_149851.png"
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
