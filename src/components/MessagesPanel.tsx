import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Phone, Video, Info } from "lucide-react";
import {
  getSessionMessages,
  addMessageToSession,
  createMessagingSession,
  getMessagingSessions,
} from "@/utils/matchingService";
import { createClient } from "@supabase/supabase-js";

// Direct Supabase client for debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const directSupabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface MessagesProps {
  sessionId?: string;
  matchId?: string;
  matchName?: string;
  matchAvatar?: string;
  currentUserId?: string;
  initialMessages?: Message[];
  onSendMessage?: (text: string) => void;
  onBack?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}

const MessagesPanel: React.FC<MessagesProps> = ({
  sessionId,
  matchId = "1",
  matchName = "Sarah Johnson",
  matchAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  currentUserId = "current-user",
  onBack,
  onVideoCall,
  onVoiceCall,
  initialMessages = [],
  onSendMessage = () => {},
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId || null,
  );
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts or sessionId changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log(
          "Loading messages - sessionId:",
          currentSessionId,
          "matchId:",
          matchId,
          "currentUserId:",
          currentUserId,
        );

        if (!currentSessionId) {
          // Try to find or create session
          if (matchId && currentUserId) {
            console.log(
              "Looking for existing session between:",
              currentUserId,
              "and",
              matchId,
            );

            // Try to find existing session
            let sessionToUse = await createMessagingSession(
              currentUserId,
              matchId,
            );

            if (sessionToUse) {
              console.log("Using session:", sessionToUse.id);
              setCurrentSessionId(sessionToUse.id);

              // Load messages for this session
              const sessionMessages = await getSessionMessages(sessionToUse.id);
              console.log("Loaded messages:", sessionMessages);
              const formattedMessages = sessionMessages.map((msg) => ({
                id: msg.id,
                senderId: msg.sender_id,
                text: msg.text,
                timestamp: new Date(msg.created_at),
              }));
              setMessages(formattedMessages);
            } else {
              console.error("Failed to create or find session");
              setMessages([]);
            }
          }
        } else {
          // Load existing messages
          console.log(
            "Loading messages for existing session:",
            currentSessionId,
          );
          const sessionMessages = await getSessionMessages(currentSessionId);
          console.log("Loaded messages:", sessionMessages);
          const formattedMessages = sessionMessages.map((msg) => ({
            id: msg.id,
            senderId: msg.sender_id,
            text: msg.text,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [currentSessionId, matchId, currentUserId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    console.log("handleSendMessage called", {
      newMessage: newMessage.trim(),
      currentSessionId,
      loading,
      currentUserId,
      matchId,
    });

    if (!newMessage.trim()) {
      console.log("No message text, returning");
      return;
    }

    if (loading) {
      console.log("Already loading, returning");
      return;
    }

    if (!currentUserId || !matchId) {
      console.error("Missing required IDs:", { currentUserId, matchId });
      return;
    }

    setLoading(true);

    try {
      // Store message text and clear input immediately for better UX
      const messageText = newMessage.trim();
      setNewMessage("");

      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        text: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        console.log("No session ID, creating new session");
        const newSession = await createMessagingSession(currentUserId, matchId);
        if (newSession) {
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
          console.log("Created new session:", sessionId);
        } else {
          console.error("Failed to create session");
          // Remove optimistic message and restore input
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id),
          );
          setNewMessage(messageText);
          setLoading(false);
          return;
        }
      }

      console.log("Sending message to session:", sessionId);
      // Save the message to Supabase
      const savedMessage = await addMessageToSession(
        sessionId,
        currentUserId,
        messageText,
        matchId,
      );

      console.log("Message saved:", savedMessage);
      if (savedMessage) {
        // Replace the optimistic message with the real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  id: savedMessage.id,
                  senderId: savedMessage.sender_id,
                  text: savedMessage.text,
                  timestamp: new Date(savedMessage.created_at),
                }
              : msg,
          ),
        );
        onSendMessage(messageText);
      } else {
        console.error("Failed to save message - removing optimistic message");
        // Remove the optimistic message if save failed
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id),
        );
        setNewMessage(messageText); // Restore the message text
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Remove the optimistic message if save failed
      setMessages((prev) => prev.filter((msg) => msg.id.startsWith("temp-")));
      setNewMessage(newMessage); // Restore the message text
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = message.timestamp.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={matchAvatar} alt={matchName} />
            <AvatarFallback>{matchName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{matchName}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {onVoiceCall && (
            <Button variant="ghost" size="icon" onClick={onVoiceCall}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onVideoCall && (
            <Button variant="ghost" size="icon" onClick={onVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {dateMessages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar =
                index === 0 ||
                dateMessages[index - 1]?.senderId !== message.senderId;
              const isLastInGroup =
                index === dateMessages.length - 1 ||
                dateMessages[index + 1]?.senderId !== message.senderId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end">
                    {!isCurrentUser && showAvatar ? (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={matchAvatar} alt={matchName} />
                        <AvatarFallback>{matchName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : !isCurrentUser ? (
                      <div className="w-8 mr-2" /> // Placeholder for alignment
                    ) : null}
                    <div
                      className={`max-w-[80%] px-4 py-2 ${
                        isCurrentUser
                          ? `bg-primary text-primary-foreground ${isLastInGroup ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-br-sm rounded-tr-sm"}`
                          : `bg-white border border-gray-100 ${isLastInGroup ? "rounded-2xl rounded-bl-sm" : "rounded-2xl rounded-bl-sm rounded-tl-sm"}`
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 mr-2 bg-gray-50"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!newMessage.trim() || loading}
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
