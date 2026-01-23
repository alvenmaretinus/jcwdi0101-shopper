import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "1MB",
      maxFileCount: 1,
      minFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("file url", file.ufsUrl);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
