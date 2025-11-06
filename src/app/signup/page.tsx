"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { app } from '../../../firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage() {
  const bgImage = PlaceHolderImages.find((img) => img.id === 'login-bg');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = getAuth(app);
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // get token for backend auth
      const token = await cred.user.getIdToken();

      const formData = new FormData();
      formData.append('displayName', displayName || '');
      formData.append('email', email);
      formData.append('username', (displayName || email).replace(/\s+/g, '').toLowerCase());

      const avatarInput = document.getElementById('avatar') as HTMLInputElement | null;
      if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }

      await fetch('/api/users/register', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Leaf className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline">Sign Up for GreenGuardian</h1>
            <p className="text-balance text-muted-foreground">Create your account to access your dashboard</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your email and password to create an account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSignup}>
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Full name</Label>
                  <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <label className="block mb-2">
                  <span className="text-sm">Profile image (optional)</span>
                  <input id="avatar" type="file" accept="image/*" className="mt-1" />
                </label>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            data-ai-hint={bgImage.imageHint}
            fill
            className="h-full w-full object-cover dark:brightness-[0.4]"
          />
        )}
      </div>
    </div>
  );
}
