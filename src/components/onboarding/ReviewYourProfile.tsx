import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

export default function ReviewYourProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    dob?: string;
    address?: {
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    connected_accounts?: {
      facebook: boolean;
      instagram: boolean;
      linkedin: boolean;
    };
  }>({});

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("dob, address, connected_accounts")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        if (data) {
          setProfileData({
            dob: data.date_of_birth || undefined,
            address:
              typeof data.address === "object"
                ? (data.address as any)
                : undefined,
            connected_accounts:
              typeof data.connected_accounts === "object"
                ? (data.connected_accounts as any)
                : undefined,
          });
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      // Save all profile data to Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          dob: profileData.dob,
          address: profileData.address,
          connected_accounts: profileData.connected_accounts,
          onboarding_completed: true,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Profile completed",
        description: "Your profile has been successfully set up.",
      });

      // Navigate to the home page or dashboard after completing onboarding
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error completing profile",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Your Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Please review your profile information before finalizing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date of Birth Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Date of Birth</h3>
          <p>{formatDate(profileData.dob)}</p>
        </div>

        {/* Address Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Location</h3>
          {profileData.address ? (
            <div className="space-y-1">
              <p>{profileData.address.city}</p>
              <p>{profileData.address.state}</p>
              <p>{profileData.address.zipCode}</p>
              <p>{profileData.address.country}</p>
            </div>
          ) : (
            <p className="text-gray-500">No address provided</p>
          )}
        </div>

        {/* Social Connections Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Connected Social Accounts</h3>
          {profileData.connected_accounts ? (
            <div className="space-y-1">
              <p>
                Facebook:{" "}
                {profileData.connected_accounts.facebook
                  ? "Connected"
                  : "Not connected"}
              </p>
              <p>
                Instagram:{" "}
                {profileData.connected_accounts.instagram
                  ? "Connected"
                  : "Not connected"}
              </p>
              <p>
                LinkedIn:{" "}
                {profileData.connected_accounts.linkedin
                  ? "Connected"
                  : "Not connected"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No social accounts connected</p>
          )}
        </div>

        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/social")}
          >
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Finalizing..." : "Complete Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
