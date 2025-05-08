/**
 * Matching Service
 *
 * This service handles the logic for matching users based on their mutual interest levels.
 */
import { supabase } from "@/lib/supabase";

interface UserInterest {
  id: string;
  interestLevel?: number;
  theirInterestLevel?: number;
}

import { UserRating } from "@/types/database";

interface MessageSession {
  sessionId: string;
  userId: string;
  matchId: string;
  createdAt: Date;
  lastMessageAt: Date;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
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
    const { data: outgoingRatings, error: outgoingError } =
      await supabase.userRatings.select().eq("user_id", userId);

    if (outgoingError) {
      console.error("Error fetching outgoing ratings:", outgoingError);
      return [];
    }

    // Get ratings made about the current user
    const { data: incomingRatings, error: incomingError } =
      await supabase.userRatings.select().eq("rated_user_id", userId);

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
 * Creates a new messaging session between two users
 * @param userId The current user's ID
 * @param matchId The matched user's ID
 * @returns The created message session
 */
export const createMessagingSession = (
  userId: string,
  matchId: string,
): MessageSession => {
  const sessionId = `${userId}-${matchId}-${Date.now()}`;
  const session: MessageSession = {
    sessionId,
    userId,
    matchId,
    createdAt: new Date(),
    lastMessageAt: new Date(),
    messages: [],
  };

  // Store the session in localStorage
  saveMessagingSession(session);

  return session;
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
 * Gets all messaging sessions from localStorage
 * @returns Array of messaging sessions
 */
export const getMessagingSessions = (): MessageSession[] => {
  const storedData = localStorage.getItem("messagingSessions");
  if (!storedData) return [];

  try {
    return JSON.parse(storedData);
  } catch (e) {
    console.error("Error parsing stored messaging sessions:", e);
    return [];
  }
};

/**
 * Gets a messaging session by ID
 * @param sessionId The session ID to look for
 * @returns The messaging session or undefined if not found
 */
export const getMessagingSessionById = (
  sessionId: string,
): MessageSession | undefined => {
  const sessions = getMessagingSessions();
  return sessions.find((session) => session.sessionId === sessionId);
};

/**
 * Gets all messaging sessions for a user
 * @param userId The user's ID
 * @returns Array of messaging sessions for the user
 */
export const getUserMessagingSessions = (userId: string): MessageSession[] => {
  const sessions = getMessagingSessions();
  return sessions.filter(
    (session) => session.userId === userId || session.matchId === userId,
  );
};

/**
 * Adds a message to a messaging session
 * @param sessionId The session ID
 * @param senderId The sender's ID
 * @param text The message text
 * @returns The updated messaging session or undefined if session not found
 */
export const addMessageToSession = (
  sessionId: string,
  senderId: string,
  text: string,
): MessageSession | undefined => {
  const session = getMessagingSessionById(sessionId);
  if (!session) return undefined;

  const message: Message = {
    id: Date.now().toString(),
    senderId,
    text,
    timestamp: new Date(),
  };

  session.messages.push(message);
  session.lastMessageAt = new Date();

  saveMessagingSession(session);
  return session;
};
