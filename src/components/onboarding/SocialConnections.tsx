import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { toast } from "../ui/use-toast";
import { Facebook, Instagram, Linkedin, Check } from "lucide-react";

export default function SocialConnections() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: false,
    instagram: false,
    linkedin: false,
  });

  // Fetch existing connected accounts data if available
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
        .select("connected_accounts")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data?.connected_accounts) {
        if (
          data?.connected_accounts &&
          typeof data.connected_accounts === "object"
        ) {
          setConnectedAccounts(data.connected_accounts as any);
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleToggle = (platform: keyof typeof connectedAccounts) => {
    // In a real app, this would trigger OAuth flow
    // For now, we'll just toggle the state
    setConnectedAccounts((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

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

      const { error } = await supabase
        .from("profiles")
        .update({ connected_accounts: connectedAccounts })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Social connections updated",
        description: "Your social connections have been saved.",
      });

      // Navigate to the review profile page after completing social connections
      navigate("/onboarding/review");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving connections",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({
    platform,
    icon,
    color,
    connected,
  }: {
    platform: keyof typeof connectedAccounts;
    icon: React.ReactNode;
    color: string;
    connected: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
        <div>
          <p className="font-medium">
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </p>
          <p className="text-sm text-gray-500">
            {connected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connected && <Check size={16} className="text-green-500" />}
        <Switch
          checked={connected}
          onCheckedChange={() => handleToggle(platform)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Connect Your Social Accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect your social media accounts to find friends already on REMi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <SocialButton
          platform="facebook"
          icon={<Facebook size={20} className="text-white" />}
          color="bg-blue-600"
          connected={connectedAccounts.facebook}
        />

        <SocialButton
          platform="instagram"
          icon={<Instagram size={20} className="text-white" />}
          color="bg-pink-600"
          connected={connectedAccounts.instagram}
        />

        <SocialButton
          platform="linkedin"
          icon={<Linkedin size={20} className="text-white" />}
          color="bg-blue-800"
          connected={connectedAccounts.linkedin}
        />

        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/address")}
          >
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
