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

interface StoryboardPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  category?: string;
}

const StoryboardOrganizer2 = () => {
  const [organizationType, setOrganizationType] = useState("grid");
  const [gridColumns, setGridColumns] = useState(3);
  const [gridSpacing, setGridSpacing] = useState(50);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [result, setResult] = useState<{
    message: string;
    storyboards: StoryboardPosition[];
  } | null>(null);

  // Actual storyboard data from the canvas
  const [storyboards, setStoryboards] = useState<StoryboardPosition[]>([
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
  ]);

  // Categories for organizing storyboards
  const categories = [
    "Authentication",
    "Profile",
    "Discovery",
    "Messaging",
    "Memories",
    "UI Components",
  ];

  // Categorize storyboards based on name
  const categorizeStoryboard = (name: string): string => {
    name = name.toLowerCase();
    if (
      name.includes("login") ||
      name.includes("account") ||
      name.includes("welcome")
    ) {
      return "Authentication";
    } else if (name.includes("profile") || name.includes("user")) {
      return "Profile";
    } else if (
      name.includes("discover") ||
      name.includes("friend") ||
      name.includes("connection")
    ) {
      return "Discovery";
    } else if (
      name.includes("message") ||
      name.includes("chat") ||
      name.includes("conversation")
    ) {
      return "Messaging";
    } else if (name.includes("memory") || name.includes("reminisce")) {
      return "Memories";
    } else {
      return "UI Components";
    }
  };

  // Organize storyboards in a grid layout
  const organizeInGrid = () => {
    if (storyboards.length === 0) return;

    const updatedStoryboards = [...storyboards];
    const padding = gridSpacing;
    let currentX = startX;
    let currentY = startY;
    let columnCount = 0;
    let maxHeightInRow = 0;

    updatedStoryboards.forEach((storyboard) => {
      // Assign category if not already assigned
      if (!storyboard.category) {
        storyboard.category = categorizeStoryboard(storyboard.name);
      }

      // Update position
      storyboard.x = currentX;
      storyboard.y = currentY;

      // Move to next column
      columnCount++;
      currentX += storyboard.width + padding;
      maxHeightInRow = Math.max(maxHeightInRow, storyboard.height);

      // Move to next row if we've filled the columns
      if (columnCount >= gridColumns) {
        columnCount = 0;
        currentX = startX;
        currentY += maxHeightInRow + padding;
        maxHeightInRow = 0;
      }
    });

    setStoryboards(updatedStoryboards);
    setResult({
      message: `Organized ${updatedStoryboards.length} storyboards in a grid layout.`,
      storyboards: updatedStoryboards,
    });
  };

  // Organize storyboards by category
  const organizeByCategory = () => {
    if (storyboards.length === 0) return;

    const updatedStoryboards = [...storyboards];
    const categoryPositions: Record<
      string,
      { x: number; y: number; nextIndex: number }
    > = {};

    // Initialize category positions
    let categoryX = startX;
    categories.forEach((category) => {
      categoryPositions[category] = { x: categoryX, y: startY, nextIndex: 0 };
      categoryX += 1500; // Space between categories
    });

    // Assign categories and positions
    updatedStoryboards.forEach((storyboard) => {
      const category = categorizeStoryboard(storyboard.name);
      storyboard.category = category;

      const position = categoryPositions[category];
      if (position) {
        storyboard.x = position.x;
        storyboard.y =
          position.y + position.nextIndex * (storyboard.height + gridSpacing);
        position.nextIndex++;
      }
    });

    setStoryboards(updatedStoryboards);
    setResult({
      message: `Organized ${updatedStoryboards.length} storyboards by category.`,
      storyboards: updatedStoryboards,
    });
  };

  // Handle organization based on selected type
  const handleOrganize = () => {
    if (organizationType === "grid") {
      organizeInGrid();
    } else if (organizationType === "category") {
      organizeByCategory();
    }
  };

  // Copy coordinates to clipboard
  const copyCoordinates = (storyboard: StoryboardPosition) => {
    const coordText = `${storyboard.x},${storyboard.y}`;
    navigator.clipboard.writeText(coordText);

    // Show a temporary tooltip
    alert(
      `Coordinates for "${storyboard.name}" (${storyboard.x}, ${storyboard.y}) copied to clipboard!`,
    );
  };

  // Reset storyboards to original positions
  const resetStoryboards = () => {
    setStoryboards([
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
    ]);
    setResult(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Storyboard Organizer</h2>
        <p className="text-gray-600 mb-4">
          Organize storyboards in a grid or by category. After organizing, you
          can copy the new coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationType">Organization Type</Label>
                  <Select
                    value={organizationType}
                    onValueChange={setOrganizationType}
                  >
                    <SelectTrigger id="organizationType">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Layout</SelectItem>
                      <SelectItem value="category">By Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gridColumns">Grid Columns</Label>
                  <Input
                    id="gridColumns"
                    type="number"
                    value={gridColumns}
                    onChange={(e) => setGridColumns(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gridSpacing">Spacing (px)</Label>
                  <Input
                    id="gridSpacing"
                    type="number"
                    value={gridSpacing}
                    onChange={(e) => setGridSpacing(Number(e.target.value))}
                    min={0}
                    max={500}
                  />
                </div>

                <div>
                  <Label htmlFor="startX">Start X</Label>
                  <Input
                    id="startX"
                    type="number"
                    value={startX}
                    onChange={(e) => setStartX(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="startY">Start Y</Label>
                  <Input
                    id="startY"
                    type="number"
                    value={startY}
                    onChange={(e) => setStartY(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleOrganize} className="flex-1">
                  Organize Storyboards
                </Button>

                <Button onClick={resetStoryboards} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 bg-gray-50 h-[300px] overflow-auto">
              {result ? (
                <div>
                  <p className="mb-4 text-green-600">{result.message}</p>
                  <div className="space-y-2">
                    {result.storyboards.map((storyboard) => (
                      <div
                        key={storyboard.id}
                        className="p-2 border rounded-md bg-white hover:bg-blue-50 cursor-pointer"
                        onClick={() => copyCoordinates(storyboard)}
                      >
                        <div className="font-medium">{storyboard.name}</div>
                        <div className="text-xs text-gray-500">
                          Position: x={storyboard.x}, y={storyboard.y}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Click "Organize Storyboards" to see the preview
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryboardOrganizer2;
