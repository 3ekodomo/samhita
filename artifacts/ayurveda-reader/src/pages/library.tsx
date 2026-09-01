import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, BookMarked, Check, ChevronDown, ChevronRight, Filter, ListTree, RefreshCw, Search, Sparkles, X } from 'lucide-react';
import { Link } from 'wouter';
import { staticLibrary, type LibraryChapter as Chapter, type LibrarySection as Section, type LibrarySource as Source } from '@/lib/static-library';

function SourceMark({ source, active }: { source: Source; active: boolean }) {
  const initials = source.shortName.slice(0, 2).toUpperCase();
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border font-mono-custom text-[11px] tracking-tight transition-colors ${active ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-secondary text-primary'}`}>
      {initials}
    </span>
  );
}

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chaptersSectionRef = useRef<HTMLElement>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);

  const library = staticLibrary;
  const sources = library.sources;
  const sections = library.sections;
  const chapters = library.chapters;
  const activeSource = sources.find((source) => source.id === sourceFilter);
  const activeSection = sections.find((section) => section.id === sectionFilter);

  const filteredChapters = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return chapters.filter((chapter) => {
      const sourceMatch = sourceFilter === 'all' || chapter.sourceId === sourceFilter;
      const sectionMatch = sectionFilter === 'all' || chapter.sectionId === sectionFilter;
      const searchMatch = !normalized || [chapter.title, chapter.excerpt, chapter.language].some((value) => value.toLowerCase().includes(normalized));
      return sourceMatch && sectionMatch && searchMatch;
    });
  }, [chapters, search, sectionFilter, sourceFilter]);

  const sectionsForFilter = useMemo(
    () => sections.filter((section) => sourceFilter === 'all' || section.sourceId === sourceFilter),
    [sections, sourceFilter],
  );
  const sourceSections = useMemo(
    () => sectionsForFilter.filter((section) => section.chapterCount > 0),
    [sectionsForFilter],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearch('');
    setSourceFilter('all');
    setSectionFilter('all');
    setFiltersOpen(false);
    window.setTimeout(() => setIsRefreshing(false), 350);
  };

  const clearFilters = () => {
    setSearch('');
    setSourceFilter('all');
    setSectionFilter('all');
  };

  const chooseSource = (sourceId: string, active: boolean) => {
    setSourceFilter(active ? 'all' : sourceId);
    setSectionFilter('all');
    requestAnimationFrame(() => {
      chaptersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const chooseSection = (sectionId: string) => {
    setSectionFilter(sectionId);
    requestAnimationFrame(() => {
      chapterListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const lastUpdated = library.lastUpdated
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(library.lastUpdated))
    : 'Awaiting first index';

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-10 md:px-10 md:pt-16">
      <section className="relative overflow-hidden rounded-[18px] border border-border/80 bg-card px-6 py-10 shadow-sm md:px-12 md:py-14">
        <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[34px] border-accent/15" />
        <div className="pointer-events-none absolute -right-2 -top-16 h-48 w-48 rounded-full border border-accent/25" />
        <div className="relative max-w-3xl">
          <div className="fade-up flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="font-mono-custom text-[11px] uppercase tracking-[0.24em] text-muted-foreground">The reading room</span>
          </div>
          <h1 className="fade-up fade-up-delay-1 mt-5 max-w-2xl font-display text-4xl leading-[0.98] tracking-[-0.035em] text-primary md:text-6xl">
            A doorway into <em className="text-accent">living</em> knowledge.
          </h1>
          <p className="fade-up fade-up-delay-2 mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground md:text-base">
            Five public collections, gathered in one unhurried place. Find a chapter, settle in, and let the text set the pace.
          </p>
          <div className="fade-up fade-up-delay-3 mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl text-primary">{library.totalChapters}</span>
              <span className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-muted-foreground">chapters indexed</span>
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl text-primary">{library.availableSources}</span>
              <span className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-muted-foreground">sources available</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="sources-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono-custom text-[11px] uppercase tracking-[0.24em] text-accent">01 · Samhitas</p>
            <h2 id="sources-heading" className="mt-2 font-display text-3xl leading-none text-primary md:text-4xl">Choose a Samhita</h2>
          </div>
          <span className="hidden font-mono-custom text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:block">{sources.length || 0} Samhitas in view</span>
        </div>
        {sources.length ? (
          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => {
              const active = sourceFilter === source.id;
              return (
                <button
                  type="button"
                  key={source.id}
                   onClick={() => chooseSource(source.id, active)}
                  className={`group relative flex min-h-[134px] items-start gap-4 rounded-lg border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/60'}`}
                  data-testid={`button-source-${source.id}`}
                >
                  <SourceMark source={source} active={active} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-[20px] leading-none text-primary">{source.shortName}</span>
                      {source.status !== 'ready' && <span className="rounded-full bg-secondary px-2 py-0.5 font-mono-custom text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{source.status}</span>}
                    </span>
                    <span className="mt-2 block truncate text-sm font-medium text-foreground">{source.name}</span>
                    <span className="mt-1 block font-mono-custom text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{source.chapterCount} chapters</span>
                  </span>
                  <span className={`absolute right-4 top-4 text-accent transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><Check size={15} /></span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-dashed border-border p-10 text-center" data-testid="status-sources-empty">
            <BookMarked className="mx-auto text-muted-foreground" size={25} strokeWidth={1.4} />
              <p className="mt-3 font-display text-xl text-primary">No Samhitas have arrived yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try refreshing the index when you are ready.</p>
          </div>
        )}
      </section>

       <section ref={chaptersSectionRef} id="chapter-index" className="mt-16 scroll-mt-24" aria-labelledby="chapters-heading">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
           <p className="font-mono-custom text-[11px] uppercase tracking-[0.24em] text-accent">
             {!activeSource ? '02 · Reading path' : sectionFilter === 'all' ? '02 · Sthana' : '03 · Chapters'}
           </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
             <h2 id="chapters-heading" className="font-display text-3xl leading-none text-primary md:text-4xl">
               {!activeSource ? 'Select a Samhita to begin' : sectionFilter === 'all' ? 'Choose a Sthana' : `Chapters in ${activeSection?.name ?? 'this Sthana'}`}
             </h2>
              {activeSource && <span className="rounded-full bg-accent/15 px-3 py-1 font-mono-custom text-[10px] uppercase tracking-[0.14em] text-primary">{activeSource.shortName}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono-custom text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:inline" data-testid="text-last-updated">Updated {lastUpdated}</span>
            <button
              type="button"
              onClick={handleRefresh}
               disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60"
              data-testid="button-refresh-library"
            >
               <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
               {isRefreshing ? 'Reloading' : 'Reload local index'}
            </button>
          </div>
        </div>

        {activeSource && sectionFilter === 'all' && sourceSections.length > 0 && (
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3" aria-label={`${activeSource.name} Sthanas`} data-testid="sthana-chooser">
            {sourceSections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => chooseSection(section.id)}
                className="group flex min-h-[128px] flex-col items-start rounded-lg border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                data-testid={`button-sthana-${section.id}`}
              >
                <span className="flex w-full items-center justify-between gap-3 font-mono-custom text-[11px] uppercase tracking-[0.16em] text-accent">
                  <span>Sthana {String(index + 1).padStart(2, '0')}</span>
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-4 font-display text-2xl leading-tight text-primary transition-colors group-hover:text-accent">{section.name}</span>
                <span className="mt-auto pt-3 font-mono-custom text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{section.chapterCount} chapters</span>
              </button>
            ))}
          </div>
        )}

        {!activeSource && (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center" data-testid="status-select-samhita">
            <ListTree className="mx-auto text-accent" size={26} strokeWidth={1.4} />
            <p className="mt-3 font-display text-xl text-primary">Choose a Samhita above.</p>
            <p className="mt-1 text-sm text-muted-foreground">Its Sthanas will appear here before the chapters.</p>
          </div>
        )}

        {activeSource && sectionFilter === 'all' && sourceSections.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center" data-testid="status-no-sthana">
            <ListTree className="mx-auto text-accent" size={26} strokeWidth={1.4} />
            <p className="mt-3 font-display text-xl text-primary">No Sthanas were indexed for this source.</p>
            <p className="mt-1 text-sm text-muted-foreground">Refresh the index to try the source menu again.</p>
          </div>
        )}

        {activeSource && sectionFilter !== 'all' && (
        <div ref={chapterListRef} className="scroll-mt-24">
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search chapters</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject, or language"
              className="h-12 w-full rounded-md border border-border bg-card pl-11 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20"
              data-testid="input-search-chapters"
            />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm transition-colors md:min-w-[132px] ${filtersOpen || sectionFilter !== 'all' ? 'border-accent bg-accent/10 text-primary' : 'border-border bg-card text-foreground hover:border-accent'}`}
            aria-expanded={filtersOpen}
            data-testid="button-toggle-filters"
          >
            <Filter size={15} /> Filters {sectionFilter !== 'all' && <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">1</span>} <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        </div>
        )}

        {filtersOpen && (
          <div className="mt-3 grid gap-3 rounded-md border border-border bg-secondary/50 p-4 sm:grid-cols-2" data-testid="panel-filters">
            <label className="text-xs font-medium text-muted-foreground">
               Samhita
              <select value={sourceFilter} onChange={(event) => { setSourceFilter(event.target.value); setSectionFilter('all'); }} className="mt-2 h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-accent" data-testid="select-source-filter">
                 <option value="all">All Samhitas</option>
                {sources.map((source) => <option key={source.id} value={source.id}>{source.shortName} · {source.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground">
               Sthana
              <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="mt-2 h-10 w-full rounded border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-accent" data-testid="select-section-filter">
                 <option value="all">All Sthanas</option>
                {sectionsForFilter.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
              </select>
            </label>
          </div>
        )}

        {activeSource && sectionFilter !== 'all' && filteredChapters.length ? (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between font-mono-custom text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span data-testid="text-results-count">{filteredChapters.length} {filteredChapters.length === 1 ? 'chapter' : 'chapters'} found</span>
              {(search || sourceFilter !== 'all' || sectionFilter !== 'all') && <button type="button" onClick={clearFilters} className="text-accent hover:underline" data-testid="button-clear-filters">Clear filters</button>}
            </div>
            {filteredChapters.map((chapter, index) => <ChapterRow key={chapter.id} chapter={chapter} index={index} sources={sources} sections={sections} />)}
          </div>
        ) : activeSource && sectionFilter !== 'all' ? (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card/40 p-12 text-center" data-testid="status-chapters-empty">
            <Sparkles className="mx-auto text-accent" size={25} strokeWidth={1.4} />
            <p className="mt-3 font-display text-xl text-primary">Nothing matches this search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a broader phrase or return to the full index.</p>
            <button type="button" onClick={clearFilters} className="mt-5 text-xs font-semibold text-accent hover:underline" data-testid="button-reset-empty-search">Show all chapters</button>
          </div>
        ) : null}
        {activeSource && sectionFilter !== 'all' && (
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => setSectionFilter('all')} className="text-xs font-semibold text-accent hover:underline" data-testid="button-back-to-sthanas">Back to Sthanas</button>
          </div>
        )}
      </section>
    </div>
  );
}

function ChapterRow({ chapter, index, sources, sections }: { chapter: Chapter; index: number; sources: Source[]; sections: Section[] }) {
  const source = sources.find((item) => item.id === chapter.sourceId);
  const section = sections.find((item) => item.id === chapter.sectionId);
  return (
    <Link
      href={`/chapter/${chapter.id}`}
      className="group block rounded-lg border border-border/80 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-6"
      data-testid={`link-chapter-${chapter.id}`}
    >
      <div className="flex items-start gap-4">
        <span className="hidden w-8 shrink-0 pt-1 text-right font-mono-custom text-[11px] text-muted-foreground/60 sm:block">{String(index + 1).padStart(2, '0')}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono-custom text-[11px] uppercase tracking-[0.16em] text-accent">{source?.shortName ?? 'Source'}</span>
            {section && <><span className="h-1 w-1 rounded-full bg-border" /><span className="font-mono-custom text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{section.name}</span></>}
            <span className="ml-auto font-mono-custom text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Chapter {chapter.chapterNumber}</span>
          </div>
          <h3 className="mt-3 font-display text-xl leading-tight text-primary transition-colors group-hover:text-accent md:text-2xl">{chapter.title}</h3>
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{chapter.excerpt || 'A chapter awaiting its first reading.'}</p>
        </div>
        <ArrowUpRight className="mt-1 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" size={19} />
      </div>
    </Link>
  );
}