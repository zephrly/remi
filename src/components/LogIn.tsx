import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

export default function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        navigate("/home");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login");
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
            Log In
          </h1>
          <p className="text-gray-600">
            Welcome back! Enter your details to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or username"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-brandAccent hover:bg-opacity-90 text-white"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Button
            variant="link"
            className="p-0 text-brandAccent"
            onClick={() => navigate("/create-account")}
          >
            Create Account
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
