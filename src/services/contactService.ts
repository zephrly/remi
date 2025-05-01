import { Contact } from "../types/user";
import { supabase } from "../lib/supabase";

// Mock data for contacts
const mockPhoneContacts: Contact[] = [
  {
    id: "p1",
    name: "Alex Thompson",
    phone: "+1234567890",
    source: "phone",
    hasAccount: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    connectionStatus: "not_connected",
  },
  {
    id: "p2",
    name: "Jamie Rodriguez",
    phone: "+1987654321",
    source: "phone",
    hasAccount: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamie",
  },
  {
    id: "p3",
    name: "Taylor Kim",
    phone: "+1555123456",
    source: "phone",
    hasAccount: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
    connectionStatus: "connected",
  },
  {
    id: "p4",
    name: "Jordan Smith",
    phone: "+1555789012",
    source: "phone",
    hasAccount: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
  },
];

const mockGoogleContacts: Contact[] = [
  {
    id: "g1",
    name: "Casey Morgan",
    email: "casey@example.com",
    source: "google",
    hasAccount: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
    connectionStatus: "pending",
  },
  {
    id: "g2",
    name: "Riley Johnson",
    email: "riley@example.com",
    source: "google",
    hasAccount: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
  },
];

const mockFacebookContacts: Contact[] = [
  {
    id: "f1",
    name: "Quinn Davis",
    email: "quinn@example.com",
    source: "facebook",
    hasAccount: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quinn",
    connectionStatus: "not_connected",
  },
  {
    id: "f2",
    name: "Avery Wilson",
    email: "avery@example.com",
    source: "facebook",
    hasAccount: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=avery",
  },
];

// Service functions
// Remi default friend data
const remiData: Contact = {
  id: "remi-default-friend",
  name: "Remi",
  email: "remi@reminisce.app",
  source: "reminisce",
  avatar: "/remi-logo-purple.png",
  hasAccount: true,
  connectionStatus: "connected",
  bio: "Hi there! I'm Remi, your guide to Reminisce. I'll help you navigate the app and show you how to connect with old friends. Feel free to explore our shared memories or message me if you have any questions!",
};

export const contactService = {
  /**
   * Get contacts from phone (mock implementation)
   */
  getPhoneContacts: async (): Promise<Contact[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPhoneContacts), 800);
    });
  },

  /**
   * Get contacts from Google (mock implementation)
   */
  getGoogleContacts: async (): Promise<Contact[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockGoogleContacts), 1000);
    });
  },

  /**
   * Get contacts from Facebook (mock implementation)
   */
  getFacebookContacts: async (): Promise<Contact[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockFacebookContacts), 1200);
    });
  },

  /**
   * Connect to a service (mock implementation)
   */
  connectService: async (
    service: "phone" | "google" | "facebook" | "twitter" | "linkedin",
  ): Promise<boolean> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1500);
    });
  },

  /**
   * Disconnect from a service (mock implementation)
   */
  disconnectService: async (
    service: "phone" | "google" | "facebook" | "twitter" | "linkedin",
  ): Promise<boolean> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  /**
   * Get all contacts from all connected services
   */
  /**
   * Get contacts from Instagram (mock implementation)
   */
  getInstagramContacts: async (): Promise<Contact[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1200);
    });
  },

  /**
   * Get contacts from LinkedIn (mock implementation)
   */
  getLinkedInContacts: async (): Promise<Contact[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1200);
    });
  },

  /**
   * Add Remi as a default friend for a new user
   */
  addRemiDefaultFriend: async (userId: string): Promise<boolean> => {
    try {
      // Check if Remi already exists as a contact for this user
      const { data: existingRemi, error: checkError } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", userId)
        .eq("name", "Remi")
        .single();

      // If Remi already exists for this user, return true
      if (existingRemi) {
        return true;
      }

      // Get Remi's system user ID
      const { data: remiUser, error: remiUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", remiData.email)
        .single();

      if (remiUserError) {
        console.error("Error finding Remi system user:", remiUserError);
        return false;
      }

      const remiUserId = remiUser?.id || remiData.id;

      // Create Remi contact for the user
      const { error } = await supabase.from("contacts").insert([
        {
          name: remiData.name,
          email: remiData.email,
          avatar: remiData.avatar,
          source: remiData.source,
          has_account: remiData.hasAccount,
          connection_status: remiData.connectionStatus,
          user_id: userId,
          contact_user_id: remiUserId, // Link to the actual Remi user
        },
      ]);

      if (error) {
        console.error("Error adding Remi as default friend:", error);
        return false;
      }

      // Create a connection record
      const { error: connectionError } = await supabase
        .from("connections")
        .insert([
          {
            user_id: userId,
            friend_id: remiUserId,
            status: "connected",
            first_met_context: "Remi is your guide to Reminisce!",
          },
        ]);

      if (connectionError) {
        console.error("Error creating connection with Remi:", connectionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in addRemiDefaultFriend:", error);
      return false;
    }
  },

  getAllContacts: async (): Promise<Contact[]> => {
    // In a real implementation, we would check which services are connected
    // and only fetch from those. For this mock, we'll return all.
    const [
      phoneContacts,
      googleContacts,
      facebookContacts,
      instagramContacts,
      linkedInContacts,
    ] = await Promise.all([
      contactService.getPhoneContacts(),
      contactService.getGoogleContacts(),
      contactService.getFacebookContacts(),
      contactService.getInstagramContacts(),
      contactService.getLinkedInContacts(),
    ]);

    return [
      ...phoneContacts,
      ...googleContacts,
      ...facebookContacts,
      ...instagramContacts,
      ...linkedInContacts,
    ];
  },
};
