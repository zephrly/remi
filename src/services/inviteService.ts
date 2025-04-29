import { Contact } from "../types/user";

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
};
