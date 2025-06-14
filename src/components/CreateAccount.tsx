import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";
import { inviteService } from "../services/inviteService";

export default function CreateAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Extract invite code from URL if present
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Extract invite code from URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("invite");
    if (code) {
      setInviteCode(code);
    }
  }, [location]);

  // Check username availability when it changes
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (username && username.length >= 3) {
        setIsCheckingUsername(true);
        setUsernameError(null);

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 means no rows returned, which is what we want
            console.error("Error checking username:", error);
            setUsernameError("Error checking username availability");
          } else if (data) {
            setUsernameError("Username already taken");
          }
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameError("Error checking username availability");
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (username && username.length < 3) {
        setUsernameError("Username must be at least 3 characters");
      } else {
        setUsernameError(null);
      }
    };

    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate username
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long");
      setLoading(false);
      return;
    }

    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Create user in Supabase Auth - the database trigger will automatically create user and profile records
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
          emailRedirectTo: undefined, // Disable email confirmation for now
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw signUpError;
      }

      if (data?.user) {
        console.log("User created in auth:", data.user.id);

        // The database trigger should have automatically created the user and profile records
        // Wait a brief moment to ensure the trigger has completed
        await new Promise((resolve) => setTimeout(resolve, 500));

        // If there's an invite code, process it to connect users
        if (inviteCode) {
          try {
            const success = await inviteService.processInviteLink(
              inviteCode,
              data.user.id,
            );
            if (success) {
              console.log(
                "Successfully processed invite link and created connection",
              );
            } else {
              console.warn(
                "Failed to process invite link, but account creation continues",
              );
            }
          } catch (connectionError) {
            console.error("Error processing invite link:", connectionError);
            // Continue with account creation even if connection fails
          }
        }

        // Redirect to onboarding flow after successful account creation
        navigate("/onboarding/dob");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during account creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-brandBg p-6">
      <div className="flex-1"></div>

      <div className="flex flex-col items-center justify-center space-y-8 max-w-md w-full text-center">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <Logo className="h-16" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join our community to reconnect with old friends
          </p>
        </div>

        <form onSubmit={handleCreateAccount} className="w-full space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2 text-left">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username (min. 3 characters)"
              required
              className={usernameError ? "border-red-500" : ""}
            />
            {isCheckingUsername && (
              <p className="text-xs text-gray-500">Checking username...</p>
            )}
            {usernameError && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
            {username &&
              username.length >= 3 &&
              !usernameError &&
              !isCheckingUsername && (
                <p className="text-xs text-green-500">Username available</p>
              )}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 8 characters)"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-brandAccent hover:bg-opacity-90 text-white"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Button
            variant="link"
            className="p-0 text-brandAccent"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>

      <div className="mt-auto pt-8 pb-4">
        <Button
          variant="ghost"
          className="text-gray-500 hover:text-gray-700 text-sm"
          onClick={() => navigate("/")}
        >
          Back to Welcome
        </Button>
      </div>
    </div>
  );
}
