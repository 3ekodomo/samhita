import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ReaderShell } from '@/components/reader-shell';
import LibraryPage from '@/pages/library';
import ChapterPage from '@/pages/chapter';
import BookmarksPage from '@/pages/bookmarks';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <ReaderShell>
        <Switch>
          <Route path="/" component={LibraryPage} />
          <Route path="/chapter/:chapterId" component={ChapterPage} />
          <Route path="/bookmarks" component={BookmarksPage} />
          <Route component={NotFound} />
        </Switch>
      </ReaderShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
