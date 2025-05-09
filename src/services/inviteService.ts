import { Contact } from "../types/user";
import { supabase } from "../lib/supabase";
import { InviteLink, Connection } from "../types/database";

// Service functions for handling invites
export const inviteService = {
  /**
   * Send an anonymous invite to a contact (mock implementation)
   */
  sendAnonymousInvite: async (contact: Contact): Promise<boolean> => {
    console.log(`Sending anonymous invite to ${contact.name}`);

    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock success response
        resolve(true);
      }, 1500);
    });
  },

  /**
   * Send a personalized invite to a contact (mock implementation)
   */
  sendPersonalizedInvite: async (
    contact: Contact,
    message: string,
  ): Promise<boolean> => {
    console.log(`Sending personalized invite to ${contact.name}: ${message}`);

    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock success response
        resolve(true);
      }, 1500);
    });
  },

  /**
   * Check if a contact has been invited recently (mock implementation)
   */
  hasBeenInvitedRecently: async (contact: Contact): Promise<boolean> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock response - randomly determine if invited recently
        resolve(Math.random() > 0.7);
      }, 500);
    });
  },

  /**
   * Generate a unique invite link for the current user with improved error handling
   * and collision detection
   */
  generateInviteLink: async (): Promise<string> => {
    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error("Authentication failed when generating invite link");
      }

      if (!user) {
        throw new Error("User must be logged in to generate an invite link");
      }

      // Generate a unique code with better entropy
      const generateUniqueCode = () => {
        // Use crypto API for better randomness if available
        if (window.crypto && window.crypto.getRandomValues) {
          const randomBytes = new Uint8Array(12);
          window.crypto.getRandomValues(randomBytes);
          return Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .substring(0, 8);
        } else {
          // Fallback to Math.random with timestamp for uniqueness
          return (
            Math.random().toString(36).substring(2, 8) +
            Date.now().toString(36).substring(-4)
          );
        }
      };

      // Try to generate a unique code that doesn't exist yet
      let uniqueCode = generateUniqueCode();
      let attempts = 0;
      const maxAttempts = 3;

      // Check if code already exists
      while (attempts < maxAttempts) {
        const { data: existingCode } = await supabase.inviteLinks
          .select()
          .eq("code", uniqueCode)
          .single();

        if (!existingCode) break; // Code is unique

        // Code exists, generate a new one
        uniqueCode = generateUniqueCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error(
          "Failed to generate a unique invite code after multiple attempts",
        );
      }

      // Store the invite link in the database
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase.inviteLinks
        .insert({
          code: uniqueCode,
          user_id: user.id,
          created_at: timestamp,
          used: false,
        })
        .select();

      if (error) {
        console.error("Error creating invite link:", error);
        throw new Error("Failed to generate invite link: " + error.message);
      }

      // Return the full invite URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/create-account?invite=${uniqueCode}`;
    } catch (error: any) {
      console.error("Error in generateInviteLink:", error);
      throw error;
    }
  },

  /**
   * Process an invite link and connect users with improved error handling
   * and transaction-like behavior
   */
  processInviteLink: async (
    inviteCode: string,
    newUserId: string,
  ): Promise<boolean> => {
    try {
      if (!inviteCode || !newUserId) {
        console.error("Invalid parameters: inviteCode or newUserId is missing");
        return false;
      }

      // Find the invite link in the database
      const { data: inviteData, error: inviteError } =
        await supabase.inviteLinks.select().eq("code", inviteCode).single();

      if (inviteError) {
        console.error("Error finding invite link:", inviteError);
        return false;
      }

      if (!inviteData) {
        console.error("Invite link not found for code:", inviteCode);
        return false;
      }

      // Check if the invite has already been used
      if (inviteData.used) {
        console.warn("Invite link has already been used:", inviteCode);
        return false;
      }

      const timestamp = new Date().toISOString();

      // Create a connection between the users
      const { error: connectionError } = await supabase.connections.insert({
        user_id: inviteData.user_id,
        friend_id: newUserId,
        status: "connected",
        created_at: timestamp,
      });

      if (connectionError) {
        console.error("Error creating connection:", connectionError);
        return false;
      }

      // Mark the invite as used
      const { error: updateError } = await supabase.inviteLinks
        .update({
          used: true,
          used_at: timestamp,
          used_by_user_id: newUserId,
        })
        .eq("id", inviteData.id);

      if (updateError) {
        console.error("Error updating invite link status:", updateError);
        // Connection was created but invite status update failed
        // This is not ideal but still a successful connection
      }

      return true;
    } catch (error) {
      console.error("Error processing invite link:", error);
      return false;
    }
  },
};
