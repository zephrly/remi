import React from "react";
import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

interface FacebookLoginProps {
  callback: (response: any) => void;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ callback }) => {
  const handleFacebookLogin = () => {
    // Mock successful response
    callback({
      accessToken: "mock_access_token",
      userID: "mock_user_id",
      name: "Mock User",
      email: "mock@example.com",
    });
  };

  return (
    <Button onClick={handleFacebookLogin}>
      <Facebook className="mr-2 h-4 w-4" />
      Connect Facebook
    </Button>
  );
};

export default FacebookLogin;
