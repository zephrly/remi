import { Contact } from "../types/user";

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
