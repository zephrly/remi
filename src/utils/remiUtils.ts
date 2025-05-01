import { supabase } from "../lib/supabase";
import { Contact } from "../types/user";

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

/**
 * Checks if the Remi user exists in the database and creates it if it doesn't
 */
export const ensureRemiExists = async (): Promise<boolean> => {
  try {
    // Check if Remi exists in the system users table
    const { data: existingRemiUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", remiData.email)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking for Remi user:", userCheckError);
      return false;
    }

    // If Remi doesn't exist, create the system user
    if (!existingRemiUser) {
      const { data: newRemiUser, error: createUserError } = await supabase
        .from("users")
        .insert([
          {
            email: remiData.email,
            name: remiData.name,
            // avatar_url field doesn't exist in users table
            // avatar_url: remiData.avatar,
            is_system_user: true,
          },
        ])
        .select("id")
        .single();

      if (createUserError) {
        console.error("Error creating Remi system user:", createUserError);
        return false;
      }

      // Create profile for Remi
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: newRemiUser.id,
          full_name: remiData.name,
          avatar_url: remiData.avatar,
          bio: remiData.bio,
        },
      ]);

      if (profileError) {
        console.error("Error creating Remi profile:", profileError);
        return false;
      }

      console.log("Successfully created Remi system user");
    }

    return true;
  } catch (error) {
    console.error("Error in ensureRemiExists:", error);
    return false;
  }
};
