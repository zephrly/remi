import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "@/components/ui/use-toast";
import UserProfileForm from "./UserProfileForm";

interface UserProfileProps {
  onBack?: () => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    location?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: string;
    address?: {
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    connectedAccounts?: {
      facebook?: boolean;
      instagram?: boolean;
      linkedin?: boolean;
      google?: boolean;
      twitter?: boolean;
      phone?: boolean;
    };
  };
}

const UserProfile = ({
  onBack,
  currentUser = {
    id: "current-user",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    bio: "Passionate about reconnecting with old friends and making new memories.",
    location: "San Francisco, CA",
  },
}: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(currentUser);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile data.",
          });
        } else if (data) {
          // Transform the data to match our component's expected format
          setProfile({
            id: data.id,
            name: data.full_name || data.name || "",
            firstName: data.first_name || "",
            middleName: data.middle_name || "",
            lastName: data.last_name || "",
            username: data.username || "",
            email: data.email || session.user.email || "",
            avatar:
              data.avatar_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.id,
            bio: data.bio || "",
            location: data.location || "",
            dateOfBirth: data.date_of_birth || "",
            address: data.address || {},
            connectedAccounts:
              typeof data.connected_accounts === "object"
                ? (data.connected_accounts as any)
                : {},
          });
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleSocialToggle = (platform: string) => {
    setProfile((prev) => ({
      ...prev,
      connectedAccounts: {
        ...prev.connectedAccounts,
        [platform]: !prev.connectedAccounts?.[platform],
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to save profile changes.",
        });
        return;
      }

      // Prepare the data for update
      const updateData = {
        first_name: profile.firstName,
        middle_name: profile.middleName,
        last_name: profile.lastName,
        username: profile.username,
        full_name:
          `${profile.firstName || ""} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName || ""}`.trim(),
        bio: profile.bio,
        location: profile.location,
        date_of_birth: profile.dateOfBirth,
        address: profile.address,
        connected_accounts: profile.connectedAccounts,
        avatar_url: profile.avatar,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save profile changes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;

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
        return;
      }

      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      setProfile((prev) => ({
        ...prev,
        avatar: publicUrl,
      }));

      // Save the avatar URL to the user's profile in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload profile picture.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="mr-2"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center gap-1"
            disabled={loading || uploadingAvatar}
          >
            {isEditing ? (
              <>
                {loading ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Save size={16} className="mr-1" />
                )}
                {loading ? "Saving..." : "Save"}
              </>
            ) : (
              "Edit Profile"
            )}
          </Button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {loading && !isEditing ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : (
          <>
            {/* Display name and location at the top */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.location}</p>
            </div>

            {/* User Profile Form */}
            <UserProfileForm
              profile={profile}
              isEditing={isEditing}
              handleChange={handleChange}
              handleAddressChange={handleAddressChange}
              handleSocialToggle={handleSocialToggle}
              handleAvatarChange={handleAvatarChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
