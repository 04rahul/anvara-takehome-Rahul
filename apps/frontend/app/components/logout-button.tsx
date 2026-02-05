'use client';

import { authClient } from '@/auth-client';
import { Button } from '@/app/components/ui/button';
import { toast } from '@/app/components/ui/toast';

export function LogoutButton() {
  return (
    <Button
      onClick={async () => {
        try {
          // Sign out and wait for it to complete
          const { error } = await authClient.signOut();
          
          if (error) {
            console.error('Logout error:', error);
            toast({
              title: 'Logout failed',
              description: 'Please try again.',
              variant: 'error',
            });
          }
          
          // Use window.location for a full page reload to ensure cookies are cleared
          // This ensures the server components get fresh session data
          window.location.href = '/';
        } catch (err) {
          console.error('Logout failed:', err);
          toast({
            title: 'Logout failed',
            description: 'Please try again.',
            variant: 'error',
          });
          // Fallback to full page reload even on error
          window.location.href = '/';
        }
      }}
      variant="secondary"
      size="sm"
      className="text-[var(--color-muted)] hover:bg-[var(--color-danger-surface-hover)] hover:border-[var(--color-danger-border-hover)] hover:text-[var(--color-error)] focus-visible:ring-[var(--color-error)]"
    >
      Logout
    </Button>
  );
}
