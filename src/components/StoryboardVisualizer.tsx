import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StoryboardVisualizer = () => {
  const [viewMode, setViewMode] = useState("map");
  const [zoomLevel, setZoomLevel] = useState(0.1);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  // Actual storyboard data from the canvas
  const storyboards = [
    {
      id: "1",
      name: "Home",
      x: -906,
      y: -1416,
      width: 1512,
      height: 982,
      type: "APPLICATION",
    },
    {
      id: "2",
      name: "FriendCard",
      x: -1700,
      y: -184,
      width: 400,
      height: 550,
      type: "COMPONENT",
    },
    {
      id: "3",
      name: "DiscoveryFeed",
      x: -1202,
      y: -170,
      width: 1200,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "4",
      name: "MessagesPanel",
      x: 200,
      y: -184,
      width: 1200,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "5",
      name: "FriendCardStoryboard",
      x: 1476,
      y: -879,
      width: 400,
      height: 1254,
      type: "COMPONENT",
    },
    {
      id: "6",
      name: "UpdatedFriendCardStoryboard",
      x: 1480,
      y: 400,
      width: 400,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "7",
      name: "ImportContactsStoryboard",
      x: 1480,
      y: 1100,
      width: 800,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "8",
      name: "MessagingFlowStoryboard",
      x: 1964,
      y: -271,
      width: 800,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "9",
      name: "PotentialConnectionsStoryboard",
      x: 2829,
      y: -991,
      width: 450,
      height: 1293,
      type: "COMPONENT",
    },
    {
      id: "10",
      name: "ExistingConnectionsStoryboard",
      x: 3375,
      y: -746,
      width: 450,
      height: 1118,
      type: "COMPONENT",
    },
    {
      id: "11",
      name: "MessageButtonTestStoryboard",
      x: 3900,
      y: -325,
      width: 450,
      height: 650,
      type: "COMPONENT",
    },
    {
      id: "12",
      name: "ConversationsListStoryboard",
      x: 2400,
      y: 400,
      width: 450,
      height: 650,
      type: "COMPONENT",
    },
    {
      id: "13",
      name: "ReminisceWithFriendStoryboard",
      x: 4430,
      y: -325,
      width: 450,
      height: 650,
      type: "COMPONENT",
    },
    {
      id: "14",
      name: "ReminisceListStoryboard",
      x: 2900,
      y: 400,
      width: 450,
      height: 650,
      type: "COMPONENT",
    },
    {
      id: "15",
      name: "WelcomeScreenStoryboard",
      x: 5000,
      y: -359,
      width: 400,
      height: 700,
      type: "COMPONENT",
    },
    {
      id: "16",
      name: "CreateAccountStoryboard",
      x: 4960,
      y: 400,
      width: 500,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "17",
      name: "LoginScreenStoryboard",
      x: 5500,
      y: -350,
      width: 400,
      height: 700,
      type: "COMPONENT",
    },
    {
      id: "18",
      name: "AddressStepStoryboard",
      x: 3400,
      y: 400,
      width: 500,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "19",
      name: "DateOfBirthStoryboard",
      x: 2900,
      y: 1100,
      width: 500,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "20",
      name: "OnboardingFlowStoryboard",
      x: 3500,
      y: 1100,
      width: 390,
      height: 844,
      type: "COMPONENT",
    },
    {
      id: "21",
      name: "SocialConnectionsStoryboard",
      x: 4400,
      y: 1100,
      width: 500,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "22",
      name: "UserProfileStoryboard",
      x: 8459,
      y: -364,
      width: 800,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "23",
      name: "MemoryCardStoryboard",
      x: 5980,
      y: -300,
      width: 500,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "24",
      name: "MemoriesStoryboard",
      x: 9339,
      y: -400,
      width: 800,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "25",
      name: "NavigationHeaderStoryboard",
      x: 1000,
      y: 1800,
      width: 390,
      height: 600,
      type: "COMPONENT",
    },
    {
      id: "26",
      name: "AvatarUploadTestStoryboard",
      x: 9400,
      y: 500,
      width: 800,
      height: 800,
      type: "COMPONENT",
    },
    {
      id: "27",
      name: "UserRatingTestStoryboard",
      x: 3000,
      y: 2000,
      width: 450,
      height: 650,
      type: "COMPONENT",
    },
    {
      id: "28",
      name: "MatchFilteringTestStoryboard",
      x: 3000,
      y: 2700,
      width: 1200,
      height: 1610,
      type: "COMPONENT",
    },
    {
      id: "29",
      name: "EnhancedSupabaseClientStoryboard",
      x: 14049,
      y: -300,
      width: 600,
      height: 600,
      type: "COMPONENT",
    },
  ];

  // Get the bounds of all storyboards
  const bounds = storyboards.reduce(
    (acc, sb) => {
      return {
        minX: Math.min(acc.minX, sb.x),
        minY: Math.min(acc.minY, sb.y),
        maxX: Math.max(acc.maxX, sb.x + sb.width),
        maxY: Math.max(acc.maxY, sb.y + sb.height),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

  // Calculate canvas dimensions
  const canvasWidth = bounds.maxX - bounds.minX;
  const canvasHeight = bounds.maxY - bounds.minY;

  // Handle click on a storyboard
  const handleStoryboardClick = (storyboard: any) => {
    // Get coordinates text
    const coordText = `${storyboard.x},${storyboard.y}`;

    // Create a temporary input element for fallback copy method
    const copyFallback = () => {
      const el = document.createElement("textarea");
      el.value = coordText;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(el);
      return success;
    };

    // Try to use clipboard API with fallback
    let copySuccess = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(coordText)
          .then(() => {
            copySuccess = true;
          })
          .catch(() => {
            copySuccess = copyFallback();
          });
      } else {
        copySuccess = copyFallback();
      }
    } catch (err) {
      copySuccess = copyFallback();
    }

    // Show a temporary tooltip
    const tooltip = document.createElement("div");
    tooltip.textContent = copySuccess
      ? `Coordinates for "${storyboard.name}" copied!`
      : `Coordinates: ${coordText} (copy not available)`;
    tooltip.style.position = "fixed";
    tooltip.style.top = "20px";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    tooltip.style.backgroundColor = copySuccess ? "#10b981" : "#f59e0b";
    tooltip.style.color = "white";
    tooltip.style.padding = "8px 16px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = "9999";
    document.body.appendChild(tooltip);

    // Remove the tooltip after 3 seconds
    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 3000);
  };

  // Center the view on a specific area
  const centerView = (x: number, y: number) => {
    setCenterX(x);
    setCenterY(y);
  };

  // Predefined views
  const predefinedViews = [
    { name: "Overview", x: 0, y: 0 },
    { name: "Authentication", x: 5000, y: -350 },
    { name: "Discovery", x: -1200, y: -200 },
    { name: "Messaging", x: 2000, y: -200 },
    { name: "Onboarding", x: 3500, y: 1000 },
    { name: "Memories", x: 5000, y: 1800 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Storyboard Visualizer</h2>
        <p className="text-gray-600 mb-4">
          Visualize the layout of all storyboards in the canvas. Click on a
          storyboard to copy its coordinates.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full md:w-auto">
            <Label htmlFor="viewMode">View Mode</Label>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger id="viewMode" className="w-[180px]">
                <SelectValue placeholder="Select view mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="map">Map View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-auto">
            <Label htmlFor="zoomLevel">Zoom Level</Label>
            <div className="flex items-center gap-2">
              <Input
                id="zoomLevel"
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>

          <div className="flex-1">
            <Label>Quick Jump</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {predefinedViews.map((view) => (
                <Button
                  key={view.name}
                  variant="outline"
                  size="sm"
                  onClick={() => centerView(view.x, view.y)}
                >
                  {view.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div
          className="border rounded-md overflow-auto bg-gray-100"
          style={{ height: "500px" }}
        >
          <div
            className="relative"
            style={{
              width: `${canvasWidth * zoomLevel}px`,
              height: `${canvasHeight * zoomLevel}px`,
              transform: `translate(${-bounds.minX * zoomLevel + 50}px, ${-bounds.minY * zoomLevel + 50}px)`,
            }}
          >
            {storyboards.map((storyboard) => (
              <div
                key={storyboard.id}
                className="absolute border border-gray-400 bg-white hover:bg-blue-50 hover:border-blue-500 cursor-pointer transition-colors"
                style={{
                  left: `${storyboard.x * zoomLevel}px`,
                  top: `${storyboard.y * zoomLevel}px`,
                  width: `${storyboard.width * zoomLevel}px`,
                  height: `${storyboard.height * zoomLevel}px`,
                }}
                onClick={() => handleStoryboardClick(storyboard)}
                title={`${storyboard.name} (${storyboard.x}, ${storyboard.y})`}
              >
                {zoomLevel > 0.05 && (
                  <div className="p-1 text-xs truncate">{storyboard.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="border rounded-md overflow-auto"
          style={{ height: "500px" }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storyboards.map((storyboard) => (
                <tr key={storyboard.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{storyboard.name}</td>
                  <td className="p-2">
                    x: {storyboard.x}, y: {storyboard.y}
                  </td>
                  <td className="p-2">
                    {storyboard.width} × {storyboard.height}
                  </td>
                  <td className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStoryboardClick(storyboard)}
                    >
                      Get Coordinates
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StoryboardVisualizer;
