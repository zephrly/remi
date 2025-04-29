import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Memory } from "@/types/user";
import MemoryCard from "./MemoryCard";
import { getUserMemories } from "@/services/memoryService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MemoriesProps {
  userId?: string;
}

type FilterType = "all" | "created" | "tagged";

const Memories: React.FC<MemoriesProps> = ({ userId = "current-user" }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Extract unique contacts from memories for filtering
  const contacts = memories.reduce<{ id: string; name: string }[]>(
    (acc, memory) => {
      if (memory.tags) {
        memory.tags.forEach((tag) => {
          if (tag.user && !acc.some((contact) => contact.id === tag.user?.id)) {
            acc.push({ id: tag.user.id, name: tag.user.name });
          }
        });
      }
      return acc;
    },
    [],
  );

  useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true);
      try {
        const { memories, error } = await getUserMemories(userId);
        if (error) {
          console.error("Error fetching memories:", error);
        } else {
          setMemories(memories);
        }
      } catch (error) {
        console.error("Error fetching memories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [userId]);

  const filteredMemories = memories.filter((memory) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      memory.prompt.toLowerCase().includes(searchLower) ||
      memory.content.toLowerCase().includes(searchLower);

    // Filter by type (all, created, tagged)
    const matchesType =
      filterType === "all" ||
      (filterType === "created" && memory.userId === userId) ||
      (filterType === "tagged" && memory.userId !== userId);

    // Filter by selected contact
    const matchesContact =
      !selectedContact ||
      memory.tags?.some((tag) => tag.user?.id === selectedContact);

    return matchesSearch && matchesType && matchesContact;
  });

  const clearFilters = () => {
    setFilterType("all");
    setSelectedContact(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Memories</h2>
        <Button>Create Memory</Button>
      </div>

      <div className="w-full mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search memories"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as FilterType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Memories</SelectItem>
            <SelectItem value="created">Created by me</SelectItem>
            <SelectItem value="tagged">Tagged in</SelectItem>
          </SelectContent>
        </Select>

        {contacts.length > 0 && (
          <Select
            value={selectedContact || ""}
            onValueChange={setSelectedContact}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Contacts</SelectItem>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(filterType !== "all" || selectedContact) && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X size={16} />
          </Button>
        )}

        {/* Active filters display */}
        {(filterType !== "all" || selectedContact) && (
          <div className="flex flex-wrap gap-2 items-center ml-2">
            {filterType !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filterType === "created" ? "Created by me" : "Tagged in"}
              </Badge>
            )}
            {selectedContact && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {contacts.find((c) => c.id === selectedContact)?.name}
              </Badge>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading memories...</p>
        </div>
      ) : filteredMemories.length > 0 ? (
        <div className="space-y-4">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              currentUserId={userId}
              onAddComment={(memoryId, comment) => {
                console.log(`Adding comment to memory ${memoryId}: ${comment}`);
                // In a real app, this would call an API to add the comment
              }}
              onLike={(memoryId) => {
                console.log(`Liking memory ${memoryId}`);
                // In a real app, this would call an API to like the memory
              }}
              onShare={(memoryId) => {
                console.log(`Sharing memory ${memoryId}`);
                // In a real app, this would open a share dialog
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || filterType !== "all" || selectedContact
              ? "No memories match your filters"
              : "You haven't created any memories yet"}
          </p>
          <Button className="mt-4">Create Your First Memory</Button>
        </div>
      )}
    </div>
  );
};

export default Memories;
