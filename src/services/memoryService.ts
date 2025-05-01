import { supabase } from "@/lib/supabase";

import { Memory } from "@/types/memory";

export async function getUserMemories(userId: string) {
  try {
    // Fetch memories created by the user or where the user is tagged
    const { data, error } = await supabase
      .from("memories")
      .select(
        `
        id,
        user_id,
        prompt,
        memory_text,
        created_at,
        tags:memory_tags(id, user_id, users(id, name)),
        photos:memory_photos(id, photo_url),
        comments:memory_comments(id, user_id, content, created_at, users(name, avatar))
      `,
      )
      .or(`user_id.eq.${userId},tags.user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

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

    // Transform the data to match the Memory interface
    const transformedData = data?.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      prompt: item.prompt,
      content: item.memory_text, // Map memory_text to content in our interface
      createdAt: item.created_at,
      tags: item.tags?.map((tag: any) => ({
        id: tag.id,
        user: tag.users
          ? {
              id: tag.users.id,
              name: tag.users.name,
            }
          : undefined,
      })),
      photos: item.photos?.map((photo: any) => ({
        id: photo.id,
        photoUrl: photo.photo_url,
      })),
      comments: item.comments?.map((comment: any) => ({
        id: comment.id,
        userId: comment.user_id,
        content: comment.content,
        createdAt: comment.created_at,
        user: comment.users
          ? {
              name: comment.users.name,
              avatar: comment.users.avatar,
            }
          : undefined,
      })),
    }));

    return { memories: (transformedData as Memory[]) || [], error: null };
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
        user_id: memory.userId,
        prompt: memory.prompt,
        memory_text: memory.content, // Changed from content to memory_text to match DB schema
      })
      .select("id");

    if (error) throw error;
    const memoryId = data[0].id;

    // Insert tags if any
    if (memory.tags && memory.tags.length > 0) {
      const tagInserts = memory.tags.map((tag) => ({
        memory_id: memoryId,
        user_id: tag.user?.id,
      }));

      const { error: tagError } = await supabase
        .from("memory_tags")
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    // Insert photos if any
    if (memory.photos && memory.photos.length > 0) {
      const photoInserts = memory.photos.map((photo) => ({
        memory_id: memoryId,
        photo_url: photo.photoUrl,
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
