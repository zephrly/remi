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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/lib/supabase";
import {
  loadUserRatingsFromSupabase,
  calculateMatchScore,
  isMatch,
  getUserMatchesFromSupabase,
} from "@/utils/matchingService";

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
  const [friendsWithRatings, setFriendsWithRatings] =
    useState<Friend[]>(friends);
  const [connectionsWithRatings, setConnectionsWithRatings] =
    useState<Friend[]>(connections);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>(friends);

  // Get current user and load ratings from Supabase
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Error fetching current user:", error);
        return;
      }
      setCurrentUserId(data.user.id);
    };

    fetchCurrentUser();
  }, []);

  // Filter friends based on match status and search query
  useEffect(() => {
    let filtered = [...friendsWithRatings];

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (friend) =>
          friend.name.toLowerCase().includes(query) ||
          friend.overlapPlaces?.some((place) =>
            place.toLowerCase().includes(query),
          ) ||
          friend.memories?.some((memory) =>
            memory.toLowerCase().includes(query),
          ),
      );
    }

    // Apply match filter if enabled
    if (showOnlyMatches) {
      filtered = filtered.filter((friend) => friend.isMatch === true);
    }

    setFilteredFriends(filtered);

    // Reset current index when filters change
    if (filtered.length > 0 && currentIndex >= filtered.length) {
      setCurrentIndex(0);
    }
  }, [friendsWithRatings, searchQuery, showOnlyMatches, currentIndex]);

  // Load ratings when user ID is available
  useEffect(() => {
    if (!currentUserId) return;

    const loadRatings = async () => {
      try {
        const userRatings = await loadUserRatingsFromSupabase(currentUserId);
        console.log("Loaded user ratings from Supabase:", userRatings);

        // Get users connected via invite links - simplified query
        console.log("Fetching connections for user:", currentUserId);
        const { data: connections, error: connectionsError } = await supabase
          .from("connections")
          .select("*")
          .eq("user_id", currentUserId)
          .eq("status", "connected");

        if (connectionsError) {
          console.error("Error fetching connections:", connectionsError);
        }

        console.log("Raw connections data:", connections);

        const connectedUserIds = new Set();
        connections?.forEach((conn) => {
          console.log("Processing connection:", conn);
          connectedUserIds.add(conn.friend_id);
          console.log("Added friend_id:", conn.friend_id);
        });

        console.log("Connected user IDs:", Array.from(connectedUserIds));

        // Get profile data for connected users
        const connectedFriends = [];
        for (const userId of connectedUserIds) {
          console.log("Fetching profile for user:", userId);
          const { data: userData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            console.error(
              "Error fetching profile for user",
              userId,
              ":",
              error,
            );
            continue;
          }

          if (userData) {
            console.log("Adding connected friend:", userData);
            connectedFriends.push({
              id: userData.id,
              name: userData.full_name || userData.username || "Unknown User",
              photo:
                userData.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
              memories: ["Connected via invite link"],
              mutualConnections: 1,
              overlapPeriods: ["Recent"],
              overlapPlaces: ["Remi Platform"],
              prompts: [
                {
                  question: "I remember when...",
                  answer: "we connected through Remi!",
                },
              ],
              matchScore: 75,
              isMatch: true,
            });
          }
        }

        console.log("Connected friends to add:", connectedFriends);

        // Combine default friends with connected friends
        const allFriends = [...friends, ...connectedFriends];

        // Update friends with ratings
        const updatedFriends = allFriends.map((friend) => {
          const ratingData = userRatings.find(
            (rating) => rating.id === friend.id,
          );
          if (ratingData) {
            const matchScore = calculateMatchScore(
              ratingData.interestLevel,
              ratingData.theirInterestLevel,
            );

            return {
              ...friend,
              interestLevel: ratingData.interestLevel,
              theirInterestLevel: ratingData.theirInterestLevel,
              matchScore: matchScore,
              isMatch: isMatch(
                ratingData.interestLevel,
                ratingData.theirInterestLevel,
              ),
            };
          }
          return friend;
        });

        // Update connections with ratings (use the connected friends we just created)
        const updatedConnections = [...connections, ...connectedFriends].map(
          (connection) => {
            const ratingData = userRatings.find(
              (rating) => rating.id === connection.id,
            );
            if (ratingData) {
              const matchScore = calculateMatchScore(
                ratingData.interestLevel,
                ratingData.theirInterestLevel,
              );

              return {
                ...connection,
                interestLevel: ratingData.interestLevel,
                theirInterestLevel: ratingData.theirInterestLevel,
                matchScore: matchScore,
                isMatch: isMatch(
                  ratingData.interestLevel,
                  ratingData.theirInterestLevel,
                ),
              };
            }
            return connection;
          },
        );

        setFriendsWithRatings(updatedFriends);
        setConnectionsWithRatings(updatedConnections);

        // Load matches from Supabase
        if (currentUserId) {
          try {
            const matchIds = await getUserMatchesFromSupabase(currentUserId);
            console.log("Loaded matches from Supabase:", matchIds);

            // Filter friends to show only matches
            const matchedFriends = updatedFriends.filter(
              (friend) =>
                matchIds.includes(friend.id) || friend.isMatch === true,
            );

            console.log("Matched friends:", matchedFriends);

            // You can use matchedFriends for the matches tab or other UI elements
          } catch (error) {
            console.error("Error loading matches:", error);
          }
        }
      } catch (error) {
        console.error("Error loading ratings:", error);
      }
    };

    loadRatings();
  }, [currentUserId, friends, connections]);

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

  const [matches, setMatches] = useState([
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
  ]);

  // Load matches and connections when user ID is available
  useEffect(() => {
    if (!currentUserId) return;

    const loadMatches = async () => {
      try {
        // Get all user ratings
        const userRatings = await loadUserRatingsFromSupabase(currentUserId);

        // Filter to only include matches (mutual high interest)
        const matchedRatings = userRatings.filter((rating) =>
          isMatch(rating.interestLevel, rating.theirInterestLevel),
        );

        // Also get users connected via invite links - simplified query
        console.log(
          "Fetching connections for matches for user:",
          currentUserId,
        );
        const { data: connections, error: connectionsError } = await supabase
          .from("connections")
          .select("*")
          .eq("user_id", currentUserId)
          .eq("status", "connected");

        console.log("Fetched connections from database:", connections);

        if (connectionsError) {
          console.error("Error fetching connections:", connectionsError);
        }

        const connectedUserIds = new Set();
        connections?.forEach((conn) => {
          console.log("Processing connection for matches:", conn);
          connectedUserIds.add(conn.friend_id);
          console.log("Added friend_id to matches:", conn.friend_id);
        });

        // Combine matched ratings and connected users
        const allPotentialMatches = new Set([
          ...matchedRatings.map((rating) => rating.id),
          ...Array.from(connectedUserIds),
        ]);

        if (allPotentialMatches.size === 0) return;

        // Get user details for each match
        const matchedUsers = [];

        console.log("All potential matches:", Array.from(allPotentialMatches));

        for (const userId of allPotentialMatches) {
          console.log("Fetching user data for:", userId);
          const { data: userData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            console.error("Error fetching match user data:", error);
            continue;
          }

          if (userData) {
            console.log("Found user data:", userData);
            const rating = matchedRatings.find((r) => r.id === userId);
            const matchScore = rating
              ? calculateMatchScore(
                  rating.interestLevel,
                  rating.theirInterestLevel,
                )
              : 75; // Default score for invite-based connections

            matchedUsers.push({
              id: userData.id,
              name: userData.full_name || userData.username || "Unknown User",
              photo:
                userData.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
              mutualConnections: Math.floor(Math.random() * 5) + 1, // Placeholder
              matchScore: matchScore,
            });
          }
        }

        console.log("Final matched users:", matchedUsers);

        if (matchedUsers.length > 0) {
          setMatches(matchedUsers);
        }
      } catch (error) {
        console.error("Error loading matches:", error);
      }
    };

    loadMatches();
  }, [currentUserId]);

  const handleNext = () => {
    if (currentIndex < filteredFriends.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSendRequest = () => {
    if (filteredFriends.length > 0) {
      onSendRequest(filteredFriends[currentIndex].id);
      handleNext();
    }
  };

  const handleSkip = () => {
    if (filteredFriends.length > 0) {
      onSkip(filteredFriends[currentIndex].id);
      handleNext();
    }
  };

  const handleSubmitMemory = () => {
    if (memoryPrompt.trim()) {
      onSubmitMemory(memoryPrompt);
      setMemoryPrompt("");
    }
  };

  const handleInterestLevelChange = (level: number) => {
    if (filteredFriends.length === 0) return;

    const currentFriend = filteredFriends[currentIndex];
    console.log(`Interest level for ${currentFriend.name}: ${level}`);

    // Find the index in the original friendsWithRatings array
    const originalIndex = friendsWithRatings.findIndex(
      (f) => f.id === currentFriend.id,
    );
    if (originalIndex === -1) return;

    const updatedFriends = friendsWithRatings.map((friend, idx) => {
      if (idx === originalIndex) {
        return { ...friend, interestLevel: level };
      }
      return friend;
    });

    if (!updatedFriends[originalIndex].theirInterestLevel) {
      updatedFriends[originalIndex].theirInterestLevel =
        Math.floor(Math.random() * 7) + 1;
    }

    setFriendsWithRatings(updatedFriends);
  };

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
              <div className="flex items-center justify-end space-x-2 mt-2">
                <Switch
                  id="show-matches"
                  checked={showOnlyMatches}
                  onCheckedChange={setShowOnlyMatches}
                />
                <Label
                  htmlFor="show-matches"
                  className="text-sm cursor-pointer"
                >
                  Show only matches
                </Label>
              </div>
            </div>

            <div className="relative w-full max-w-md">
              {filteredFriends.length > 0 ? (
                <FriendCard
                  friend={filteredFriends[currentIndex]}
                  onSendRequest={handleSendRequest}
                  onSkip={handleSkip}
                  onInterestLevelChange={handleInterestLevelChange}
                />
              ) : (
                <Card className="w-full h-[550px] flex items-center justify-center">
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      {showOnlyMatches
                        ? "No matches found. Try rating more people or check back later."
                        : "No potential connections found. Try adjusting your filters."}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || filteredFriends.length === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  {filteredFriends.length > 0
                    ? `${currentIndex + 1} of ${filteredFriends.length}`
                    : "0 of 0"}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={
                    currentIndex === filteredFriends.length - 1 ||
                    filteredFriends.length === 0
                  }
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
                  {friendsWithRatings
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
              {connectionsWithRatings.length > 0 ? (
                <FriendCard
                  friend={connectionsWithRatings[currentConnectionIndex]}
                  connected={true}
                  onMessage={(friendId) => {
                    const friend =
                      connectionsWithRatings[currentConnectionIndex];
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
                    const friend =
                      connectionsWithRatings[currentConnectionIndex];
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
                  {connectionsWithRatings.length > 0
                    ? `${currentConnectionIndex + 1} of ${connectionsWithRatings.length}`
                    : "0 of 0"}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (
                      currentConnectionIndex <
                      connectionsWithRatings.length - 1
                    ) {
                      setCurrentConnectionIndex(currentConnectionIndex + 1);
                    }
                  }}
                  disabled={
                    currentConnectionIndex === connectionsWithRatings.length - 1
                  }
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
