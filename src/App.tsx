import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import WelcomeScreen from "./components/WelcomeScreen";
import LogIn from "./components/LogIn";
import CreateAccount from "./components/CreateAccount";
import Onboarding from "./components/Onboarding";
import MemoryDetails from "./components/MemoryDetails";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="/memories/:memoryId" element={<MemoryDetails />} />
        {/* Add this to prevent 404s when tempo routes are accessed directly */}
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route path="/tempobook/*" element={<></>} />
        )}
      </Routes>
    </Suspense>
  );
}

export default App;
