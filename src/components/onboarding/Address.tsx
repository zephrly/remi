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
import { toast } from "../ui/use-toast";

export default function Address() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    city: "",
    state: "",
    zipCode: "",
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
        .select("address")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data?.address) {
        setAddress(
          typeof data.address === "object"
            ? (data.address as any)
            : { city: "", state: "", zipCode: "", country: "" },
        );
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
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ address })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Address saved",
        description: "Your address information has been updated.",
      });

      // Navigate to the next step
      navigate("/onboarding/social");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving address",
        description: error.message || "Something went wrong.",
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
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Enter your city"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            placeholder="Enter your state or province"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip/Postal Code</Label>
          <Input
            id="zipCode"
            placeholder="Enter your zip or postal code"
            value={address.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
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
          >
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
