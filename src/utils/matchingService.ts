/**
 * Matching Service
 *
 * This service handles the logic for matching users based on their mutual interest levels.
 */
import { createClient } from "@supabase/supabase-js";

// Use direct Supabase client to avoid enhanced client issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserInterest {
  id: string;
  interestLevel?: number;
  theirInterestLevel?: number;
}

import { UserRating } from "@/types/database";

interface MessageSession {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  last_message_at: string;
}

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  recipient_id: string;
  text: string;
  created_at: string;
}

/**
 * Determines if two users are a match based on their mutual interest levels
 * @param userInterestLevel The interest level of the current user (1-7)
 * @param theirInterestLevel The interest level of the other user (1-7)
 * @returns boolean indicating if they are a match
 */
export const isMatch = (
  userInterestLevel?: number,
  theirInterestLevel?: number,
): boolean => {
  // If either interest level is missing, they're not a match
  if (!userInterestLevel || !theirInterestLevel) return false;

  // Both users must have at least a moderate interest (4 or higher)
  if (userInterestLevel < 4 || theirInterestLevel < 4) return false;

  // The sum of their interest levels must be at least 10 (out of 14 possible)
  // This ensures both have a reasonably high interest
  return userInterestLevel + theirInterestLevel >= 10;
};

/**
 * Calculates a match score based on mutual interest levels
 * @param userInterestLevel The interest level of the current user (1-7)
 * @param theirInterestLevel The interest level of the other user (1-7)
 * @returns A match score from 0-100
 */
export const calculateMatchScore = (
  userInterestLevel?: number,
  theirInterestLevel?: number,
): number => {
  if (!userInterestLevel || !theirInterestLevel) return 0;

  // Calculate a score based on the product of both interest levels
  // This gives a value between 1 and 49
  const rawScore = userInterestLevel * theirInterestLevel;

  // Convert to a percentage (out of maximum possible 49)
  return Math.round((rawScore / 49) * 100);
};

/**
 * Gets all matches for a user based on stored interest levels
 * @param userId The current user's ID
 * @param allUsers All potential matches with their interest levels
 * @returns Array of user IDs that match with the current user
 */
export const getUserMatches = (
  userId: string,
  allUsers: UserInterest[],
): string[] => {
  return allUsers
    .filter(
      (user) =>
        user.id !== userId &&
        isMatch(user.interestLevel, user.theirInterestLevel),
    )
    .map((user) => user.id);
};

/**
 * Gets all matches for a user from Supabase
 * @param userId The current user's ID
 * @returns Promise resolving to an array of user IDs that match with the current user
 */
export const getUserMatchesFromSupabase = async (
  userId: string,
): Promise<string[]> => {
  const userInterests = await loadUserRatingsFromSupabase(userId);
  return getUserMatches(userId, userInterests);
};

/**
 * Loads stored interest levels from localStorage
 * @returns Array of user interests
 */
export const loadStoredInterestLevels = (): UserInterest[] => {
  const storedData = localStorage.getItem("friendInterestLevels");
  if (!storedData) return [];

  try {
    return JSON.parse(storedData);
  } catch (e) {
    console.error("Error parsing stored interest levels:", e);
    return [];
  }
};

/**
 * Loads user ratings from Supabase
 * @param userId The current user's ID
 * @returns Promise resolving to an array of user interests
 */
export const loadUserRatingsFromSupabase = async (
  userId: string,
): Promise<UserInterest[]> => {
  try {
    // Get ratings made by the current user
    const { data: outgoingRatings, error: outgoingError } = await supabase
      .from("user_ratings")
      .select("*")
      .eq("user_id", userId);

    if (outgoingError) {
      console.error("Error fetching outgoing ratings:", outgoingError);
      return [];
    }

    // Get ratings made about the current user
    const { data: incomingRatings, error: incomingError } = await supabase
      .from("user_ratings")
      .select("*")
      .eq("rated_user_id", userId);

    if (incomingError) {
      console.error("Error fetching incoming ratings:", incomingError);
      return [];
    }

    // Combine the ratings into UserInterest objects
    const userInterests: Record<string, UserInterest> = {};

    // Process outgoing ratings (user's interest in others)
    outgoingRatings?.forEach((rating) => {
      const typedRating = rating as UserRating;
      const friendId = typedRating.rated_user_id;
      if (!userInterests[friendId]) {
        userInterests[friendId] = { id: friendId };
      }
      userInterests[friendId].interestLevel = typedRating.interest_level;
    });

    // Process incoming ratings (others' interest in the user)
    incomingRatings?.forEach((rating) => {
      const typedRating = rating as UserRating;
      const friendId = typedRating.user_id;
      if (!userInterests[friendId]) {
        userInterests[friendId] = { id: friendId };
      }
      userInterests[friendId].theirInterestLevel = typedRating.interest_level;
    });

    return Object.values(userInterests);
  } catch (e) {
    console.error("Error loading ratings from Supabase:", e);
    return [];
  }
};

/**
 * Creates a new messaging session between two users in Supabase
 * @param userId The current user's ID
 * @param friendId The friend user's ID
 * @returns Promise resolving to the created message session
 */
