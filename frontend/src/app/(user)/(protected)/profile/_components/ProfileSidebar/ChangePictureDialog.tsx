"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { authClient } from "@/lib/authClient";
import { apiFetch } from "@/lib/apiFetch";

const imageSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        ),
      "Only JPG, JPEG, PNG, or GIF allowed"
    )
    .refine((file) => file.size <= 1 * 1024 * 1024, "Max size is 1MB"),
});

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadPicture: boolean;
  setIsUploadPicture: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ChangePictureDialog = ({
  isOpen,
  setIsOpen,
  isUploadPicture,
  setIsUploadPicture,
}: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen && !isUploadPicture) {
      setPreviewImageUrl(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    try {
      const { error } = imageSchema.safeParse({ image: file });
      if (error) {
        const firstError = error.issues[0].message;
        toast.error(firstError || "Invalid input");
        return;
      }
      setSelectedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    } catch (err: any) {
      console.log(err);
    }
  };

  const { data } = authClient.useSession();
  const { startUpload, isUploading } = useUploadThing("profilePicture", {
    onClientUploadComplete: async (res) => {
      const key = res[0]?.key;
      const url = res[0]?.ufsUrl;
      if (!key || !url) return;
      try {
        // TODO: also put file key so later we can delete it if user changes picture
        await apiFetch(`/user/${data?.user.id}`, {
          method: "PATCH",
          body: { profileUrl: url },
        });
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.warn(error);
      } finally {
        setIsUploadPicture(false);
      }
    },
    onUploadError: () => {
      toast.error("Failed to change profile picture. Please try again.");
      setIsUploadPicture(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.user) {
      return toast.error("Failed to change profile picture. Please try again.");
    }
    if (!selectedFile) return toast.error("Please select an image");
    if (isUploading || isUploadPicture) {
      return toast.error("Upload in progress, please wait.");
    }
    setIsUploadPicture(true);
    await startUpload([selectedFile]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit image</DialogTitle>
            <DialogDescription>
              Choose an image file (JPG, JPEG, PNG, or GIF). Maximum size 1MB.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-2">
            <Label
              htmlFor="image"
              className="relative overflow-visible hover:cursor-pointer"
            >
              <Avatar className="relative h-40 w-40">
                {previewImageUrl ? (
                  <AvatarImage src={previewImageUrl} />
                ) : (
                  <Image src="/default_profile.png" fill alt="avatar" />
                )}
              </Avatar>
              <PencilIcon className="absolute top-3 right-3 z-50 h-7 w-7 rounded-full bg-black/60 p-1 text-slate-200" />
            </Label>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
            <Button disabled={!selectedFile || isUploading} type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
