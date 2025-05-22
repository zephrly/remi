/**
 * Purpose: Entry point of the React application
 * Description: Initializes React, sets up routing, and renders the main App component
 * Dependencies: react, react-dom, react-router-dom, App, AppWithRoutes, tempo-devtools
 * Used by: index.html
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Import the AppWithRoutes component from a separate file
import AppWithRoutes from "./AppWithRoutes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
