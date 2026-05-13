import { useEffect, useMemo, useState } from "react";
import { AppShell, type PageKey } from "./components/AppShell";
import { TokenGate } from "./components/TokenGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { UniversityDetail } from "./pages/UniversityDetail";

function AppContent() {
  const { isAuthed } = useAuth();
  const initialRoute = parseHashRoute();
  const [activePage, setActivePage] = useState<PageKey>(() => initialRoute.page);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(() => initialRoute.universityId);

  useEffect(() => {
    function syncHashRoute() {
      const route = parseHashRoute();
      setActivePage(route.page);
      setSelectedUniversityId(route.universityId);
    }

    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  }, []);

  const page = useMemo(() => {
    if (activePage === "dashboard") return <Dashboard onOpenUniversity={(id) => navigate("universities", id)} />;
    if (activePage === "universities" && selectedUniversityId) {
      return <UniversityDetail universityId={selectedUniversityId} onBack={() => navigate("dashboard")} />;
    }
    return <PlaceholderPage page={activePage} />;
  }, [activePage, selectedUniversityId]);

  function navigate(nextPage: PageKey, universityId?: string) {
    setActivePage(nextPage);
    setSelectedUniversityId(universityId ?? null);
    window.history.replaceState(null, "", universityId ? `#${nextPage}/${universityId}` : `#${nextPage}`);
  }

  if (!isAuthed) return <TokenGate />;

  return (
    <AppShell activePage={activePage} onNavigate={navigate}>
      {page}
    </AppShell>
  );
}

function parseHashRoute(): { page: PageKey; universityId: string | null } {
  const [page = "dashboard", universityId = null] = window.location.hash.slice(1).split("/");
  const validPages: PageKey[] = ["dashboard", "universities", "professors", "labs", "programs", "papers", "review", "timeline", "sources"];
  return {
    page: validPages.includes(page as PageKey) ? (page as PageKey) : "dashboard",
    universityId,
  };
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
