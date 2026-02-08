'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { ButtonLink } from '@/app/components/ui/button-link';
import { Button } from '@/app/components/ui/button';

interface LoginPromptModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoginPromptModal({ open, onOpenChange }: LoginPromptModalProps) {
    

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Login Required</DialogTitle>
                    <DialogDescription>
                        You need to be logged in as a sponsor to request placements.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <p className="text-sm text-[--color-muted]">
                        Please log in to your sponsor account to submit placement requests and manage your campaigns.
                    </p>

                    <div className="flex gap-3">
                        <ButtonLink href="/login" className="flex-1">
                            Go to Login
                        </ButtonLink>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                console.log('Cancel clicked');
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
