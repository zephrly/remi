import { ensureRemiExists } from "./remiUtils";

/**
 * Initialize the application
 * This function should be called when the app starts
 */
export const initializeApp = async (): Promise<void> => {
  try {
    // Ensure Remi system user exists
    await ensureRemiExists();

    // Add other initialization tasks here as needed

    console.log("App initialization complete");
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
};
