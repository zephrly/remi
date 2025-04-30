import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-brandBg p-6">
      <div className="flex-1"></div>

      <div className="flex flex-col items-center justify-center space-y-8 max-w-md text-center">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <Logo className="h-20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome
          </h1>
          <p className="text-xl text-gray-600">
            Reconnect with old friends and rekindle meaningful relationships
            from your past
          </p>
        </div>

        <div className="flex flex-col w-full space-y-4 mt-8">
          <Button
            size="lg"
            className="w-full bg-brandAccent hover:bg-opacity-90 text-white"
            onClick={() => navigate("/create-account")}
          >
            Create Account
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-brandAccent text-brandAccent hover:bg-brandBg hover:bg-opacity-50"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      </div>

      <div className="mt-auto pt-8 pb-4">
        <Link
          to="https://letsremi.com"
          className="text-brandAccent hover:underline text-sm"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
