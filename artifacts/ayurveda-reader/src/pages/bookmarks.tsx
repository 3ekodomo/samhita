import { Link } from 'wouter';
import { Bookmark, Highlighter, BookOpen, ArrowRight } from 'lucide-react';
import { useReaderSettings } from '@/hooks/use-reader-settings';
import { staticLibrary } from '@/lib/static-library';

export default function BookmarksPage() {
  const { chapterBookmarks, bookmarks, highlights } = useReaderSettings();

  const renderChapterLink = (chapterId: string, label: string, icon: React.ReactNode) => {
    const chapter = staticLibrary.chapters.find((c) => c.id === chapterId);
    if (!chapter) return null;
    const source = staticLibrary.sources.find((s) => s.id === chapter.sourceId);

    return (
      <Link key={`${chapterId}-${label}`} href={`/chapter/${chapter.id}`} className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-accent hover:shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
            {icon}
          </div>
          <div>
            <p className="font-display text-lg text-primary">{chapter.title}</p>
            <p className="text-sm text-muted-foreground">{source?.shortName ?? 'Unknown Source'}</p>
            {label && <p className="mt-1 text-xs text-muted-foreground/70">{label}</p>}
          </div>
        </div>
        <ArrowRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </Link>
    );
  };

  const hasItems = (chapterBookmarks && chapterBookmarks.length > 0) || bookmarks.length > 0 || highlights.length > 0;

  return (
    <div className="mx-auto max-w-[1050px] px-5 pb-24 pt-10 md:px-10 md:pt-16">
      <header className="mb-12 border-b border-border pb-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
            <Bookmark size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-primary">Bookmarks & Highlights</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your saved chapters, shlokas, and highlights.</p>
          </div>
        </div>
      </header>

      {!hasItems ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <BookOpen className="mx-auto text-muted-foreground/50" size={32} strokeWidth={1.5} />
          <h2 className="mt-4 font-display text-xl text-primary">No saved items yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your bookmarks and highlights will appear here.</p>
          <Link href="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {chapterBookmarks && chapterBookmarks.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-primary">
                <BookOpen size={18} className="text-accent" />
                Bookmarked Chapters
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {chapterBookmarks.map((chapterId) => renderChapterLink(chapterId, '', <BookOpen size={18} />))}
              </div>
            </section>
          )}

          {bookmarks.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-primary">
                <Bookmark size={18} className="text-accent" />
                Bookmarked Shlokas
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((b, i) => renderChapterLink(b.chapterId, `Block ${b.blockIndex + 1}`, <Bookmark size={18} />))}
              </div>
            </section>
          )}

          {highlights.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-primary">
                <Highlighter size={18} className="text-accent" />
                Highlights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((h, i) => renderChapterLink(h.chapterId, `Block ${h.blockIndex + 1}`, <Highlighter size={18} />))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
