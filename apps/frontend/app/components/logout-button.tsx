'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/auth-client';

export function LogoutButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={async () => {
        try {
          // Sign out and wait for it to complete
          const { error } = await authClient.signOut();
          
          if (error) {
            console.error('Logout error:', error);
          }
          
          // Use window.location for a full page reload to ensure cookies are cleared
          // This ensures the server components get fresh session data
          window.location.href = '/';
        } catch (err) {
          console.error('Logout failed:', err);
          // Fallback to full page reload even on error
          window.location.href = '/';
        }
      }}
      className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
    >
      Logout
    </button>
  );
}
