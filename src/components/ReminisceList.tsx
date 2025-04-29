import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReminisceListProps {
  currentUserId: string;
  onSelectFriend: (
    friendId: string,
    friendName: string,
    friendAvatar: string,
  ) => void;
}

interface FriendItem {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastInteraction: string;
  lastInteractionTime: Date;
  sharedMemories: number;
}

const ReminisceList: React.FC<ReminisceListProps> = ({
  currentUserId = "current-user",
  onSelectFriend,
}) => {
  // In a real app, this would fetch from a database
  const [friends, setFriends] = React.useState<FriendItem[]>([]);

  React.useEffect(() => {
    // Mock data for friends list
    const mockFriends: FriendItem[] = [
      {
        friendId: "friend-1",
        friendName: "Sarah Johnson",
        friendAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        lastInteraction: "Shared a memory about college",
        lastInteractionTime: new Date(Date.now() - 3600000),
        sharedMemories: 8,
      },
      {
        friendId: "friend-2",
        friendName: "Michael Chen",
        friendAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        lastInteraction: "Reminisced about summer camp",
        lastInteractionTime: new Date(Date.now() - 86400000),
        sharedMemories: 5,
      },
      {
        friendId: "friend-3",
        friendName: "Jessica Williams",
        friendAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
        lastInteraction: "Tagged you in a memory",
        lastInteractionTime: new Date(Date.now() - 172800000),
        sharedMemories: 12,
      },
      {
        friendId: "friend-4",
        friendName: "David Rodriguez",
        friendAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        lastInteraction: "Commented on your high school photo",
        lastInteractionTime: new Date(Date.now() - 259200000),
        sharedMemories: 7,
      },
      {
        friendId: "friend-5",
        friendName: "Emily Thompson",
        friendAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        lastInteraction: "Shared a memory from your trip",
        lastInteractionTime: new Date(Date.now() - 345600000),
        sharedMemories: 10,
      },
    ];

    // Sort by last interaction time (newest first)
    mockFriends.sort(
      (a, b) =>
        b.lastInteractionTime.getTime() - a.lastInteractionTime.getTime(),
    );

    setFriends(mockFriends);
  }, [currentUserId]);

  // Format the time to display
  const formatInteractionTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: "short" });
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Reminisce</h2>
        <p className="text-sm text-muted-foreground">Reconnect with friends</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No connections yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add friends to start reminiscing
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {friends.map((friend) => (
              <Button
                key={friend.friendId}
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto"
                onClick={() =>
                  onSelectFriend(
                    friend.friendId,
                    friend.friendName,
                    friend.friendAvatar,
                  )
                }
              >
                <div className="flex items-center w-full">
                  <div className="relative">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage
                        src={friend.friendAvatar}
                        alt={friend.friendName}
                      />
                      <AvatarFallback>
                        {friend.friendName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-800 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {friend.sharedMemories}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">
                        {friend.friendName}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatInteractionTime(friend.lastInteractionTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {friend.lastInteraction}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminisceList;
