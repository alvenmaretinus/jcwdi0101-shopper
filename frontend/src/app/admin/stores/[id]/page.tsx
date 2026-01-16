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
import { useParams } from "next/navigation";
import { useInitialFetch } from "../../../../hooks/useInitialFetch";
import { getStoreById } from "@/services/store/getStoreById";
import { Loading } from "@/components/Loading";
import { StoreInformation } from "./_components/StoreInformation";

// ---------------- Static Mock Data ----------------
const stores = [
  {
    id: "store-1",
    name: "Downtown Branch",
    description: "A sample store description for Downtown Branch",
    addressName: "Jl. Sudirman No. 123, Jakarta Pusat",
    phoneNumber: "08123456789",
    latitude: -6.2,
    longitude: 106.8,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-05T00:00:00.000Z"),
  },
  {
    id: "store-2",
    name: "Bandung Central",
    description: "Main branch in Bandung with full services",
    addressName: "Jl. Asia Afrika No. 45, Bandung",
    phoneNumber: "08123456789",
    latitude: -6.9147,
    longitude: 107.6098,
    createdAt: new Date("2024-02-01T00:00:00.000Z"),
    updatedAt: new Date("2024-02-03T00:00:00.000Z"),
  },
  {
    id: "store-3",
    name: "Surabaya East",
    description: "Surabaya branch focusing on wholesale",
    addressName: "Jl. Pemuda No. 78, Surabaya",
    phoneNumber: "08123456789",
    latitude: -7.2575,
    longitude: 112.7521,
    createdAt: new Date("2024-03-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-05T00:00:00.000Z"),
  },
];

const storeAdmins = [
  { id: "u1", email: "admin1@example.com", storeId: "store-1" },
  { id: "u2", email: "admin2@example.com", storeId: "store-1" },
  { id: "u3", email: "bandungadmin@example.com", storeId: "store-2" },
  { id: "u4", email: "surabayaadmin@example.com", storeId: "store-3" },
];

const users = [
  { id: "u1", email: "admin1@example.com", role: "ADMIN" },
  { id: "u2", email: "admin2@example.com", role: "ADMIN" },
  { id: "u3", email: "bandungadmin@example.com", role: "ADMIN" },
  { id: "u4", email: "surabayaadmin@example.com", role: "ADMIN" },
  { id: "u5", email: "user@example.com", role: "USER" },
  { id: "u6", email: "superadmin@example.com", role: "SUPERADMIN" },
];

export default function StoreDetail() {
  const params = useParams<{ id: string }>();
  const storeId = params.id;
  const {
    data: store,
    isLoading,
    setData: setStore,
  } = useInitialFetch(() => getStoreById(storeId));

  if (isLoading) return <Loading />;
  if (!store) return <p>Store not found</p>;

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
          // onClick={() => setIsDeleteStoreOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Store
        </Button>
      </div>

      {/* <div className="grid gap-6 lg:grid-cols-2"> */}
      {/* Store Info Card */}
      <StoreInformation store={store} setStore={setStore} />

      {/* Store Admins Card */}
      {/* <Card>
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
            {admins.length === 0 ? (
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
                  {admins.map((admin) => (
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
      </div> */}

      {/* Add Admin */}
      {/* <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
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

      <StoreInformationDialog />
      {/* Remove Admin */}
      {/* <AlertDialog open={isRemoveAdminOpen} onOpenChange={setIsRemoveAdminOpen}>
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
      {/* <AlertDialog open={isDeleteStoreOpen} onOpenChange={setIsDeleteStoreOpen}>
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
      </AlertDialog> */}
    </div>
  );
}
