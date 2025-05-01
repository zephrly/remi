import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, useRoutes } from "react-router-dom";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import routes from "tempo-routes";
import { TempoDevtools } from "tempo-devtools";
import { ensureRemiExists } from "./utils/remiUtils";

TempoDevtools.init();

// Initialize the app
ensureRemiExists().catch(console.error);

// Create a wrapper component to handle Tempo routes
function AppWithTempoRoutes() {
  // Use the tempo routes if in Tempo environment
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <>
      {tempoRoutes}
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithTempoRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
