import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';

interface EmailChangeDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  currentEmail?: string;
}

export function EmailChangeDialog({ open, isOpen, onOpenChange, onClose }: EmailChangeDialogProps) {
  const [newEmail, setNewEmail] = useState('');

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Novo Email</Label>
            <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <Button className="w-full">Alterar Email</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}