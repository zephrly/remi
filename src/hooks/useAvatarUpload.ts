import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "@/components/ui/use-toast";

export const useAvatarUpload = () => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const uploadAvatar = async (file: File) => {
    if (!file) return { publicUrl: null };

    setUploadingAvatar(true);
    try {
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

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Add upsert option to overwrite if file exists
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      return { publicUrl };
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
