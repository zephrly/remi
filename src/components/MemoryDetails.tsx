import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  Edit,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Memory } from "@/types/user";
import { getUserMemories } from "@/services/memoryService";

interface MemoryDetailsProps {
  userId?: string;
}

const MemoryDetails: React.FC<MemoryDetailsProps> = ({
  userId = "current-user",
}) => {
  const { memoryId } = useParams<{ memoryId: string }>();
  const navigate = useNavigate();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemory, setEditedMemory] = useState<Partial<Memory>>({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchMemory = async () => {
      setIsLoading(true);
      try {
        const { memories, error } = await getUserMemories(userId);
        if (error) {
          console.error("Error fetching memories:", error);
        } else {
          const foundMemory = memories.find((m) => m.id === memoryId);
          if (foundMemory) {
            setMemory(foundMemory);
            setEditedMemory({
              prompt: foundMemory.prompt,
              content: foundMemory.content,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching memory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (memoryId) {
      fetchMemory();
    }
  }, [memoryId, userId]);

  const handleSaveChanges = () => {
    if (!memory) return;

    // In a real app, this would call an API to update the memory
    console.log("Saving changes to memory:", {
      id: memory.id,
      ...editedMemory,
    });

    // Update the local state
    setMemory({
      ...memory,
      prompt: editedMemory.prompt || memory.prompt,
      content: editedMemory.content || memory.content,
    });

    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!memory || !newComment.trim()) return;

    // In a real app, this would call an API to add the comment
    console.log(`Adding comment to memory ${memory.id}: ${newComment}`);

    // Create a mock comment for demonstration
    const newCommentObj = {
      id: `comment-${Date.now()}`,
      userId: userId,
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        name: "Current User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
      },
    };

    // Update the local state
    setMemory({
      ...memory,
      comments: [...(memory.comments || []), newCommentObj],
    });

    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex justify-center py-12">
        <p>Loading memory...</p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Memories
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center py-12 text-muted-foreground">
              Memory not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="mr-2" /> Back to Memories
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <Input
                  value={editedMemory.prompt || ""}
                  onChange={(e) =>
                    setEditedMemory({ ...editedMemory, prompt: e.target.value })
                  }
                  className="text-xl font-semibold mb-1"
                />
              ) : (
                <CardTitle>{memory.prompt}</CardTitle>
              )}
              <CardDescription>
                {new Date(memory.createdAt).toLocaleDateString()} •
                {memory.userId === userId
                  ? "Created by you"
                  : "You were tagged"}
              </CardDescription>
            </div>

            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSaveChanges}>
                    <Save size={16} className="mr-2" /> Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-2" /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedMemory.content || ""}
              onChange={(e) =>
                setEditedMemory({ ...editedMemory, content: e.target.value })
              }
              className="min-h-[150px] mb-4"
            />
          ) : (
            <p className="mb-6 whitespace-pre-wrap">{memory.content}</p>
          )}

          {/* Display tags if any */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Tagged People:</h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 bg-muted p-2 rounded-md"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {(tag.user?.name || "").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {tag.user?.name || "Unknown user"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display photos if any */}
          {memory.photos && memory.photos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Photos:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memory.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-md overflow-hidden"
                  >
                    <img
                      src={photo.photoUrl}
                      alt="Memory"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {isEditing && (
                  <div className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center">
                      <Plus size={24} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Add Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-6 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Heart size={16} />
              <span>Like</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <MessageCircle size={16} />
              <span>
                {memory.comments?.length || 0} Comment
                {memory.comments?.length !== 1 ? "s" : ""}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Share size={16} />
              <span>Share</span>
            </Button>
          </div>

          {/* Comments section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Comments</h3>
            <div className="space-y-4 mb-6">
              {memory.comments && memory.comments.length > 0 ? (
                memory.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.user?.avatar}
                        alt={comment.user?.name || ""}
                      />
                      <AvatarFallback>
                        {(comment.user?.name || "").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-medium text-sm">
                          {comment.user?.name}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment}>Post Comment</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryDetails;
