"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, UserMinus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { SectionHeader } from "../../_components/SectionHeader";
import StoreInformationCardField from "./_components/StoreInformationCardField";

// ---------------- Static Mock Data ----------------
const store = {
  id: "store-1",
  name: "Downtown Branch",
  description: "A sample store description",
  addressName: "Jl. Sudirman No. 123, Jakarta Pusat",
  latitude: -6.2,
  longitude: 106.8,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-05T00:00:00.000Z"),
};

const storeAdmins = [
  { id: "u1", email: "admin1@example.com" },
  { id: "u2", email: "admin2@example.com" },
];

const users = [
  { id: "u1", email: "admin1@example.com", role: "ADMIN" },
  { id: "u2", email: "admin2@example.com", role: "ADMIN" },
  { id: "u3", email: "user@example.com", role: "USER" },
  { id: "u4", email: "superadmin@example.com", role: "SUPERADMIN" },
];

// ---------------- Component ----------------
export default function StoreDetail() {
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditDescOpen, setIsEditDescOpen] = useState(false);
  const [editName, setEditName] = useState(store.name);
  const [editDesc, setEditDesc] = useState(store.description);

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [addAdminStep, setAddAdminStep] = useState<"search" | "confirm">(
    "search"
  );
  const [emailSearch, setEmailSearch] = useState("");
  const [foundUser, setFoundUser] = useState<(typeof users)[0] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isRemoveAdminOpen, setIsRemoveAdminOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [isDeleteStoreOpen, setIsDeleteStoreOpen] = useState(false);

  const handleSaveName = () => {
    if (!editName.trim()) return toast.error("Store name required");
    toast.success("Store name updated");
    setIsEditNameOpen(false);
  };

  const handleSaveDesc = () => {
    toast.success("Description updated");
    setIsEditDescOpen(false);
  };

  const handleEmailSearch = () => {
    if (!emailSearch.trim()) return setSearchError("Enter email");

    const existingAdmin = storeAdmins.find(
      (a) => a.email.toLowerCase() === emailSearch.toLowerCase()
    );
    if (existingAdmin) return setSearchError("User already admin");

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === emailSearch.toLowerCase() &&
        u.role !== "SUPERADMIN"
    );
    if (!user) return setSearchError("User not found");

    setFoundUser(user);
    setSearchError("");
    setAddAdminStep("confirm");
  };

  const handleConfirmAddAdmin = () => {
    if (!foundUser) return;
    toast.success(`${foundUser.email} promoted to admin`);
    setIsAddAdminOpen(false);
    setFoundUser(null);
    setEmailSearch("");
    setAddAdminStep("search");
  };

  const handleRemoveAdmin = () => {
    const admin = storeAdmins.find((a) => a.id === adminToRemove);
    toast.success(`${admin?.email} removed from admin`);
    setIsRemoveAdminOpen(false);
    setAdminToRemove(null);
  };

  const handleDeleteStore = () => {
    toast.success("Store deleted");
    setIsDeleteStoreOpen(false);
  };

  const openRemoveDialog = (id: string) => {
    setAdminToRemove(id);
    setIsRemoveAdminOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title={store.name}
          description="Store details and admin management"
          isBackButtonEnabled={true}
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteStoreOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Store
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic details about this store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StoreInformationCardField
              title="Store Name"
              value={store.name}
              onEditClick={() => setIsEditNameOpen(true)}
            />
            <StoreInformationCardField
              title="Description"
              value={store.description}
              onEditClick={() => setIsEditDescOpen(true)}
            />
            <StoreInformationCardField
              title="Location"
              value={store.addressName}
              onEditClick={() => toast.info("ogto")}
            />
            <StoreInformationCardField
              title="Created"
              value={format(store.createdAt, "MMMM dd, yyyy")}
            />
          </CardContent>
        </Card>

        {/* Store Admins Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Store Admins</CardTitle>
                <CardDescription>
                  Users who can manage this store
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsAddAdminOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Admin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {storeAdmins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No admins assigned to this store</p>
                <Button variant="link" onClick={() => setIsAddAdminOpen(true)}>
                  Add the first admin
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storeAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.email}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveDialog(admin.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Dialogs (Edit, Add, Remove, Delete) */}
      {/* Edit Name */}
      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store Name</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Description */}
      <Dialog open={isEditDescOpen} onOpenChange={setIsEditDescOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <Input
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDescOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDesc}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          {addAdminStep === "search" ? (
            <>
              <Input
                placeholder="Enter user email"
                value={emailSearch}
                onChange={(e) => {
                  setEmailSearch(e.target.value);
                  setSearchError("");
                }}
              />
              {searchError && (
                <p className="text-sm text-destructive">{searchError}</p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddAdminOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEmailSearch}>Search</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <p>{foundUser?.email} will be promoted to admin</p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddAdminStep("search")}
                >
                  Back
                </Button>
                <Button onClick={handleConfirmAddAdmin}>Confirm</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Admin */}
      <AlertDialog open={isRemoveAdminOpen} onOpenChange={setIsRemoveAdminOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this admin from {store.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRemoveAdminOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAdmin}>
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Store */}
      <AlertDialog open={isDeleteStoreOpen} onOpenChange={setIsDeleteStoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteStoreOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStore}>
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
