import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface StoryboardOrganizerProps {
  storyboards: StoryboardPosition[];
  onOrganize: (storyboards: StoryboardPosition[]) => void;
}

const StoryboardOrganizer: React.FC<StoryboardOrganizerProps> = ({
  storyboards = [],
  onOrganize = () => {},
}) => {
  const [organizationType, setOrganizationType] = useState("grid");
  const [gridColumns, setGridColumns] = useState(3);
  const [gridSpacing, setGridSpacing] = useState(50);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Group storyboards by category
  const categories = [
    "All",
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

    onOrganize(updatedStoryboards);
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
      if (category !== "All") {
        categoryPositions[category] = { x: categoryX, y: startY, nextIndex: 0 };
        categoryX += 1500; // Space between categories
      }
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

    onOrganize(updatedStoryboards);
  };

  // Handle organization based on selected type
  const handleOrganize = () => {
    if (organizationType === "grid") {
      organizeInGrid();
    } else if (organizationType === "category") {
      organizeByCategory();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Storyboard Organizer</CardTitle>
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

          <Button onClick={handleOrganize} className="w-full">
            Organize Storyboards
          </Button>

          <div className="text-sm text-muted-foreground mt-2">
            <p>
              This will organize {storyboards.length} storyboards using the
              selected method.
            </p>
            <p>
              Note: This is a preview tool. In a real implementation, this would
              update the actual storyboard positions in the canvas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryboardOrganizer;
