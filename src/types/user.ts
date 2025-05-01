export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  dateOfBirth?: string;
  // Address information
  address?: {
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Connected accounts
  connectedAccounts: {
    google?: boolean;
    facebook?: boolean;
    twitter?: boolean;
    linkedin?: boolean;
    instagram?: boolean;
    phone?: boolean;
  };
  // Privacy settings
  privacySettings?: {
    profileVisibility: "public" | "connections" | "private";
    allowContactLookup: boolean;
    allowInvites: boolean;
  };
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  source:
    | "phone"
    | "google"
    | "facebook"
    | "twitter"
    | "linkedin"
    | "instagram"
    | "reminisce";
  avatar?: string;
  hasAccount: boolean;
  connectionStatus?: "connected" | "pending" | "not_connected";
  bio?: string;
  // Shared memories
  sharedMemories?: import("./memory").Memory[];
}
