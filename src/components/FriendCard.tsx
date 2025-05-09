import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Hand } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { UserRating } from "@/types/database";

interface Friend {
  id: string;
  name: string;
  photo: string;
  memories: string[];
  mutualConnections: number;
  overlapPeriods: string[];
  overlapPlaces: string[];
  prompts?: { question: string; answer: string }[];
  interestLevel?: number;
  theirInterestLevel?: number;
  matchScore?: number;
  isMatch?: boolean;
}

interface FriendCardProps {
  friend: Friend;
  onSendRequest?: () => void;
  onSkip?: () => void;
  onInterestLevelChange?: (level: number) => void;
  connected?: boolean;
  onMessage?: (friendId: string) => void;
  onReminisce?: () => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onSendRequest = () => {},
  onSkip = () => {},
  onInterestLevelChange = () => {},
  connected = false,
  onMessage = () => {},
  onReminisce = () => {},
}) => {
  const [currentInterestLevel, setCurrentInterestLevel] = useState<number>(
    friend.interestLevel !== undefined ? friend.interestLevel : 4,
  );

  // Memoize props to prevent unnecessary re-renders
  const memoizedProps = useMemo(
    () => ({
      onSendRequest,
      onSkip,
      onInterestLevelChange,
      connected,
      onMessage,
      onReminisce,
    }),
    [
      onSendRequest,
      onSkip,
      onInterestLevelChange,
      connected,
      onMessage,
      onReminisce,
    ],
  );

  // Helper function to update local storage
  const updateLocalStorage = useCallback((friendId: string, level: number) => {
    try {
      const storedData = localStorage.getItem("friendInterestLevels");
      let updatedLevels = [];

      if (storedData) {
        updatedLevels = JSON.parse(storedData);
        const existingIndex = updatedLevels.findIndex(
          (item: any) => item.id === friendId,
        );

        if (existingIndex >= 0) {
          updatedLevels[existingIndex].interestLevel = level;
        } else {
          updatedLevels.push({ id: friendId, interestLevel: level });
        }
      } else {
        updatedLevels = [{ id: friendId, interestLevel: level }];
      }

      localStorage.setItem(
        "friendInterestLevels",
        JSON.stringify(updatedLevels),
      );
    } catch (e) {
      console.error("Error updating local storage:", e);
    }
  }, []);

  // Save rating to Supabase with optimistic updates
  const saveRatingToSupabase = useCallback(
    async (level: number) => {
      try {
        // Update local state and storage immediately for optimistic UI update
        setCurrentInterestLevel(level);
        updateLocalStorage(friend.id, level);

        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          console.error("User not authenticated:", userError);
          return;
        }

        const userId = userData.user.id;
        const timestamp = new Date().toISOString();

        // Check if a rating already exists
        const { data: existingRating, error: fetchError } =
          await supabase.userRatings
            .select()
            .eq("user_id", userId)
            .eq("rated_user_id", friend.id)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 is the error code for no rows returned
          console.error("Error checking existing rating:", fetchError);
          return;
        }

        let result;

        if (existingRating) {
          // Update existing rating
          result = await supabase.userRatings
            .update({
              interest_level: level,
              updated_at: timestamp,
            })
            .eq("id", existingRating.id);
        } else {
          // Insert new rating
          result = await supabase.userRatings.insert({
            user_id: userId,
            rated_user_id: friend.id,
            interest_level: level,
            created_at: timestamp,
          });
        }

        if (result.error) {
          console.error(
            `Error ${existingRating ? "updating" : "inserting"} rating:`,
            result.error,
          );
        } else {
          console.log(
            `Rating ${existingRating ? "updated" : "inserted"} successfully`,
          );
        }
      } catch (error) {
        console.error("Error saving rating to Supabase:", error);
      }
    },
    [friend.id, updateLocalStorage],
  );

  // Handle interest level change with debounce
  const handleInterestLevelChange = useCallback(
    (level: number) => {
      setCurrentInterestLevel(level);
      memoizedProps.onInterestLevelChange(level);
      saveRatingToSupabase(level);
    },
    [memoizedProps.onInterestLevelChange, saveRatingToSupabase],
  );

  // Memoized handlers for buttons
  const handleReminisceClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Reminisce button clicked for:", friend.name);
      memoizedProps.onReminisce();
    },
    [friend.name, memoizedProps.onReminisce],
  );

  const handleMessageClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Message button clicked for:", friend.name);
      memoizedProps.onMessage(friend.id);
    },
    [friend.id, friend.name, memoizedProps.onMessage],
  );

  return (
    <Card className="w-full bg-white overflow-auto flex flex-col">
      <div className="relative h-64 bg-gray-100">
        {friend.isMatch && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-blue-500 hover:bg-blue-600">Match</Badge>
          </div>
        )}
        <img
          src={friend.photo}
          alt={friend.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardContent className="flex-1 p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-semibold">{friend.name}</h3>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <span>{friend.mutualConnections} mutual connections</span>
          </div>
        </div>

        {friend.prompts && friend.prompts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Memory Prompt</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-sm">
                {friend.prompts[0].question}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {friend.prompts[0].answer}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Shared Memories</h4>
          <div className="flex flex-wrap gap-2">
            {friend.memories.map((memory, index) => (
              <Badge key={index} variant="secondary">
                {memory}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">First Met</h4>
          <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="" disabled selected>
              Where did you first meet?
            </option>
            <option value="high-school">High School</option>
            <option value="college">College</option>
            <option value="work">Work/Job</option>
            <option value="neighborhood">Grew up nearby</option>
            <option value="mutual-friend">Through mutual friend</option>
            <option value="dating">Dating</option>
            <option value="event">Event/Conference</option>
            <option value="online">Online</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Last Contact</h4>
          <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="" disabled selected>
              How long since you last spoke?
            </option>
            <option value="less-than-year">Less than a year</option>
            <option value="1-3-years">1-3 years</option>
            <option value="3-6-years">3-6 years</option>
            <option value="7-10-years">7-10 years</option>
            <option value="10-20-years">10-20 years</option>
            <option value="over-20-years">Over 20 years</option>
          </select>
        </div>

        <div className="mt-auto">
          <div className="mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="text-sm font-medium mb-2 cursor-help">
                    How interested are you in reconnecting? (1-7)
                  </h4>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>1 = Not interested at all, 7 = Thrilled to reconnect</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center mb-2">
              <Slider
                defaultValue={[
                  friend.interestLevel !== undefined ? friend.interestLevel : 4,
                ]}
                min={1}
                max={7}
                step={1}
                onValueChange={(value) => handleInterestLevelChange(value[0])}
                className="flex-1 mr-3"
              />
              <div className="flex">
                {[...Array(7)].map((_, i) => (
                  <Hand
                    key={i}
                    size={16}
                    className={`${i < currentInterestLevel ? "fill-blue-500 text-blue-500" : "text-gray-300"} ${i === 0 ? "ml-0" : "ml-0.5"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not interested</span>
              <span>Very interested</span>
            </div>
          </div>

          {friend.isMatch && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  Mutual Match!
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!currentInterestLevel && (
              <p className="text-red-500 text-sm mb-1">
                Please set your interest level before continuing
              </p>
            )}
            {connected ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReminisceClick}
                >
                  Reminisce
                </Button>
                <Button className="flex-1" onClick={handleMessageClick}>
                  Message
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={memoizedProps.onSendRequest}
                disabled={!currentInterestLevel}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(FriendCard);
