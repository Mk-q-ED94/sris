import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell, type PageKey } from "./components/AppShell";
import { GlobalSearch } from "./components/GlobalSearch";
import { TokenGate } from "./components/TokenGate";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Capture } from "./pages/Capture";
import { Dashboard } from "./pages/Dashboard";
import { Labs } from "./pages/Labs";
import { Papers } from "./pages/Papers";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Professors } from "./pages/Professors";
import { Programs } from "./pages/Programs";
import { Review } from "./pages/Review";
import { ResourceDetail } from "./pages/ResourceDetail";
import { Sources } from "./pages/Sources";
import { Timeline } from "./pages/Timeline";
import { Universities } from "./pages/Universities";
import { UniversityDetail } from "./pages/UniversityDetail";
import { Conflicts } from "./pages/Conflicts";

const VALID_PAGES: PageKey[] = ["dashboard", "universities", "professors", "labs", "programs", "papers", "review", "timeline", "sources", "conflicts"];

interface HashRoute {
  page: PageKey | "capture";
  universityId: string | null;
  resourceId: string | null;
  capturePrefill: { url: string; title: string; notes: string; selection: string } | null;
}

function parseHashRoute(): HashRoute {
  const raw = window.location.hash.slice(1);
  if (raw.startsWith("capture")) {
    const queryIndex = raw.indexOf("?");
    const search = queryIndex >= 0 ? raw.slice(queryIndex + 1) : "";
    const params = new URLSearchParams(search);
    return {
      page: "capture",
      universityId: null,
      resourceId: null,
      capturePrefill: {
        url: params.get("url") ?? "",
        title: params.get("title") ?? "",
        notes: params.get("text") ?? "",
        selection: params.get("text") ?? "",
      },
    };
  }
  const [page = "dashboard", secondSegment = null] = raw.split("/");
  // Special case: #/resources/:id → page=universities, resourceId=secondSegment
  if (page === "resources" && secondSegment) {
    return {
      page: "universities" as PageKey,
      universityId: null,
      resourceId: secondSegment,
      capturePrefill: null,
    };
  }
  return {
    page: VALID_PAGES.includes(page as PageKey) ? (page as PageKey) : "dashboard",
    universityId: secondSegment,
    resourceId: null,
    capturePrefill: null,
  };
}

function AppContent() {
  const { isAuthed } = useAuth();
  const initial = parseHashRoute();
  const [route, setRoute] = useState<HashRoute>(initial);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function sync() {
      setRoute(parseHashRoute());
    }
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = useCallback((nextPage: PageKey, universityId?: string) => {
    setRoute({
      page: nextPage,
      universityId: universityId ?? null,
      resourceId: null,
      capturePrefill: null,
    });
    window.history.replaceState(null, "", universityId ? `#${nextPage}/${universityId}` : `#${nextPage}`);
  }, []);

  const openResource = useCallback((id: string) => {
    setRoute({ page: "universities", universityId: null, resourceId: id, capturePrefill: null });
    window.history.replaceState(null, "", `#resources/${id}`);
  }, []);

  const closeCapture = useCallback(() => {
    setRoute({ page: "dashboard", universityId: null, resourceId: null, capturePrefill: null });
    window.history.replaceState(null, "", "#dashboard");
  }, []);

  const page = useMemo(() => {
    if (route.page === "capture" && route.capturePrefill) {
      return <Capture prefill={route.capturePrefill} onClose={closeCapture} />;
    }
    if (route.resourceId) {
      return <ResourceDetail resourceId={route.resourceId} onBack={() => navigate("dashboard")} onNavigate={navigate} />;
    }
    if (route.page === "dashboard") return <Dashboard onOpenUniversity={(id) => navigate("universities", id)} onOpenResource={openResource} />;
    if (route.page === "universities" && route.universityId) {
      return <UniversityDetail universityId={route.universityId} onBack={() => navigate("universities")} onOpenResource={openResource} />;
    }
    if (route.page === "universities") return <Universities onNavigate={navigate} />;
    if (route.page === "papers") return <Papers onNavigate={navigate} />;
    if (route.page === "timeline") return <Timeline />;
    if (route.page === "sources") return <Sources />;
    if (route.page === "conflicts") return <Conflicts />;
    if (route.page === "professors") return <Professors onNavigate={navigate} />;
    if (route.page === "labs") return <Labs onNavigate={navigate} />;
    if (route.page === "programs") return <Programs />;
    if (route.page === "review") return <Review />;
    return <PlaceholderPage page={route.page as PageKey} />;
  }, [route, navigate, closeCapture]);

  if (!isAuthed) return <TokenGate />;

  const activePage: PageKey = route.page === "capture" ? "dashboard" : (route.page as PageKey);

  return (
    <>
      <AppShell
        activePage={activePage}
        onNavigate={(next) => navigate(next)}
        onOpenSearch={() => setSearchOpen(true)}
      >
        {page}
      </AppShell>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} onOpenResource={openResource} />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
