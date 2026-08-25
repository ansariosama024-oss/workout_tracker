import { Toaster } from "react-hot-toast";

import { FullScreenLoader } from "./components/common/FullScreenLoader";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { AppRoutes } from "./routes/AppRoutes";

/**
 * Renders a full-screen loader while AuthContext initializes (checking
 * for a stored session) and the app routes/toaster once that resolves.
 * Split out from App so it can call useAuth(), which requires being
 * inside AuthProvider.
 */
function AppShell() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "!bg-surface !text-text-primary !border !border-border",
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
