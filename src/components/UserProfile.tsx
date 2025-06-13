import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "@/components/ui/use-toast";
import UserProfileForm from "./UserProfileForm";
import { useAvatarUpload } from "../hooks/useAvatarUpload";

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
  const { uploadAvatar, uploadingAvatar } = useAvatarUpload();

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

        console.log("Fetching profile for user:", session.user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile data.",
          });
        } else if (data) {
          console.log("Profile data loaded:", data);
          // Parse the full name to extract first, middle, last names
          const nameParts = (data.full_name || "").split(" ");
          const firstName = nameParts[0] || "";
          const lastName =
            nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
          const middleName =
            nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

          // Transform the data to match our component's expected format
          setProfile({
            id: data.id,
            name: data.full_name || "",
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            username: data.username || "",
            email: data.email || session.user.email || "",
            avatar:
              data.avatar_url ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.id,
            bio: data.bio || "",
            location: "", // Not stored in profiles table
            dateOfBirth: data.date_of_birth || "",
            address: {
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zip_code || "",
              country: data.country || "",
            },
            connectedAccounts: {}, // Not stored in profiles table
          });

          // Try to get additional data from users table
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("location, connected_accounts")
              .eq("id", session.user.id)
              .single();

            if (userData) {
              setProfile((prev) => ({
                ...prev,
                location: userData.location || "",
                connectedAccounts:
                  typeof userData.connected_accounts === "object"
                    ? (userData.connected_accounts as any)
                    : {},
              }));
            }
          } catch (userError) {
            console.warn("Could not fetch additional user data:", userError);
          }
        } else {
          // No profile exists yet, create default profile with user data
          console.log("No profile found, creating default profile");
          setProfile({
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "",
            firstName: "",
            middleName: "",
            lastName: "",
            username: "",
            email: session.user.email || "",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
              session.user.id,
            bio: "",
            location: "",
            dateOfBirth: "",
            address: {},
            connectedAccounts: {},
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
    // Only proceed if we're in editing mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setLoading(true);
    try {
      console.log("Starting profile save...");
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

      // Prepare the data for update - all fields that exist in the profiles table
      const fullName =
        `${profile.firstName || ""} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName || ""}`.trim() ||
        profile.name;

      const updateData = {
        username: profile.username || null,
        full_name: fullName,
        bio: profile.bio || null,
        email: profile.email || session.user.email,
        avatar_url: profile.avatar,
        date_of_birth: profile.dateOfBirth || null,
        city: profile.address?.city || null,
        state: profile.address?.state || null,
        zip_code: profile.address?.zipCode || null,
        country: profile.address?.country || null,
        updated_at: new Date().toISOString(),
      };

      // Prepare additional data for users table (if it exists)
      const userUpdateData = {
        name: fullName,
        bio: profile.bio || null,
        avatar: profile.avatar,
        location: profile.location || null,
        connected_accounts: profile.connectedAccounts || null,
        updated_at: new Date().toISOString(),
      };

      console.log("Saving profile data:", updateData);

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      console.log("Profile check result:", existingProfile, checkError);

      let data, error;

      if (checkError && checkError.code === "PGRST116") {
        // Profile doesn't exist, insert it
        console.log("Profile doesn't exist, creating new profile");
        const result = await supabase
          .from("profiles")
          .insert({ ...updateData, id: session.user.id })
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Profile exists, update it
        console.log("Profile exists, updating");
        const result = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", session.user.id)
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);

      // Update the local profile state with the saved data to ensure UI reflects the changes
      if (data && data[0]) {
        const savedProfile = data[0];
        const nameParts = (savedProfile.full_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        const middleName =
          nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        setProfile((prev) => ({
          ...prev,
          name: savedProfile.full_name || "",
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          username: savedProfile.username || "",
          email: savedProfile.email || "",
          avatar: savedProfile.avatar_url || prev.avatar,
          bio: savedProfile.bio || "",
          dateOfBirth: savedProfile.date_of_birth || "",
          address: {
            city: savedProfile.city || "",
            state: savedProfile.state || "",
            zipCode: savedProfile.zip_code || "",
            country: savedProfile.country || "",
          },
        }));
      }

      // Also update the users table if it exists
      try {
        const { error: userUpdateError } = await supabase
          .from("users")
          .update(userUpdateData)
          .eq("id", session.user.id);

        if (userUpdateError) {
          console.warn("Could not update users table:", userUpdateError);
          // Don't throw here as the profiles table update was successful
        }
      } catch (userUpdateError) {
        console.warn("Error updating users table:", userUpdateError);
        // Continue as this is a secondary update
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
        duration: 3000,
      });

      setIsEditing(false);

      // If onBack function exists, call it after a short delay to allow the user to see the success message
      if (onBack) {
        setTimeout(() => {
          onBack();
        }, 1500);
      }
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

    try {
      console.log("Starting avatar upload for file:", file.name);
      setLoading(true); // Show loading state while uploading

      const { publicUrl } = await uploadAvatar(file);

      if (!publicUrl) {
        console.error("No public URL returned from upload");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get URL for uploaded image.",
        });
        return;
      }

      console.log("Upload successful, public URL:", publicUrl);

      // Update the profile with the new avatar URL
      setProfile((prev) => ({
        ...prev,
        avatar: publicUrl,
      }));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No session found when updating profile");
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to update your profile.",
        });
        return;
      }

      console.log("Updating profile with new avatar URL:", publicUrl);
      // Save the avatar URL to the user's profile in the database
      const { data: updatedProfile, error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)
        .select();

      if (updateProfileError) {
        console.error(
          "Error updating profile with new avatar:",
          updateProfileError,
        );
        throw updateProfileError;
      }

      console.log("Avatar updated in database:", updatedProfile);

      // Also update the users table if it exists
      try {
        const { error: updateUserError } = await supabase
          .from("users")
          .update({ avatar: publicUrl })
          .eq("id", session.user.id);

        if (updateUserError) {
          console.warn(
            "Could not update avatar in users table:",
            updateUserError,
          );
          // Don't throw here, as the profiles table update was successful
        }
      } catch (userUpdateError) {
        console.warn("Error updating users table:", userUpdateError);
        // Continue as this is a secondary update
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    } catch (error: any) {
      console.error("Error in handleAvatarChange:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload profile picture.",
      });
    } finally {
      setLoading(false); // Hide loading state when done
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
            onClick={() => {
              console.log("Save button clicked");
              handleSave();
            }}
            className="flex items-center gap-1"
            disabled={loading || uploadingAvatar}
            type="button"
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
              onSave={isEditing ? handleSave : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
