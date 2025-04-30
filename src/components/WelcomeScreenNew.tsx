import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * WelcomeScreenNew component displays the initial welcome screen for the REMI app
 * with logo, tagline, and action buttons.
 */
const WelcomeScreenNew: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[390px] h-[844px] relative font-display bg-brandBg">
      {/* Logo */}
      <div className="absolute top-[76px] left-0 w-full flex justify-center">
        <img
          src="/remi-logo-direct.png"
          alt="REMI"
          className="h-[121px] w-auto"
        />
      </div>

      {/* Meerkat Image */}
      <div className="absolute top-[217px] left-0 w-full flex justify-center">
        <img
          src="/remi-logo-red.png"
          alt="Meerkat mascot"
          className="h-[188px] w-auto"
        />
      </div>

      {/* Tagline */}
      <div className="absolute top-[435px] left-0 w-full px-6 text-center">
        <p className="text-lg font-bold mb-1">Reconnect with old friends.</p>
        <p className="text-lg font-bold mb-1">Reminisce about fond memories.</p>
        <p className="text-lg font-bold">Rekindle your relationships.</p>
      </div>

      {/* Create Account Button */}
      <div className="absolute top-[574px] left-[24px] w-[343px]">
        <button
          className="w-full h-[55px] bg-brandAccent rounded-lg shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] text-white font-bold text-lg"
          onClick={() => navigate("/create-account")}
        >
          Create Account
        </button>
      </div>

      {/* Log In Button */}
      <div className="absolute top-[675px] left-[25px] w-[343px]">
        <button
          className="w-full h-[55px] bg-white rounded-lg shadow-[0px_1px_1px_0px_rgba(0,0,0,0.25)] border border-brandAccent text-brandAccent font-bold text-lg"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>
      </div>

      {/* Learn More Link */}
      <div className="absolute top-[771px] left-0 w-full text-center">
        <Link
          to="https://letsremi.com"
          className="text-brandAccent text-base font-normal hover:underline"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default WelcomeScreenNew;
