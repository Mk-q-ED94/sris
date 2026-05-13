import { useMemo, useState } from "react";
import { AppShell, type PageKey } from "./components/AppShell";
import { TokenGate } from "./components/TokenGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function AppContent() {
  const { isAuthed } = useAuth();
  const [activePage, setActivePage] = useState<PageKey>(() => {
    const hash = window.location.hash.slice(1) as PageKey;
    return hash || "dashboard";
  });

  const page = useMemo(() => {
    if (activePage === "dashboard") return <Dashboard />;
    return <PlaceholderPage page={activePage} />;
  }, [activePage]);

  function navigate(nextPage: PageKey) {
    setActivePage(nextPage);
    window.history.replaceState(null, "", `#${nextPage}`);
  }

  if (!isAuthed) return <TokenGate />;

  return (
    <AppShell activePage={activePage} onNavigate={navigate}>
      {page}
    </AppShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
