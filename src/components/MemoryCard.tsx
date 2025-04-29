import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, ExternalLink } from "lucide-react";
import { Memory, MemoryComment } from "@/types/user";
import { Link } from "react-router-dom";

interface MemoryCardProps {
  memory: Memory;
  currentUserId: string;
  onAddComment?: (memoryId: string, comment: string) => void;
  onLike?: (memoryId: string) => void;
  onShare?: (memoryId: string) => void;
  className?: string;
  compact?: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  currentUserId,
  onAddComment = () => {},
  onLike = () => {},
  onShare = () => {},
  className = "",
  compact = false,
}) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(memory.id, comment);
      setComment("");
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className={compact ? "p-3" : "p-6"}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link to={`/memories/${memory.id}`} className="group">
              <h3
                className={`font-medium ${compact ? "text-base" : "text-lg"} mb-1 group-hover:text-primary group-hover:underline flex items-center gap-1`}
              >
                {memory.prompt}
                <ExternalLink
                  size={16}
                  className="inline-block opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              {new Date(memory.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link
            to={`/memories/${memory.id}`}
            className="shrink-0 ml-4 text-sm text-primary hover:underline"
          >
            View details
          </Link>
        </div>
        <p className="mb-4">{memory.content}</p>

        {/* Display tags if any */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Tagged:</p>
            <div className="flex flex-wrap gap-1">
              {memory.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5"
                >
                  {tag.user?.name || "Unknown user"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Display photos if any */}
        {memory.photos && memory.photos.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {memory.photos.map((photo) => (
              <div
                key={photo.id}
                className={`${compact ? "w-16 h-16" : "w-24 h-24"} rounded-md overflow-hidden`}
              >
                <img
                  src={photo.photoUrl}
                  alt="Memory"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onLike(memory.id)}
          >
            <Heart size={16} />
            <span>Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowComments(!showComments)}
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
            onClick={() => onShare(memory.id)}
          >
            <Share size={16} />
            <span>Share</span>
          </Button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3 mb-4">
              {memory.comments && memory.comments.length > 0 ? (
                memory.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
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
                      <div className="bg-muted p-2 rounded-md">
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

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleAddComment}>
                Post Comment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryCard;
