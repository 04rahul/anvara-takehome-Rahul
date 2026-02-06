'use client';

import React, { useId, useState } from 'react';
import { authClient } from '@/auth-client';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Select } from '@/app/components/ui/select';
import { getUserRole } from '@/lib/auth-helpers';


export default function LoginPage() {
  const roleSelectId = useId();
  const [role, setRole] = useState<'sponsor' | 'publisher'>('sponsor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill credentials based on selected role
  const email = role === 'sponsor' ? 'sponsor@example.com' : 'publisher@example.com';
  const password = 'password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Use Better Auth signIn.email with proper callbacks
    const { error: signInError } = await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async (ctx) => {
          // Fetch user role to determine redirect
          try {
            const userId = ctx.data?.user?.id;
            if (userId) {
              const roleData = await getUserRole(userId);
              
              // Use full page reload to ensure server components get fresh session data
              if (roleData.role === 'sponsor') {
                window.location.href = '/dashboard/sponsor';
              } else if (roleData.role === 'publisher') {
                window.location.href = '/dashboard/publisher';
              } else {
                window.location.href = '/';
              }
            } else {
              window.location.href = '/';
            }
          } catch {
            window.location.href = '/';
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Login failed');
          setLoading(false);
        },
      }
    );

    // Handle any errors not caught by onError callback
    if (signInError) {
      setError(signInError.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-background]">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Login to Anvara</h1>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={roleSelectId}
              className="mb-2 block text-sm font-medium text-[--color-foreground]"
            >
              Quick Login As
            </label>
            <Select
              id={roleSelectId}
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'sponsor' | 'publisher')}
              disabled={loading}
            >
              <option value="sponsor">Sponsor (sponsor@example.com)</option>
              <option value="publisher">Publisher (publisher@example.com)</option>
            </Select>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : `Login as ${role === 'sponsor' ? 'Sponsor' : 'Publisher'}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
