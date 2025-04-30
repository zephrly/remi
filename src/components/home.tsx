import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Mail, User, Search, Menu, UserCircle } from "lucide-react";
import Logo from "./Logo";
import DiscoveryFeed from "./DiscoveryFeed";
import ImportContacts from "./ImportContacts";
import MessagesPanel from "./MessagesPanel";
import ConversationsList from "./ConversationsList";
import ReminiscePanel from "./ReminiscePanel";
import ReminisceList from "./ReminisceList";
import UserProfile from "./UserProfile";
import Memories from "./Memories";

interface ConnectionRequest {
  id: string;
  name: string;
  avatar: string;
  message: string;
  date: string;
}

const Home = () => {
  // Main navigation tabs
  const [activeMainTab, setActiveMainTab] = useState("discover");

  // Sub-tabs for Discover section
  const [activeDiscoverSubTab, setActiveDiscoverSubTab] = useState("discover");

  // Sub-tabs for Connections section
  const [activeConnectionsSubTab, setActiveConnectionsSubTab] =
    useState("connections");

  const [selectedFriend, setSelectedFriend] = useState<null | {
    id: string;
    name: string;
    avatar: string;
  }>(null);

  // Mock connection requests data
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      message: "Hey! I think we went to Lincoln High together. Class of 2010?",
      date: "2 days ago",
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      message:
        "We worked together at TechCorp back in 2015. Would love to catch up!",
      date: "5 days ago",
    },
    {
      id: "3",
      name: "Jessica Williams",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
      message: "Remember our summer camp at Lake Tahoe? Those were the days!",
      date: "1 week ago",
    },
  ]);

  const handleAcceptRequest = (id: string) => {
    setConnectionRequests((prev) =>
      prev.filter((request) => request.id !== id),
    );
    // In a real app, would also add this connection to the user's connections list
  };

  const handleDeclineRequest = (id: string) => {
    setConnectionRequests((prev) =>
      prev.filter((request) => request.id !== id),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="h-8 mr-8" />
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => {
                  setActiveMainTab("discover");
                  setActiveDiscoverSubTab("discover");
                }}
                className={`${activeMainTab === "discover" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
              >
                Discover
              </button>
              <button
                onClick={() => {
                  setActiveMainTab("connections");
                  setActiveConnectionsSubTab("connections");
                }}
                className={`${activeMainTab === "connections" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
              >
                Connections
              </button>
              <button
                onClick={() => {
                  setActiveMainTab("connections");
                  setActiveConnectionsSubTab("messages");
                }}
                className={`${activeMainTab === "connections" && activeConnectionsSubTab === "messages" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveMainTab("memories")}
                className={`${activeMainTab === "memories" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"}`}
              >
                Memories
              </button>
              <button
                onClick={() => setActiveMainTab("profile")}
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
              onClick={() => setActiveMainTab("requests")}
            >
              <Bell size={20} />
              {connectionRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {connectionRequests.length}
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Discover Section */}
        {activeMainTab === "discover" && (
          <div>
            <Tabs
              value={activeDiscoverSubTab}
              onValueChange={setActiveDiscoverSubTab}
              className="w-full"
            >
              <TabsList className="mb-6 bg-white p-1 border border-gray-200 rounded-lg">
                <TabsTrigger value="discover" className="flex-1 py-2">
                  Discover
                </TabsTrigger>
                <TabsTrigger value="import" className="flex-1 py-2">
                  Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="mt-2">
                <DiscoveryFeed
                  view="discover"
                  onSelectFriend={(friend) => {
                    console.log("Selected friend:", friend);
                    setSelectedFriend({
                      id: friend.id,
                      name: friend.name,
                      avatar: friend.photo,
                    });
                    setActiveMainTab("connections");
                    setActiveConnectionsSubTab("messages");
                  }}
                  onChangeTab={(tab) => {
                    console.log("Changing tab to in home.tsx:", tab);
                    if (tab === "messages") {
                      setActiveMainTab("connections");
                      setActiveConnectionsSubTab("messages");
                    } else {
                      setActiveDiscoverSubTab(tab);
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="import" className="mt-2">
                <ImportContacts />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Connections Section */}
        {activeMainTab === "connections" && (
          <div>
            <Tabs
              value={activeConnectionsSubTab}
              onValueChange={setActiveConnectionsSubTab}
              className="w-full"
            >
              <TabsList className="mb-6 bg-white p-1 border border-gray-200 rounded-lg">
                <TabsTrigger value="connections" className="flex-1 py-2">
                  Browse
                </TabsTrigger>
                <TabsTrigger value="reminisce" className="flex-1 py-2">
                  Reminisce
                </TabsTrigger>
              </TabsList>
              <TabsContent value="connections" className="mt-2">
                <DiscoveryFeed
                  view="connections"
                  onSelectFriend={(friend) => {
                    console.log("Selected friend:", friend);
                    setSelectedFriend({
                      id: friend.id,
                      name: friend.name,
                      avatar: friend.photo,
                    });
                    setActiveConnectionsSubTab("messages");
                  }}
                  onChangeTab={(tab) => {
                    console.log("Changing tab to in home.tsx:", tab);
                    if (tab === "messages") {
                      setActiveConnectionsSubTab("messages");
                    } else if (tab === "reminisce") {
                      setActiveConnectionsSubTab("reminisce");
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="reminisce" className="mt-2">
                {selectedFriend ? (
                  <ReminiscePanel
                    friend={{
                      id: selectedFriend.id,
                      name: selectedFriend.name,
                      photo: selectedFriend.avatar,
                    }}
                    onBack={() => {
                      // Return to reminisce list
                      setSelectedFriend(null);
                    }}
                    onSaveMemory={(prompt, memory) => {
                      // In a real app, this would save the memory to the backend
                      console.log(
                        `Saving memory for ${selectedFriend.name}: ${prompt} - ${memory}`,
                      );
                    }}
                  />
                ) : (
                  <ReminisceList
                    currentUserId="current-user"
                    onSelectFriend={(friendId, friendName, friendAvatar) => {
                      console.log(
                        "Selected friend for reminiscing:",
                        friendName,
                      );
                      setSelectedFriend({
                        id: friendId,
                        name: friendName,
                        avatar: friendAvatar,
                      });
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-2">
                {selectedFriend ? (
                  <MessagesPanel
                    matchId={selectedFriend.id}
                    matchName={selectedFriend.name}
                    matchAvatar={selectedFriend.avatar}
                    currentUserId="current-user"
                    onBack={() => {
                      // Return to conversations list
                      setSelectedFriend(null);
                    }}
                    onSendMessage={(text) => {
                      // In a real app, this would send the message to the backend
                      console.log(
                        `Sending message to ${selectedFriend.name}: ${text}`,
                      );
                    }}
                  />
                ) : (
                  <ConversationsList
                    currentUserId="current-user"
                    onSelectConversation={(
                      sessionId,
                      matchId,
                      matchName,
                      matchAvatar,
                    ) => {
                      setSelectedFriend({
                        id: matchId,
                        name: matchName,
                        avatar: matchAvatar,
                      });
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* User Profile Section */}
        {activeMainTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <UserProfile />
          </div>
        )}

        {/* Memories Section */}
        {activeMainTab === "memories" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Memories userId="current-user" />
          </div>
        )}

        {/* Connection Requests Section */}
        {activeMainTab === "requests" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Requests</h2>

            {connectionRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You have no pending connection requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connectionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 flex items-start"
                  >
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={request.avatar} alt={request.name} />
                      <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{request.name}</h3>
                        <span className="text-xs text-gray-500">
                          {request.date}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {request.message}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
