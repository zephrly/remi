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
import { Toaster } from "../ui/toaster";

export default function Address() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [address, setAddress] = useState({
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize component and fetch existing data
  useEffect(() => {
    let isMounted = true;

    const initializeComponent = async () => {
      try {
        setInitializing(true);

        // Check authentication session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Please log in again.",
            });
            navigate("/login");
          }
          return;
        }

        if (!session?.user) {
          console.log("No active session found, redirecting to login");
          if (isMounted) {
            navigate("/login");
          }
          return;
        }

        if (isMounted) {
          setSessionChecked(true);
        }

        // Fetch existing profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("city, state, zip_code, country")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          if (isMounted) {
            toast({
              variant: "destructive",
              title: "Error Loading Profile",
              description: "Could not load existing address information.",
            });
          }
        } else if (profileData && isMounted) {
          setAddress({
            city: profileData.city || "",
            state: profileData.state || "",
            zip_code: profileData.zip_code || "",
            country: profileData.country || "",
          });
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Initialization Error",
            description: "Failed to initialize the address form.",
          });
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    initializeComponent();

    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  const handleChange = (field: string, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.state.trim()) {
      newErrors.state = "State/Province is required";
    }

    if (!address.zip_code.trim()) {
      newErrors.zip_code = "Zip/Postal Code is required";
    }

    if (!address.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Re-verify session before saving
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error during save:", sessionError);
        throw new Error("Authentication session expired. Please log in again.");
      }

      if (!session?.user?.id) {
        console.error("No valid session found during save");
        navigate("/login");
        return;
      }

      console.log("Saving address for user:", session.user.id);
      console.log("Address data:", address);

      // Prepare update data with proper null handling
      const updateData = {
        city: address.city.trim() || null,
        state: address.state.trim() || null,
        zip_code: address.zip_code.trim() || null,
        country: address.country.trim() || null,
        updated_at: new Date().toISOString(),
      };

      console.log("Update data:", updateData);

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing profile:", checkError);
        throw new Error(`Failed to verify profile: ${checkError.message}`);
      }

      let result;

      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", session.user.id)
          .select("city, state, zip_code, country")
          .single();
      } else {
        // Create new profile if it doesn't exist
        result = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            email: session.user.email,
            ...updateData,
            created_at: new Date().toISOString(),
          })
          .select("city, state, zip_code, country")
          .single();
      }

      const { data: savedData, error: saveError } = result;

      if (saveError) {
        console.error("Database save error:", saveError);
        console.error("Error details:", {
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
          code: saveError.code,
        });

        // Provide more specific error messages
        let errorMessage = "Failed to save address information.";
        if (saveError.code === "23505") {
          errorMessage =
            "Profile already exists. Please try refreshing the page.";
        } else if (saveError.code === "42501") {
          errorMessage = "Permission denied. Please log in again.";
        } else if (saveError.message) {
          errorMessage = saveError.message;
        }

        throw new Error(errorMessage);
      }

      console.log("Address saved successfully:", savedData);

      // Show success message
      toast({
        title: "Address Saved",
        description: "Your location information has been saved successfully.",
      });

      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate("/onboarding/social");
      }, 500);
    } catch (error: any) {
      console.error("Address save error:", error);

      let errorMessage = "Something went wrong while saving your address.";

      if (
        error.message?.includes("Authentication") ||
        error.message?.includes("session")
      ) {
        errorMessage = "Your session has expired. Please log in again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error Saving Address",
        description: errorMessage,
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

  // Show loading state during initialization
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500">Loading address form...</p>
        </div>
      </div>
    );
  }

  // Don't render form until session is verified
  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Where are you located?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This helps us connect you with friends in your area.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City *
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Enter your city"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={loading}
            className={errors.city ? "border-red-500 focus:border-red-500" : ""}
            autoComplete="address-level2"
          />
          {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
            State/Province *
          </Label>
          <Input
            id="state"
            type="text"
            placeholder="Enter your state or province"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={loading}
            className={
              errors.state ? "border-red-500 focus:border-red-500" : ""
            }
            autoComplete="address-level1"
          />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="zip_code"
            className="text-sm font-medium text-gray-700"
          >
            Zip/Postal Code *
          </Label>
          <Input
            id="zip_code"
            type="text"
            placeholder="Enter your zip or postal code"
            value={address.zip_code}
            onChange={(e) => handleChange("zip_code", e.target.value)}
            disabled={loading}
            className={
              errors.zip_code ? "border-red-500 focus:border-red-500" : ""
            }
            autoComplete="postal-code"
          />
          {errors.zip_code && (
            <p className="text-sm text-red-600">{errors.zip_code}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-gray-700"
          >
            Country *
          </Label>
          <Select
            value={address.country}
            onValueChange={(value) => handleChange("country", value)}
            disabled={loading}
          >
            <SelectTrigger
              className={
                errors.country ? "border-red-500 focus:border-red-500" : ""
              }
            >
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
          {errors.country && (
            <p className="text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        <div className="pt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/dob")}
            disabled={loading}
            className="px-6"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading || !sessionChecked}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>

      <Toaster />
    </div>
  );
}
