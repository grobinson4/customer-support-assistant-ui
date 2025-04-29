import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";

const msalInstance = new PublicClientApplication(msalConfig);

function AppWrapper() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeMsal() {
      await msalInstance.initialize();
      setIsInitialized(true);
    }
    initializeMsal();
  }, []);

  if (!isInitialized) {
    return <div>Loading authentication...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </MsalProvider>
  );
}

export default AppWrapper;
