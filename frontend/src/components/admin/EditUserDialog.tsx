import { useState } from 'react';
import { User } from '@/types/User';
import { Store } from '@/types/Store';
import { updateUser } from '@/services/user/updateUser';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface EditUserDialogProps {
  user: User | null;
  stores: Store[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

export function EditUserDialog({
  user,
  stores,
  isOpen,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  console.log('EditUserDialog props:', { user, stores, isOpen });
  const [formData, setFormData] = useState({
    email: user?.email || '',
    role: user?.role || 'USER',
    image: user?.image || '',
    storeId: user?.storeId || 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const updateData: Record<string, any> = {};
      if (formData.email !== '' && formData.email !== user.email) updateData.email = formData.email;
      if (formData.role && formData.role !== user.role) updateData.role = formData.role;
      const trimmedImage = formData.image.trim();
      if (formData.image !== '' && formData.image !== user.image) updateData.image = trimmedImage;
      const storeIdValue = formData.storeId === 'none' ? null : formData.storeId;
      if (storeIdValue !== null && storeIdValue !== '' && storeIdValue !== user.storeId) updateData.storeId = storeIdValue;

      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const updatedUser = await updateUser(user.id, updateData);
      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as any })
              }
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeId">Assigned Store</Label>
            <Select
              value={formData.storeId}
              onValueChange={(value) =>
                setFormData({ ...formData, storeId: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="storeId">
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
