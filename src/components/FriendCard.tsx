import React, { useState } from "react";
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
    friend.interestLevel || 4,
  );
  return (
    <Card className="w-full bg-white overflow-auto flex flex-col">
      <div className="relative h-64 bg-gray-100">
        <img
          src={friend.photo}
          alt={friend.name}
          className="w-full h-full object-cover"
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
            <h4 className="text-sm font-medium mb-2">
              How interested are you in reconnecting? (1-7)
            </h4>
            <div className="flex items-center mb-2">
              <Slider
                defaultValue={[friend.interestLevel || 4]}
                min={1}
                max={7}
                step={1}
                onValueChange={(value) => {
                  const level = value[0];
                  setCurrentInterestLevel(level);
                  onInterestLevelChange(level);
                }}
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

          {friend.matchScore !== undefined && (
            <div className="mb-4 p-3 bg-green-50 rounded-md">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Match Score:</span>
                      <span className="text-sm font-bold text-green-600">
                        {friend.matchScore}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Based on mutual interest levels</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="flex gap-2">
            {connected ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Reminisce button clicked for:", friend.name);
                    onReminisce();
                  }}
                >
                  Reminisce
                </Button>
                <Button
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Message button clicked for:", friend.name);
                    onMessage(friend.id);
                  }}
                >
                  Message
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={onSkip}>
                  Skip
                </Button>
                <Button className="flex-1" onClick={onSendRequest}>
                  Connect
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendCard;
