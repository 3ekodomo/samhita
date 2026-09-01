import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Library, Moon, Sun, Circle, PanelLeftClose, PanelLeftOpen, Activity, Settings2, Download, Upload } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { staticLibrary } from '@/lib/static-library';
import { useReaderSettings } from '@/hooks/use-reader-settings';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type ReaderShellProps = {
  children: ReactNode;
};

type ThemeMode = 'light' | 'dark' | 'amoled';

const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'amoled'];

export function ReaderShell({ children }: ReaderShellProps) {
  const [location] = useLocation();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('ayurveda-theme');
    return stored === 'dark' || stored === 'amoled' ? stored : 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings, updateSettings, exportData, importData } = useReaderSettings();
  const [importText, setImportText] = useState('');
  const { toast } = useToast();

  const handleExport = () => {
    const dataStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ayurveda-reader-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: 'Export successful', description: 'Your data has been saved to a file.' });
  };

  const handleImport = () => {
    if (importData(importText)) {
      toast({ title: 'Import successful', description: 'Your settings and bookmarks have been updated.' });
      setImportText('');
    } else {
      toast({ title: 'Import failed', description: 'Invalid JSON data.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme !== 'light');
    document.documentElement.classList.toggle('amoled', theme === 'amoled');
    localStorage.setItem('ayurveda-theme', theme);
  }, [theme]);

  const isChapter = location.startsWith('/chapter/');
  const themeLabel = theme === 'light' ? 'Day reading' : theme === 'dark' ? 'Night reading' : 'AMOLED black';
  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
  const nextThemeLabel = nextTheme === 'light' ? 'day theme' : nextTheme === 'dark' ? 'night theme' : 'AMOLED theme';
  const archiveReady = staticLibrary.sources.length > 0 && staticLibrary.chapters.length > 0;

  return (
    <div className="paper-grain min-h-[100dvh] bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[278px] flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Reader navigation"
      >
        <div className="flex items-center justify-between px-7 pb-7 pt-8">
          <Link href="/" className="group flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-sidebar-primary/50 text-sidebar-primary transition-transform duration-300 group-hover:rotate-6">
              <BookOpen size={19} strokeWidth={1.6} />
            </span>
            <span>
              <span className="block font-display text-[25px] leading-none tracking-tight text-sidebar-foreground">Ayurveda</span>
              <span className="mt-1 block font-mono-custom text-[10px] uppercase tracking-[0.26em] text-sidebar-primary">Reader</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            aria-label="Close navigation"
            data-testid="button-close-navigation"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="mx-7 border-t border-sidebar-border" />
        <nav className="mt-8 px-4" aria-label="Primary">
          <p className="px-3 pb-3 font-mono-custom text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/45">Your reading room</p>
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors ${!isChapter ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}
            data-testid="link-library"
          >
            <Library size={17} strokeWidth={1.7} />
            <span>Library</span>
            {!isChapter && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
          </Link>
          {isChapter && (
            <div className="mt-2 flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-3 text-sm text-sidebar-primary" data-testid="status-current-reading">
              <BookOpen size={17} strokeWidth={1.7} />
              <span>Current reading</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
            </div>
          )}
        </nav>

        <div className="mt-auto px-7 pb-7">
          <div className="mb-6 rounded-md border border-sidebar-border bg-sidebar-accent/45 p-4">
            <div className="flex items-center gap-2">
              <Activity size={13} className={archiveReady ? 'text-sidebar-primary' : 'text-destructive'} />
               <span className="font-mono-custom text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">Index status</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/70">
              {archiveReady ? 'The static archive is ready.' : 'The local index is unavailable.'}
            </p>
          </div>
          <p className="font-display text-[15px] italic leading-snug text-sidebar-foreground/65">“Knowledge is the healing.”</p>
           <p className="mt-2 font-mono-custom text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/35">A personal index for study</p>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-sidebar/45 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation overlay"
          data-testid="button-navigation-overlay"
        />
      )}

      <div className="min-h-[100dvh] md:pl-[278px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/75 bg-background/90 px-5 backdrop-blur-md md:px-10">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Open navigation"
            data-testid="button-open-navigation"
          >
            <PanelLeftOpen size={19} />
          </button>
           <div className="hidden font-mono-custom text-[11px] uppercase tracking-[0.23em] text-muted-foreground md:block">
            Classical texts · careful reading
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-accent hover:text-accent"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings2 size={16} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm mb-3">Text Size</h4>
                    <Slider
                      min={0.8}
                      max={2.5}
                      step={0.1}
                      value={[settings.textSize]}
                      onValueChange={(val) => updateSettings({ textSize: val[0] })}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-3">Spacing</h4>
                    <Slider
                      min={1.2}
                      max={3.0}
                      step={0.1}
                      value={[settings.spacing]}
                      onValueChange={(val) => updateSettings({ spacing: val[0] })}
                    />
                  </div>
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-sm mb-3">Data</h4>
                    <div className="flex gap-2 mb-2">
                      <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
                        <Download size={14} className="mr-2" />
                        Export
                      </Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Textarea
                        placeholder="Paste JSON to import..."
                        className="h-20 text-xs"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={handleImport} className="w-full" disabled={!importText.trim()}>
                        <Upload size={14} className="mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
             <span className="hidden text-xs text-muted-foreground sm:inline" data-testid="text-theme-label">{themeLabel}</span>
            <button
              type="button"
               onClick={() => setTheme(nextTheme)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-accent hover:text-accent"
               aria-label={`Current theme: ${themeLabel}. Switch to ${nextThemeLabel}`}
               title={`Switch to ${nextThemeLabel}`}
              data-testid="button-toggle-theme"
            >
               {theme === 'light' ? <Moon size={16} /> : theme === 'dark' ? <Sun size={16} /> : <Circle size={15} />}
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}