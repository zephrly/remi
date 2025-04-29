import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";

// Import the implemented components
import DateOfBirth from "./onboarding/DateOfBirth";
import Address from "./onboarding/Address";
import SocialConnections from "./onboarding/SocialConnections";
import ReviewYourProfile from "./onboarding/ReviewYourProfile";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        // If not authenticated, redirect to login
        navigate("/login");
        return;
      }

      setCurrentUser(data.session.user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brandBg">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-brandBg p-6">
      <div className="flex justify-center mb-8 mt-6">
        <Logo className="h-12" />
      </div>

      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Complete Your Profile
        </h1>

        <Routes>
          <Route path="/" element={<Navigate to="/onboarding/dob" replace />} />
          <Route path="/dob" element={<DateOfBirth />} />
          <Route path="/address" element={<Address />} />
          <Route path="/social" element={<SocialConnections />} />
          <Route path="/review" element={<ReviewYourProfile />} />
        </Routes>
      </div>
    </div>
  );
}
