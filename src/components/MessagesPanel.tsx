import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Phone, Video, Info } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface MessagesProps {
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
  matchId = "1",
  matchName = "Sarah Johnson",
  matchAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  currentUserId = "current-user",
  onBack,
  onVideoCall,
  onVoiceCall,
  initialMessages = [
    {
      id: "1",
      senderId: "1",
      text: "Hey! So glad we reconnected!",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Me too! It's been way too long.",
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: "3",
      senderId: "1",
      text: "What have you been up to since high school?",
      timestamp: new Date(Date.now() - 2400000),
    },
  ],
  onSendMessage = () => {},
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        text: newMessage,
        timestamp: new Date(),
      };

      setMessages([...messages, message]);
      onSendMessage(newMessage);
      setNewMessage("");
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
            disabled={!newMessage.trim()}
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
