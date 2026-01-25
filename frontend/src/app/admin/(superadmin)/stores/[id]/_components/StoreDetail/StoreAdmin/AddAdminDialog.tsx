import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addEmployee } from "@/services/store/addEmployee";
import { getStoreById } from "@/services/store/getStoreById";
import { Store } from "@/types/Store";
import { User } from "@/types/User";
import { useEffect, useState } from "react";
import z from "zod";
import { getUserByEmail } from "@/services/user/getUserByEmail";

type Props = {
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  store: Store;
};

export const AddAdminDialog = ({
  isAdminOpen,
  setIsAdminOpen,
  store,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addAdminStep, setAddAdminStep] = useState<"search" | "confirm">(
    "search"
  );
  const [emailSearch, setEmailSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [foundUser, setFoundUser] = useState<
    (User & { storeName?: string }) | null
  >(null);

  const handleEmailSearch = async () => {
    const parseResult = z.email().safeParse(emailSearch);
    if (!parseResult.success) return setSearchError("Invalid email");

    try {
      const user = await getUserByEmail(emailSearch);
      if (!user) return setSearchError("Email Not found");

      if (user.storeId) {
        const isJoinHere = user.storeId === store.id;
        if (isJoinHere) return setSearchError("User already join");
        const isJoinOther = await getStoreById({ id: user.storeId });
        if (isJoinOther) {
          setFoundUser({ ...user, storeName: isJoinOther.name });
        } else {
          setFoundUser(user);
        }
      } else {
        setFoundUser(user);
      }

      setAddAdminStep("confirm");
    } catch (error) {}
  };
  const handleConfirmAddAdmin = async () => {
    if (!foundUser) return;

    try {
      setIsSubmitting(true);
      const { id } = foundUser;
      await addEmployee({ id: store.id, userId: id });
      setIsAdminOpen(false);
      window.location.reload();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAdminOpen) {
      setEmailSearch("");
      setAddAdminStep("search");
    }
  }, [isAdminOpen]);

  return (
    <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {foundUser?.storeName ? "Migrate Admin" : "Add Admin"}
          </DialogTitle>
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
              <Button variant="outline" onClick={() => setIsAdminOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmailSearch}>Search</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <p>
              <span className="font-medium">{} </span>
              {foundUser?.storeName
                ? `(${foundUser?.email}) will be migrated from Store (${foundUser.storeName}) to ${store.name}`
                : `(${foundUser?.email}) will be promoted to admin, then assign to (${store.name})`}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddAdminStep("search")}
              >
                Back
              </Button>
              <Button disabled={isSubmitting} onClick={handleConfirmAddAdmin}>
                Confirm
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
