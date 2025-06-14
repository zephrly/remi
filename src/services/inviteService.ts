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

      // Check if code already exists using standard supabase client
      while (attempts < maxAttempts) {
        const { data: existingCode, error: checkError } = await supabase
          .from("invite_links")
          .select("code")
          .eq("code", uniqueCode)
          .single();

        if (checkError && checkError.code === "PGRST116") {
          // PGRST116 means no rows returned, which means code is unique
          break;
        }

        if (checkError) {
          console.error("Error checking code uniqueness:", checkError);
          // Continue with the code anyway if there's an error checking
          break;
        }

        if (existingCode) {
          // Code exists, generate a new one
          uniqueCode = generateUniqueCode();
          attempts++;
        } else {
          break; // Code is unique
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error(
          "Failed to generate a unique invite code after multiple attempts",
        );
      }

      // Store the invite link in the database using standard supabase client
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("invite_links")
        .insert({
          code: uniqueCode,
          user_id: user.id,
          created_at: timestamp,
          used: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating invite link:", error);
        throw new Error("Failed to generate invite link: " + error.message);
      }

      console.log("Successfully created invite link:", data);

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
   * and bidirectional connection creation
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

      // Find the invite link in the database using standard supabase client
      const { data: inviteData, error: inviteError } = await supabase
        .from("invite_links")
        .select("*")
        .eq("code", inviteCode)
        .single();

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

      console.log("Creating bidirectional connection between:", {
        inviter: inviteData.user_id,
        newUser: newUserId,
      });

      // Create bidirectional connections for easier querying
      const connectionsToCreate = [
        {
          user_id: inviteData.user_id,
          friend_id: newUserId,
          status: "connected",
          created_at: timestamp,
        },
        {
          user_id: newUserId,
          friend_id: inviteData.user_id,
          status: "connected",
          created_at: timestamp,
        },
      ];

      // Insert both connections
      const { error: connectionError } = await supabase
        .from("connections")
        .insert(connectionsToCreate);

      if (connectionError) {
        console.error("Error creating connections:", connectionError);
        return false;
      }

      console.log("Successfully created bidirectional connections");

      // Update the new user's profile to track who invited them
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          invited_by_user_id: inviteData.user_id,
        })
        .eq("id", newUserId);

      if (profileUpdateError) {
        console.error(
          "Error updating profile with inviter info:",
          profileUpdateError,
        );
        // Continue even if this fails - the connection is still created
      }

      // Mark the invite as used using standard supabase client
      const { error: updateError } = await supabase
        .from("invite_links")
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

      console.log("Successfully processed invite link and created connections");
      return true;
    } catch (error) {
      console.error("Error processing invite link:", error);
      return false;
    }
  },
};
