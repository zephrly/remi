import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StoryboardMap = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [jumpCoordinates, setJumpCoordinates] = useState({ x: 0, y: 0 });
  const [jumpMessage, setJumpMessage] = useState("");

  // Categories for organizing storyboards
  const categories = [
    { id: "all", name: "All Storyboards" },
    { id: "auth", name: "Authentication" },
    { id: "onboarding", name: "Onboarding" },
    { id: "discovery", name: "Discovery" },
    { id: "messaging", name: "Messaging" },
    { id: "memories", name: "Memories" },
    { id: "ui", name: "UI Elements" },
  ];

  // Actual storyboard data from the canvas
  const storyboards = [
    { id: "1", name: "Home", x: -906, y: -1416, category: "all" },
    { id: "2", name: "FriendCard", x: -1700, y: -184, category: "discovery" },
    {
      id: "3",
      name: "DiscoveryFeed",
      x: -1202,
      y: -170,
      category: "discovery",
    },
    { id: "4", name: "MessagesPanel", x: 200, y: -184, category: "messaging" },
    {
      id: "5",
      name: "FriendCardStoryboard",
      x: 1476,
      y: -879,
      category: "discovery",
    },
    {
      id: "6",
      name: "UpdatedFriendCardStoryboard",
      x: 1480,
      y: 400,
      category: "discovery",
    },
    {
      id: "7",
      name: "ImportContactsStoryboard",
      x: 1480,
      y: 1100,
      category: "onboarding",
    },
    {
      id: "8",
      name: "MessagingFlowStoryboard",
      x: 1964,
      y: -271,
      category: "messaging",
    },
    {
      id: "9",
      name: "PotentialConnectionsStoryboard",
      x: 2829,
      y: -991,
      category: "discovery",
    },
    {
      id: "10",
      name: "ExistingConnectionsStoryboard",
      x: 3375,
      y: -746,
      category: "discovery",
    },
    {
      id: "11",
      name: "MessageButtonTestStoryboard",
      x: 3900,
      y: -325,
      category: "messaging",
    },
    {
      id: "12",
      name: "ConversationsListStoryboard",
      x: 2400,
      y: 400,
      category: "messaging",
    },
    {
      id: "13",
      name: "ReminisceWithFriendStoryboard",
      x: 4430,
      y: -325,
      category: "memories",
    },
    {
      id: "14",
      name: "ReminisceListStoryboard",
      x: 2900,
      y: 400,
      category: "memories",
    },
    {
      id: "15",
      name: "WelcomeScreenStoryboard",
      x: 5000,
      y: -359,
      category: "auth",
    },
    {
      id: "16",
      name: "CreateAccountStoryboard",
      x: 4960,
      y: 400,
      category: "auth",
    },
    {
      id: "17",
      name: "LoginScreenStoryboard",
      x: 5500,
      y: -350,
      category: "auth",
    },
    {
      id: "18",
      name: "AddressStepStoryboard",
      x: 3400,
      y: 400,
      category: "onboarding",
    },
    {
      id: "19",
      name: "DateOfBirthStoryboard",
      x: 2900,
      y: 1100,
      category: "onboarding",
    },
    {
      id: "20",
      name: "OnboardingFlowStoryboard",
      x: 3500,
      y: 1100,
      category: "onboarding",
    },
    {
      id: "21",
      name: "SocialConnectionsStoryboard",
      x: 4400,
      y: 1100,
      category: "onboarding",
    },
    {
      id: "22",
      name: "UserProfileStoryboard",
      x: 8459,
      y: -364,
      category: "auth",
    },
    {
      id: "23",
      name: "MemoryCardStoryboard",
      x: 5980,
      y: -300,
      category: "memories",
    },
    {
      id: "24",
      name: "MemoriesStoryboard",
      x: 9339,
      y: -400,
      category: "memories",
    },
    {
      id: "25",
      name: "NavigationHeaderStoryboard",
      x: 1000,
      y: 1800,
      category: "ui",
    },
    {
      id: "26",
      name: "AvatarUploadTestStoryboard",
      x: 9400,
      y: 500,
      category: "ui",
    },
    {
      id: "27",
      name: "UserRatingTestStoryboard",
      x: 3000,
      y: 2000,
      category: "discovery",
    },
    {
      id: "28",
      name: "MatchFilteringTestStoryboard",
      x: 3000,
      y: 2700,
      category: "discovery",
    },
    {
      id: "29",
      name: "EnhancedSupabaseClientStoryboard",
      x: 14049,
      y: -300,
      category: "ui",
    },
  ];

  // Filter storyboards based on search term and active tab
  const filteredStoryboards = storyboards.filter((sb) => {
    const matchesSearch = sb.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || sb.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Jump to storyboard coordinates
  const jumpToStoryboard = (x: number, y: number, name: string) => {
    // Copy coordinates to clipboard
    const coordText = `${x},${y}`;
    navigator.clipboard.writeText(coordText);

    // Set jump coordinates for display
    setJumpCoordinates({ x, y });
    setJumpMessage(
      `Coordinates for "${name}" (${x}, ${y}) copied to clipboard! Paste these into the canvas search/jump box.`,
    );

    // Clear message after 5 seconds
    setTimeout(() => setJumpMessage(""), 5000);
  };

  // Jump to manually entered coordinates
  const handleManualJump = () => {
    navigator.clipboard.writeText(`${jumpCoordinates.x},${jumpCoordinates.y}`);
    setJumpMessage(
      `Coordinates (${jumpCoordinates.x}, ${jumpCoordinates.y}) copied to clipboard! Paste these into the canvas search/jump box.`,
    );
    setTimeout(() => setJumpMessage(""), 5000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Storyboard Navigator</h2>
        <p className="text-gray-600 mb-4">
          Find and navigate to storyboards in the canvas. Click on a storyboard
          to copy its coordinates.
        </p>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search Storyboards</Label>
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="w-1/3">
            <Label>Manual Jump</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                placeholder="X"
                value={jumpCoordinates.x}
                onChange={(e) =>
                  setJumpCoordinates({
                    ...jumpCoordinates,
                    x: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24"
              />
              <Input
                type="number"
                placeholder="Y"
                value={jumpCoordinates.y}
                onChange={(e) =>
                  setJumpCoordinates({
                    ...jumpCoordinates,
                    y: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24"
              />
              <Button onClick={handleManualJump}>Copy</Button>
            </div>
          </div>
        </div>

        {jumpMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
            {jumpMessage}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStoryboards.length > 0 ? (
              filteredStoryboards.map((storyboard) => (
                <Button
                  key={storyboard.id}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() =>
                    jumpToStoryboard(
                      storyboard.x,
                      storyboard.y,
                      storyboard.name,
                    )
                  }
                >
                  <div>
                    <div className="font-medium">{storyboard.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Position: x={storyboard.x}, y={storyboard.y}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center text-gray-500">
                No storyboards found matching your search.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoryboardMap;
