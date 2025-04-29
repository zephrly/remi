import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import FriendCard from "../components/FriendCard";

interface DiscoveryFeedProps {
  friends?: Friend[];
  onSendRequest?: (friendId: string) => void;
  onSkip?: (friendId: string) => void;
  onSubmitMemory?: (memory: string) => void;
  connections?: Friend[];
  onSelectFriend?: (friend: any) => void;
  onChangeTab?: (tab: string) => void;
  view?: string;
}

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

const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  friends = [
    {
      id: "1",
      name: "Sarah Johnson",
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      memories: ["High school graduation", "Summer camp 2010"],
      mutualConnections: 3,
      overlapPeriods: ["2008-2012"],
      overlapPlaces: ["Westlake High School", "Camp Wildwood"],
      prompts: [
        {
          question: "I remember when...",
          answer: "we stayed up all night for the senior lock-in!",
        },
        {
          question: "A place I miss...",
          answer: "the old coffee shop where we used to study",
        },
      ],
    },
    {
      id: "2",
      name: "Michael Chen",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      memories: ["College dorm roommates", "Intramural soccer team"],
      mutualConnections: 5,
      overlapPeriods: ["2012-2016"],
      overlapPlaces: ["State University", "Riverside Apartments"],
      prompts: [
        {
          question: "I remember when...",
          answer:
            "we pulled an all-nighter before finals and ordered pizza at 3am",
        },
        {
          question: "A place I miss...",
          answer: "our favorite spot in the university quad",
        },
      ],
    },
    {
      id: "3",
      name: "Jessica Williams",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      memories: ["Marketing internship", "Study abroad in Spain"],
      mutualConnections: 2,
      overlapPeriods: ["2014-2015"],
      overlapPlaces: ["Global Marketing Inc.", "Madrid University"],
      prompts: [
        {
          question: "I remember when...",
          answer:
            "we got lost in Madrid and ended up at that amazing tapas place",
        },
        {
          question: "A place I miss...",
          answer:
            "the rooftop bar where we celebrated finishing our internship",
        },
      ],
    },
  ],
  connections = [
    {
      id: "4",
      name: "Alex Rivera",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      memories: ["College study group", "Spring break road trip"],
      mutualConnections: 4,
      overlapPeriods: ["2014-2018"],
      overlapPlaces: ["State University", "Downtown Apartments"],
      prompts: [
        {
          question: "I remember when...",
          answer: "we got stuck in that snowstorm during our road trip",
        },
        {
          question: "A place I miss...",
          answer: "that 24-hour diner where we'd study until sunrise",
        },
      ],
    },
    {
      id: "5",
      name: "Emma Thompson",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      memories: ["Debate team", "Summer internship"],
      mutualConnections: 2,
      overlapPeriods: ["2016-2018"],
      overlapPlaces: ["State University", "Tech Innovations Inc."],
      prompts: [
        {
          question: "I remember when...",
          answer: "we won the regional debate championship",
        },
        {
          question: "A place I miss...",
          answer: "the campus coffee shop where we'd prep for debates",
        },
      ],
    },
  ],
  onSendRequest = () => {},
  onSkip = () => {},
  onSubmitMemory = () => {},
  onSelectFriend = () => {},
  onChangeTab = () => {},
  view = "discover",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentConnectionIndex, setCurrentConnectionIndex] = useState(0);
  const [memoryPrompt, setMemoryPrompt] = useState("");
  const [activeTab, setActiveTab] = useState(view);
  const [yearRange, setYearRange] = useState([2000, 2023]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleSetTab = (event: CustomEvent) => {
      console.log("Received setDiscoveryTab event with detail:", event.detail);
      setActiveTab(event.detail);
    };

    window.addEventListener("setDiscoveryTab", handleSetTab as EventListener);
    return () => {
      window.removeEventListener(
        "setDiscoveryTab",
        handleSetTab as EventListener,
      );
    };
  }, []);

  const matches = [
    {
      id: "1",
      name: "Sarah Johnson",
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      mutualConnections: 3,
      matchScore: 85,
    },
    {
      id: "2",
      name: "Michael Chen",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      mutualConnections: 5,
      matchScore: 92,
    },
  ];

  const handleNext = () => {
    if (currentIndex < friends.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSendRequest = () => {
    onSendRequest(friends[currentIndex].id);
    handleNext();
  };

  const handleSkip = () => {
    onSkip(friends[currentIndex].id);
    handleNext();
  };

  const handleSubmitMemory = () => {
    if (memoryPrompt.trim()) {
      onSubmitMemory(memoryPrompt);
      setMemoryPrompt("");
    }
  };

  const handleInterestLevelChange = (level: number) => {
    console.log(`Interest level for ${currentFriend.name}: ${level}`);

    const updatedFriends = friends.map((friend, idx) => {
      if (idx === currentIndex) {
        return { ...friend, interestLevel: level };
      }
      return friend;
    });

    if (!updatedFriends[currentIndex].theirInterestLevel) {
      updatedFriends[currentIndex].theirInterestLevel =
        Math.floor(Math.random() * 7) + 1;
    }

    localStorage.setItem(
      "friendInterestLevels",
      JSON.stringify(
        updatedFriends.map((f) => ({
          id: f.id,
          interestLevel: f.interestLevel,
        })),
      ),
    );
  };

  const currentFriend = friends[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="discover" className="w-full">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search by name, school, or workplace"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="relative w-full max-w-md">
              {friends.length > 0 ? (
                <FriendCard
                  friend={currentFriend}
                  onSendRequest={handleSendRequest}
                  onSkip={handleSkip}
                  onInterestLevelChange={handleInterestLevelChange}
                />
              ) : (
                <Card className="w-full h-[550px] flex items-center justify-center">
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      No potential connections found. Try adjusting your
                      filters.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {friends.length}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === friends.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="w-full max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Share a Memory</h3>
              <div className="space-y-4">
                <div>
                  <Select defaultValue="remember">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remember">
                        I remember when...
                      </SelectItem>
                      <SelectItem value="miss">A place I miss...</SelectItem>
                      <SelectItem value="laugh">
                        Something that made us laugh...
                      </SelectItem>
                      <SelectItem value="adventure">
                        An adventure we had...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Share your memory here..."
                  value={memoryPrompt}
                  onChange={(e) => setMemoryPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={handleSubmitMemory} className="w-full">
                  Share Memory
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="text-md font-medium mb-4">
                  Recent Memory Prompts
                </h4>
                <div className="space-y-4">
                  {friends
                    .flatMap((friend) => friend.prompts || [])
                    .slice(0, 3)
                    .map((prompt, index) => (
                      <Card key={index} className="p-4">
                        <p className="font-medium text-sm">{prompt.question}</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {prompt.answer}
                        </p>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="w-full">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search your connections"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="relative w-full max-w-md">
              {connections.length > 0 ? (
                <FriendCard
                  friend={connections[currentConnectionIndex]}
                  connected={true}
                  onMessage={(friendId) => {
                    const friend = connections[currentConnectionIndex];
                    console.log("Messaging friend:", friend);
                    console.log("Calling onSelectFriend with:", {
                      id: friend.id,
                      name: friend.name,
                      photo: friend.photo,
                    });
                    onSelectFriend({
                      id: friend.id,
                      name: friend.name,
                      photo: friend.photo,
                    });
                    console.log("Calling onChangeTab with: messages");
                    onChangeTab("messages");
                  }}
                  onReminisce={() => {
                    const friend = connections[currentConnectionIndex];
                    console.log(`Reminiscing with ${friend.name}`);
                    onSelectFriend({
                      id: friend.id,
                      name: friend.name,
                      photo: friend.photo,
                    });
                    onChangeTab("reminisce");
                  }}
                  onInterestLevelChange={() => {}}
                />
              ) : (
                <Card className="w-full h-[550px] flex items-center justify-center">
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      You haven't connected with anyone yet. Discover new
                      connections in the Discover tab.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentConnectionIndex > 0) {
                      setCurrentConnectionIndex(currentConnectionIndex - 1);
                    }
                  }}
                  disabled={currentConnectionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  {connections.length > 0
                    ? `${currentConnectionIndex + 1} of ${connections.length}`
                    : "0 of 0"}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (currentConnectionIndex < connections.length - 1) {
                      setCurrentConnectionIndex(currentConnectionIndex + 1);
                    }
                  }}
                  disabled={currentConnectionIndex === connections.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="w-full max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Users className="mr-2 h-5 w-5" /> Your Matches
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These people have expressed mutual interest in reconnecting
                    with you.
                  </p>
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                          <img
                            src={match.photo}
                            alt={match.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{match.name}</h4>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              {match.mutualConnections} mutual connections
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              {match.matchScore}% match
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "Message button clicked for:",
                              match.name,
                            );
                            onSelectFriend({
                              id: match.id,
                              name: match.name,
                              photo: match.photo,
                            });
                            onChangeTab("messages");
                          }}
                        >
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <Users className="h-6 w-6 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No matches yet</h4>
                    <p className="text-sm text-muted-foreground">
                      When you and someone else both express interest in
                      reconnecting, they'll appear here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiscoveryFeed;
