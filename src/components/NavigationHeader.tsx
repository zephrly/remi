import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu, X } from "lucide-react";
import Logo from "./Logo";

interface NavigationHeaderProps {
  activeMainTab: string;
  activeDiscoverSubTab: string;
  activeConnectionsSubTab: string;
  setActiveMainTab: (tab: string) => void;
  setActiveDiscoverSubTab: (tab: string) => void;
  setActiveConnectionsSubTab: (tab: string) => void;
  connectionRequestsCount: number;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeMainTab,
  activeDiscoverSubTab,
  activeConnectionsSubTab,
  setActiveMainTab,
  setActiveDiscoverSubTab,
  setActiveConnectionsSubTab,
  connectionRequestsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (tab: string, subTab?: string) => {
    setActiveMainTab(tab);
    if (tab === "discover" && subTab) {
      setActiveDiscoverSubTab(subTab);
    } else if (tab === "connections" && subTab) {
      setActiveConnectionsSubTab(subTab);
    }
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Logo className="h-8 mr-8" />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => handleNavClick("discover", "discover")}
              className={`${activeMainTab === "discover" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick("connections", "connections")}
              className={`${activeMainTab === "connections" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
            >
              Connections
            </button>
            <button
              onClick={() => handleNavClick("connections", "messages")}
              className={`${activeMainTab === "connections" && activeConnectionsSubTab === "messages" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
            >
              Messages
            </button>
            <button
              onClick={() => handleNavClick("memories")}
              className={`${activeMainTab === "memories" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
            >
              Memories
            </button>
            <button
              onClick={() => handleNavClick("profile")}
              className={`${activeMainTab === "profile" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
            >
              Profile
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => handleNavClick("requests")}
          >
            <Bell size={20} />
            {connectionRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {connectionRequestsCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              alt="User"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute w-full z-20 shadow-lg">
          <nav className="flex flex-col p-4 space-y-4">
            <button
              onClick={() => handleNavClick("discover", "discover")}
              className={`text-left px-4 py-2 rounded-md ${activeMainTab === "discover" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Discover
            </button>
            <button
              onClick={() => handleNavClick("connections", "connections")}
              className={`text-left px-4 py-2 rounded-md ${activeMainTab === "connections" && activeConnectionsSubTab !== "messages" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Connections
            </button>
            <button
              onClick={() => handleNavClick("connections", "messages")}
              className={`text-left px-4 py-2 rounded-md ${activeMainTab === "connections" && activeConnectionsSubTab === "messages" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Messages
            </button>
            <button
              onClick={() => handleNavClick("memories")}
              className={`text-left px-4 py-2 rounded-md ${activeMainTab === "memories" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Memories
            </button>
            <button
              onClick={() => handleNavClick("profile")}
              className={`text-left px-4 py-2 rounded-md ${activeMainTab === "profile" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Profile
            </button>
            <button
              onClick={() => handleNavClick("requests")}
              className={`text-left px-4 py-2 rounded-md flex items-center justify-between ${activeMainTab === "requests" ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <span>Notifications</span>
              {connectionRequestsCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {connectionRequestsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavigationHeader;
