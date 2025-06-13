import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const useAvatarUpload = () => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const uploadAvatar = async (file: File) => {
    if (!file) return { publicUrl: null };

    setUploadingAvatar(true);
    try {
      // Validate file type and size
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        throw new Error(
          "Please upload a valid image file (JPEG, PNG, GIF, WEBP)",
        );
      }

      // 5MB max size
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to update your avatar.",
        });
        return { publicUrl: null };
      }

      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Store directly in bucket root for simplicity

      console.log(`Uploading file to ${filePath}`);

      console.log(
        `Uploading file to profile-images bucket at path: ${filePath}`,
      );

      // Upload the file to Supabase Storage with more detailed error handling
      console.log("Starting file upload to Supabase storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Add upsert option to overwrite if file exists
          contentType: file.type, // Explicitly set content type
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          details: uploadError,
          filePath: filePath,
          fileName: fileName,
          userId: session.user.id,
        });

        // Try to create a more helpful error message
        if (uploadError.message.includes("does not exist")) {
          throw new Error(
            "Storage bucket doesn't exist. Please contact support.",
          );
        } else if (
          uploadError.message.includes("permission") ||
          uploadError.message.includes("not authorized") ||
          uploadError.message.includes("policy")
        ) {
          throw new Error(
            "Permission denied. Storage policies may need to be updated.",
          );
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log("Upload successful:", {
        data: uploadData,
        path: uploadData?.path,
        fullPath: uploadData?.fullPath,
      });

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      console.log("Public URL data:", urlData);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Add a cache-busting parameter to ensure the browser loads the new image
      const cacheBustUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      console.log("Final public URL with cache busting:", cacheBustUrl);

      // Test if the URL is accessible
      try {
        const testResponse = await fetch(cacheBustUrl, { method: "HEAD" });
        console.log("URL accessibility test:", {
          status: testResponse.status,
          ok: testResponse.ok,
          url: cacheBustUrl,
        });
      } catch (testError) {
        console.warn("Could not test URL accessibility:", testError);
      }

      return { publicUrl: cacheBustUrl };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload profile picture.",
      });
      return { publicUrl: null };
    } finally {
      setUploadingAvatar(false);
    }
  };

  return { uploadAvatar, uploadingAvatar };
};
