import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";

export default function Address() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  // Fetch existing address data if available
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
        .select("city, state, zip_code, country")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setAddress({
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          country: data.country || "",
        });
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (field: string, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Authentication error. Please log in again.");
      }

      if (!session?.user) {
        console.error("No session found");
        navigate("/login");
        return;
      }

      console.log("Updating profile for user:", session.user.id);
      console.log("Address data:", address);

      const updateData = {
        city: address.city.trim() || null,
        state: address.state.trim() || null,
        zip_code: address.zip_code.trim() || null,
        country: address.country || null,
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id)
        .select();

      if (error) {
        console.error("Database error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Profile updated successfully:", data);

      toast({
        title: "Address saved",
        description: "Your address information has been updated.",
      });

      // Navigate to the next step
      navigate("/onboarding/social");
    } catch (error: any) {
      console.error("Address save error:", error);
      toast({
        variant: "destructive",
        title: "Error saving address",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // List of countries for the dropdown
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Where are you located?</h2>
        <p className="text-sm text-gray-500 mt-1">
          This helps us connect you with friends in your area.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Enter your city"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            placeholder="Enter your state or province"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">Zip/Postal Code *</Label>
          <Input
            id="zip_code"
            placeholder="Enter your zip or postal code"
            value={address.zip_code}
            onChange={(e) => handleChange("zip_code", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select
            value={address.country}
            onValueChange={(value) => handleChange("country", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/dob")}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={
              loading ||
              !address.city ||
              !address.state ||
              !address.zip_code ||
              !address.country
            }
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