export const createMessagingSession = async (
  userId: string,
  friendId: string,
): Promise<MessageSession | null> => {
  try {
    console.log("Creating messaging session:", { userId, friendId });

    // Use OR condition to find existing session in either direction
    const { data: existingSessions, error: searchError } = await supabase
      .from("message_sessions")
      .select("*")
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`,
      );

    if (searchError) {
      console.error("Error searching for existing session:", searchError);
    }

    if (existingSessions && existingSessions.length > 0) {
      console.log("Found existing session:", existingSessions[0]);
      return existingSessions[0];
    }

    // Create new session
    console.log("Creating new session between:", userId, "and", friendId);
    const { data: newSession, error: createError } = await supabase
      .from("message_sessions")
      .insert({
        user_id: userId,
        friend_id: friendId,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating new session:", createError);
      console.error("Create error details:", createError.details);
      console.error("Create error hint:", createError.hint);
      return null;
    }

    console.log("Successfully created new session:", newSession);
    return newSession;
  } catch (error) {
    console.error("Error creating messaging session:", error);
    return null;
  }
};

/**
 * Saves a messaging session to localStorage
 * @param session The messaging session to save
 */
const saveMessagingSession = (session: MessageSession): void => {
  const sessions = getMessagingSessions();
  const existingIndex = sessions.findIndex(
    (s) => s.sessionId === session.sessionId,
  );

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  localStorage.setItem("messagingSessions", JSON.stringify(sessions));
};

/**
 * Gets all messaging sessions for a user from Supabase
 * @param userId The user's ID
 * @returns Promise resolving to array of messaging sessions
 */
export const getMessagingSessions = async (
  userId: string,
): Promise<MessageSession[]> => {
  try {
    console.log("Fetching messaging sessions for user:", userId);

    // Get sessions where user is either user_id or friend_id
    const { data: userSessions, error: userError } = await supabase
      .from("message_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });

    const { data: friendSessions, error: friendError } = await supabase
      .from("message_sessions")
      .select("*")
      .eq("friend_id", userId)
      .order("last_message_at", { ascending: false });

    if (userError) {
      console.error("Error fetching user sessions:", userError);
    }
    if (friendError) {
      console.error("Error fetching friend sessions:", friendError);
    }

    // Combine results and remove duplicates
    const allSessions = [...(userSessions || []), ...(friendSessions || [])];
    const uniqueSessions = allSessions.filter(
      (session, index, self) =>
        index === self.findIndex((s) => s.id === session.id),
    );

    console.log("Found sessions:", uniqueSessions.length);
    return uniqueSessions;
  } catch (error) {
    console.error("Error fetching messaging sessions:", error);
    return [];
  }
};

/**
 * Gets a messaging session by ID from Supabase
 * @param sessionId The session ID to look for
 * @returns Promise resolving to the messaging session or null if not found
 */
export const getMessagingSessionById = async (
  sessionId: string,
): Promise<MessageSession | null> => {
  try {
    const { data: session, error } = await supabase
      .from("message_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Error fetching messaging session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error fetching messaging session:", error);
    return null;
  }
};

/**
 * Gets messages for a messaging session from Supabase
 * @param sessionId The session ID
 * @returns Promise resolving to array of messages
 */
export const getSessionMessages = async (
  sessionId: string,
): Promise<Message[]> => {
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

/**
 * Adds a message to a messaging session in Supabase
 * @param sessionId The session ID
 * @param senderId The sender's ID
 * @param text The message text
 * @param recipientId The recipient's ID
 * @returns Promise resolving to the created message or null if failed
 */
export const addMessageToSession = async (
  sessionId: string,
  senderId: string,
  text: string,
  recipientId?: string,
): Promise<Message | null> => {
  try {
    console.log("Adding message to session:", {
      sessionId,
      senderId,
      text,
      recipientId,
    });

    // If recipientId is not provided, get it from the session
    let finalRecipientId = recipientId;
    if (!finalRecipientId) {
      const { data: session, error: sessionError } = await supabase
        .from("message_sessions")
        .select("user_id, friend_id")
        .eq("id", sessionId)
        .single();

      if (sessionError) {
        console.error("Error fetching session for recipient:", sessionError);
        return null;
      }

      // Determine recipient based on who is NOT the sender
      finalRecipientId =
        session.user_id === senderId ? session.friend_id : session.user_id;
    }

    console.log("Final recipient ID:", finalRecipientId);

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        recipient_id: finalRecipientId,
        text: text,
        read: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      console.error("Message error details:", messageError.details);
      console.error("Message error hint:", messageError.hint);
      return null;
    }

    console.log("Message created successfully:", message);

    // Update the session's last_message_at timestamp
    const { error: sessionUpdateError } = await supabase
      .from("message_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (sessionUpdateError) {
      console.error("Error updating session timestamp:", sessionUpdateError);
      // Don't fail the message creation if timestamp update fails
    }

    return message;
  } catch (error) {
    console.error("Error adding message to session:", error);
    return null;
  }
};
