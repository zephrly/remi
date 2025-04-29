import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import IcebreakerPrompts from "./IcebreakerPrompts";

interface ReminiscePanelProps {
  friend: {
    id: string;
    name: string;
    photo: string;
  };
  onBack?: () => void;
  onSaveMemory?: (prompt: string, memory: string) => void;
}

const ReminiscePanel: React.FC<ReminiscePanelProps> = ({
  friend,
  onBack = () => {},
  onSaveMemory = () => {},
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [memoryText, setMemoryText] = useState<string>("");
  const [savedMemories, setSavedMemories] = useState<
    Array<{ prompt: string; memory: string }>
  >([]);

  const handleSelectPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleSaveMemory = () => {
    if (selectedPrompt && memoryText.trim()) {
      onSaveMemory(selectedPrompt, memoryText);
      setSavedMemories([
        ...savedMemories,
        { prompt: selectedPrompt, memory: memoryText },
      ]);
      setMemoryText("");
      setSelectedPrompt("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={friend.photo} alt={friend.name} />
          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{friend.name}</h2>
          <p className="text-sm text-muted-foreground">Reminiscing</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              Share Memories with {friend.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a prompt and share a memory to reconnect over your shared
              experiences.
            </p>
          </div>

          {selectedPrompt ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">{selectedPrompt}</h4>
                <Textarea
                  placeholder="Share your memory here..."
                  className="min-h-[120px]"
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                />
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPrompt("")}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMemory}>Save Memory</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <IcebreakerPrompts
              onSelectPrompt={handleSelectPrompt}
              category="shared"
            />
          )}

          {savedMemories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Your Shared Memories</h3>
              <div className="space-y-4">
                {savedMemories.map((item, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="pt-6">
                      <h4 className="font-medium text-sm">{item.prompt}</h4>
                      <p className="mt-2">{item.memory}</p>

                      {/* Tagged Users */}
                      {item.taggedUsers && item.taggedUsers.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            Tagged:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.taggedUsers.map((user) => (
                              <Badge
                                key={user.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {user.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Photos */}
                      {item.photos && item.photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.photos.map((photo, photoIndex) => (
                            <div
                              key={photoIndex}
                              className="w-16 h-16 rounded-md overflow-hidden"
                            >
                              <img
                                src={photo}
                                alt="Memory"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminiscePanel;
