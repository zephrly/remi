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
      const filePath = `avatars/${fileName}`;

      console.log(`Uploading file to ${filePath}`);

      // Skip bucket check as it might be failing due to permissions
      console.log("Attempting to upload to profile-images bucket");

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
        console.error("Upload error:", uploadError);
        // Try to create a more helpful error message
        if (uploadError.message.includes("does not exist")) {
          throw new Error(
            "Storage bucket doesn't exist. Please contact support.",
          );
        } else if (
          uploadError.message.includes("permission") ||
          uploadError.message.includes("not authorized")
        ) {
          throw new Error(
            "You don't have permission to upload files. Please contact support.",
          );
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log("Upload successful:", uploadData);

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Add a cache-busting parameter to ensure the browser loads the new image
      const cacheBustUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      console.log("Public URL generated:", cacheBustUrl);
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
