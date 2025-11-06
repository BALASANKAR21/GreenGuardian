"use client";

import React, { useState, useEffect } from "react";
import { auth, database } from "../../firebase"; // <- updated path
import { ref, onValue, update, off } from "firebase/database";
import { onAuthStateChanged, User } from "firebase/auth";

interface Profile {
  name: string;
  email: string;
  age: string;
  preferences: string;
}

const RealtimeUserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    age: "",
    preferences: "",
  });
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    let userRef: ReturnType<typeof ref> | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        userRef = ref(database, `users/${currentUser.uid}`);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val() as Profile | null;
          if (data) {
            setProfile({ ...data, email: currentUser.email || "" });
          } else {
            const defaultProfile: Profile = {
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              age: "",
              preferences: "",
            };
            update(userRef, defaultProfile).catch(console.error);
            setProfile(defaultProfile);
          }
        });
      } else {
        setUser(null);
        setProfile({ name: "", email: "", age: "", preferences: "" });
      }
    });

    return () => {
      unsubscribeAuth();
      if (userRef) off(userRef);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setIsChanged(true);
  };

  const handleSave = () => {
    if (!user || !isChanged) return;
    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, profile)
      .then(() => setIsChanged(false))
      .catch(console.error);
  };

  if (!user)
    return <p className="text-center py-6">Please log in to see your profile.</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded shadow space-y-3">
      <h2 className="text-xl font-bold">Welcome, {user.displayName || user.email}</h2>

      <input
        type="text"
        name="name"
        value={profile.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        value={profile.email}
        readOnly
        className="w-full p-2 border rounded bg-gray-100"
      />
      <input
        type="number"
        name="age"
        value={profile.age}
        onChange={handleChange}
        placeholder="Age"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="preferences"
        value={profile.preferences}
        onChange={handleChange}
        placeholder="Preferences"
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleSave}
        disabled={!isChanged}
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        Save Profile
      </button>

      <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
};

export default RealtimeUserProfile;
