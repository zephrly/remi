import { supabase } from "@/lib/supabase";

export interface Memory {
  id: string;
  userId: string;
  prompt: string;
  content: string;
  createdAt: string;
  tags?: {
    id: string;
    user?: {
      id: string;
      name: string;
    };
  }[];
  photos?: {
    id: string;
    photoUrl: string;
  }[];
  comments?: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: {
      name: string;
    };
  }[];
}

export async function getUserMemories(userId: string) {
  try {
    // Fetch memories created by the user or where the user is tagged
    const { data, error } = await supabase
      .from("memories")
      .select(
        `
        id,
        userId,
        prompt,
        content,
        createdAt,
        tags:memory_tags(id, userId, users(id, name)),
        photos:memory_photos(id, photoUrl),
        comments:memory_comments(id, userId, content, createdAt, users(name, avatar))
      `,
      )
      .or(`userId.eq.${userId},tags.userId.eq.${userId}`)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // For demo purposes, if no data is returned, create mock memories
    if (!data || data.length === 0) {
      return {
        memories: [
          {
            id: "1",
            userId: userId,
            prompt: "First day at college",
            content:
              "I remember meeting my roommate for the first time. We were both so nervous!",
            createdAt: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            tags: [
              {
                id: "tag1",
                user: { id: "user2", name: "Sarah Johnson" },
              },
            ],
            photos: [
              {
                id: "photo1",
                photoUrl:
                  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
              },
            ],
            comments: [
              {
                id: "comment1",
                userId: "user2",
                content:
                  "I was so nervous too! Remember how we stayed up all night talking?",
                createdAt: new Date(
                  Date.now() - 5 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                user: {
                  name: "Sarah Johnson",
                  avatar:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
                },
              },
            ],
          },
          {
            id: "2",
            userId: userId,
            prompt: "Summer road trip 2018",
            content:
              "That amazing drive down the coast with the windows down and music blasting.",
            createdAt: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            tags: [
              {
                id: "tag2",
                user: { id: "user3", name: "Michael Chen" },
              },
            ],
            photos: [
              {
                id: "photo2",
                photoUrl:
                  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
              },
            ],
            comments: [],
          },
          {
            id: "3",
            userId: "user3",
            prompt: "High school graduation",
            content:
              "Throwing our caps in the air and feeling like anything was possible.",
            createdAt: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            tags: [
              {
                id: "tag3",
                user: { id: userId, name: "Current User" },
              },
            ],
            photos: [],
            comments: [],
          },
        ],
        error: null,
      };
    }

    return { memories: (data as Memory[]) || [], error: null };
  } catch (error) {
    console.error("Error fetching memories:", error);
    return { memories: [], error };
  }
}

export async function createMemory(memory: Omit<Memory, "id" | "createdAt">) {
  try {
    // Insert the memory
    const { data, error } = await supabase
      .from("memories")
      .insert({
        userId: memory.userId,
        prompt: memory.prompt,
        content: memory.content,
      })
      .select("id");

    if (error) throw error;
    const memoryId = data[0].id;

    // Insert tags if any
    if (memory.tags && memory.tags.length > 0) {
      const tagInserts = memory.tags.map((tag) => ({
        memoryId,
        userId: tag.user?.id,
      }));

      const { error: tagError } = await supabase
        .from("memory_tags")
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    // Insert photos if any
    if (memory.photos && memory.photos.length > 0) {
      const photoInserts = memory.photos.map((photo) => ({
        memoryId,
        photoUrl: photo.photoUrl,
      }));

      const { error: photoError } = await supabase
        .from("memory_photos")
        .insert(photoInserts);

      if (photoError) throw photoError;
    }

    return { memory: { id: memoryId, ...memory }, error: null };
  } catch (error) {
    console.error("Error creating memory:", error);
    return { memory: null, error };
  }
}
