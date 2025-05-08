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
   * Generate a unique invite link for the current user
   */
  generateInviteLink: async (): Promise<string> => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be logged in to generate an invite link");
    }

    // Generate a unique code
    const uniqueCode = Math.random().toString(36).substring(2, 10);

    // Store the invite link in the database
    const { error } = await supabase.inviteLinks.insert({
      code: uniqueCode,
      user_id: user.id,
      created_at: new Date().toISOString(),
      used: false,
    });

    if (error) {
      console.error("Error creating invite link:", error);
      throw new Error("Failed to generate invite link");
    }

    // Return the full invite URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/create-account?invite=${uniqueCode}`;
  },

  /**
   * Process an invite link and connect users
   */
  processInviteLink: async (
    inviteCode: string,
    newUserId: string,
  ): Promise<boolean> => {
    try {
      // Find the invite link in the database
      const { data: inviteData, error: inviteError } =
        await supabase.inviteLinks.select().eq("code", inviteCode).single();

      if (inviteError || !inviteData) {
        console.error("Error finding invite link:", inviteError);
        return false;
      }

      // Type assertion to ensure TypeScript knows the structure
      const typedInviteData = inviteData as InviteLink;

      // Create a connection between the users
      const { error: connectionError } = await supabase.connections.insert({
        user_id: typedInviteData.user_id,
        friend_id: newUserId,
        status: "connected",
        created_at: new Date().toISOString(),
      });

      if (connectionError) {
        console.error("Error creating connection:", connectionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error processing invite link:", error);
      return false;
    }
  },
};
