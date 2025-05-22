/**
 * Purpose: Component to handle Tempo routes
 * Description: Renders Tempo routes alongside the main App component
 * Dependencies: react, react-router-dom, tempo-routes, App
 * Used by: main.tsx
 */
import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import App from "./App";

// Define the component in a separate file to avoid Fast Refresh issues
export default function AppWithRoutes() {
  // Use the useRoutes hook conditionally inside a component
  const tempoRoutes = useRoutes(routes);

  return (
    <>
      {tempoRoutes}
      <App />
    </>
  );
}
