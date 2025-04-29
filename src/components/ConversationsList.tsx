import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMessagingSessions } from "@/utils/matchingService";

interface ConversationsListProps {
  currentUserId: string;
  onSelectConversation: (
    sessionId: string,
    matchId: string,
    matchName: string,
    matchAvatar: string,
  ) => void;
}

interface ConversationItem {
  sessionId: string;
  matchId: string;
  matchName: string;
  matchAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount?: number;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  currentUserId = "current-user",
  onSelectConversation,
}) => {
  // In a real app, this would fetch from a database
  // For now, we'll use the local storage sessions and add mock data
  const [conversations, setConversations] = React.useState<ConversationItem[]>(
    [],
  );

  React.useEffect(() => {
    // Get sessions from local storage
    const sessions = getMessagingSessions();

    // Transform sessions into conversation items with mock data where needed
    const mockConversations: ConversationItem[] = sessions.map((session) => {
      const isCurrentUserSender = session.userId === currentUserId;
      const matchId = isCurrentUserSender ? session.matchId : session.userId;

      // Get the last message if any
      const lastMessage =
        session.messages.length > 0
          ? session.messages[session.messages.length - 1].text
          : "No messages yet";

      // Get the last message time
      const lastMessageTime =
        session.messages.length > 0
          ? session.messages[session.messages.length - 1].timestamp
          : session.createdAt;

      return {
        sessionId: session.sessionId,
        matchId,
        // Mock data for name and avatar
        matchName: `User ${matchId.substring(0, 5)}`,
        matchAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchId}`,
        lastMessage,
        lastMessageTime: new Date(lastMessageTime),
        unreadCount: Math.floor(Math.random() * 3), // Random unread count for demo
      };
    });

    // Add some mock conversations if none exist
    if (mockConversations.length === 0) {
      mockConversations.push(
        {
          sessionId: "mock-session-1",
          matchId: "user-1",
          matchName: "Sarah Johnson",
          matchAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          lastMessage: "Hey! So glad we reconnected!",
          lastMessageTime: new Date(Date.now() - 3600000),
          unreadCount: 2,
        },
        {
          sessionId: "mock-session-2",
          matchId: "user-2",
          matchName: "Michael Chen",
          matchAvatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
          lastMessage: "Remember that time at the lake?",
          lastMessageTime: new Date(Date.now() - 86400000),
          unreadCount: 0,
        },
        {
          sessionId: "mock-session-3",
          matchId: "user-3",
          matchName: "Jessica Williams",
          matchAvatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
          lastMessage: "Let's catch up soon!",
          lastMessageTime: new Date(Date.now() - 172800000),
          unreadCount: 0,
        },
      );
    }

    // Sort by last message time (newest first)
    mockConversations.sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime(),
    );

    setConversations(mockConversations);
  }, [currentUserId]);

  // Format the time to display
  const formatMessageTime = (date: Date) => {
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
        <h2 className="text-xl font-semibold">Messages</h2>
        <p className="text-sm text-muted-foreground">Your conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Connect with friends to start chatting
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <Button
                key={conversation.sessionId}
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto"
                onClick={() =>
                  onSelectConversation(
                    conversation.sessionId,
                    conversation.matchId,
                    conversation.matchName,
                    conversation.matchAvatar,
                  )
                }
              >
                <div className="flex items-center w-full">
                  <div className="relative">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage
                        src={conversation.matchAvatar}
                        alt={conversation.matchName}
                      />
                      <AvatarFallback>
                        {conversation.matchName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount ? (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">
                        {conversation.matchName}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
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

export default ConversationsList;
