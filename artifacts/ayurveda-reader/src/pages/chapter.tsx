import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, CircleAlert, LoaderCircle, Bookmark, Highlighter, Play, Square } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getStaticChapterContent, staticLibrary, type LibraryChapter as Chapter, type LibraryChapterContent } from '@/lib/static-library';
import { useReaderSettings } from '@/hooks/use-reader-settings';

function ReadableContent({ content, chapterId }: { content: string, chapterId: string }) {
  const blocks = useMemo(() => content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean), [content]);
  const { settings, toggleBookmark, isBookmarked, toggleHighlight, isHighlighted, toggleChapterBookmark, isChapterBookmarked } = useReaderSettings();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [playingChapter, setPlayingChapter] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayChapter = () => {
    window.speechSynthesis.cancel();
    if (playingChapter) {
      setPlayingChapter(false);
      return;
    }
    const fullText = blocks.join(' ... '); // Add pause between blocks
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'hi-IN'; // Using Hindi as fallback for Sanskrit TTS
    utterance.onend = () => setPlayingChapter(false);
    utterance.onerror = () => setPlayingChapter(false);
    setPlayingChapter(true);
    setPlayingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = (text: string, index: number) => {
    window.speechSynthesis.cancel();
    if (playingIndex === index) {
      setPlayingIndex(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Using Hindi as fallback for Sanskrit TTS
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    setPlayingIndex(index);
    setPlayingChapter(false);
    window.speechSynthesis.speak(utterance);
  };

  const isChapBookmarked = isChapterBookmarked(chapterId);

  return (
    <div
      className="font-display text-foreground/90"
      style={{
        fontSize: `clamp(${20 * settings.textSize}px, ${4 * settings.textSize}vw, ${28 * settings.textSize}px)`,
        lineHeight: settings.spacing,
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => toggleChapterBookmark(chapterId)}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${isChapBookmarked ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
        >
          <Bookmark size={16} className={isChapBookmarked ? 'fill-current' : ''} />
          Bookmark Chapter
        </button>
        <button
          type="button"
          onClick={handlePlayChapter}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${playingChapter ? 'bg-green-500 text-white border-green-500' : 'bg-background text-muted-foreground border-border hover:bg-muted'}`}
        >
          {playingChapter ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
          Play Chapter
        </button>
      </div>
      <div className="flex flex-col gap-7" style={{ gap: `${1.75 * settings.spacing}rem` }}>
        {blocks.map((block, index) => {
          const bookmarked = isBookmarked(chapterId, index);
          const highlighted = isHighlighted(chapterId, index);
          return (
            <div key={index} className="group relative flex flex-col gap-3">
              <p className={`whitespace-pre-line text-[inherit] leading-[inherit] rounded-md transition-colors ${highlighted ? 'bg-yellow-500/20 px-2 -mx-2' : ''}`}>{block}</p>
              {!settings.hideShlokaControls && (
                <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(chapterId, index)}
                    className={`rounded-full p-2 transition-colors ${bookmarked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    aria-label="Toggle Bookmark"
                    title="Bookmark"
                  >
                    <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleHighlight(chapterId, index)}
                    className={`rounded-full p-2 transition-colors ${highlighted ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    aria-label="Toggle Highlight"
                    title="Highlight"
                  >
                    <Highlighter size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlay(block, index)}
                    className={`rounded-full p-2 transition-colors ${playingIndex === index ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    aria-label={playingIndex === index ? "Stop reading" : "Read aloud"}
                    title={playingIndex === index ? "Stop" : "Play"}
                  >
                    {playingIndex === index ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ChapterPage() {
  const params = useParams<{ chapterId?: string }>();
  const chapterId = params.chapterId ?? '';
  const library = staticLibrary;
  const chapter = library.chapters.find((item) => item.id === chapterId);
  const [content, setContent] = useState<LibraryChapterContent | undefined>();
  const [loading, setLoading] = useState(Boolean(chapterId));

  useEffect(() => {
    let cancelled = false;
    setContent(undefined);
    setLoading(Boolean(chapterId));
    if (!chapterId) return;
    getStaticChapterContent(chapterId).then((result) => {
      if (!cancelled) {
        setContent(result);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setContent(undefined);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [chapterId]);
  const allChapters = library.chapters;
  const currentIndex = chapter ? allChapters.findIndex((item) => item.id === chapter.id) : -1;
  const previous = currentIndex > 0 ? allChapters[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? allChapters[currentIndex + 1] : undefined;
  const source = library.sources.find((item) => item.id === chapter?.sourceId);
  const section = library.sections.find((item) => item.id === chapter?.sectionId);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-5 text-center" data-testid="status-chapter-loading">
        <LoaderCircle className="animate-spin text-accent" size={28} strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-3xl text-primary">Loading chapter…</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Only this chapter’s text is being loaded.</p>
      </div>
    );
  }

  if (!content || !chapter || !chapterId) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-5 text-center" data-testid="status-chapter-error">
        <CircleAlert className="text-destructive" size={28} strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-4xl text-primary">This chapter is out of reach.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The source may be unavailable, or the chapter has moved since the index was made.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90" data-testid="link-return-library-error"><ArrowLeft size={15} /> Return to library</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[1050px] px-5 pb-24 pt-10 md:px-10 md:pt-16">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-accent" data-testid="link-back-library"><ArrowLeft size={15} /> Back to library</Link>
        <span className="font-mono-custom text-[11px] uppercase tracking-[0.17em] text-muted-foreground" data-testid="text-fetched-at"><LoaderCircle size={11} className="mr-1 inline" /> Read only · {content.fetchedAt ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(content.fetchedAt)) : 'just now'}</span>
      </div>

      <header className="mt-16 max-w-4xl border-b border-border pb-10 md:mt-20 md:pb-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono-custom text-[11px] uppercase tracking-[0.2em] text-accent" data-testid="text-chapter-source">{source?.shortName ?? content.sourceTitle}</span>
          {section && <><span className="h-1 w-1 rounded-full bg-border" /><span className="font-mono-custom text-[11px] uppercase tracking-[0.17em] text-muted-foreground">{section.name}</span></>}
          <span className="ml-auto font-mono-custom text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Chapter {chapter.chapterNumber}</span>
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[0.98] tracking-[-0.035em] text-primary md:text-6xl" data-testid="text-chapter-title">{chapter.title}</h1>
        <p className="mt-6 max-w-2xl font-display text-base italic leading-relaxed text-muted-foreground md:text-lg">{chapter.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <span className="font-mono-custom text-[11px] uppercase tracking-[0.16em] text-muted-foreground" data-testid="text-chapter-language">{chapter.language}</span>
          <span className="h-4 w-px bg-border" />
          <a href={chapter.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-accent transition-colors hover:text-primary" data-testid="link-original-source">Open original source <ExternalLink size={14} /></a>
        </div>
      </header>

      <div className="grid gap-12 pt-12 md:grid-cols-[minmax(0,680px)_220px] md:gap-20 md:pt-16">
        <div data-testid="content-chapter">
          {content.content ? <ReadableContent content={content.content} chapterId={chapter.id} /> : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center" data-testid="status-chapter-empty">
              <BookOpen className="mx-auto text-muted-foreground" size={24} strokeWidth={1.4} />
              <p className="mt-3 font-display text-xl text-primary">The text is not available yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">The index knows this chapter, but the source has not shared its reading.</p>
            </div>
          )}
        </div>
        <aside className="hidden md:block">
          <div className="sticky top-28 border-l border-accent/50 pl-5">
           <p className="font-mono-custom text-[11px] uppercase tracking-[0.2em] text-accent">In this collection</p>
            <p className="mt-3 font-display text-xl leading-tight text-primary">{content.sourceTitle}</p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{source?.description ?? 'A public source in the Ayurveda Reader index.'}</p>
             {source?.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-primary" data-testid="link-source-home">{source.shortName} home <ExternalLink size={12} /></a>}
          </div>
        </aside>
      </div>

      <nav className="mt-20 grid gap-3 border-t border-border pt-7 sm:grid-cols-2" aria-label="Adjacent chapters">
        {previous ? <AdjacentChapter chapter={previous} direction="previous" /> : <span />}
        {next ? <AdjacentChapter chapter={next} direction="next" /> : <span className="hidden sm:block" />}
      </nav>
    </article>
  );
}

function AdjacentChapter({ chapter, direction }: { chapter: Chapter; direction: 'previous' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link href={`/chapter/${chapter.id}`} className={`group rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-accent hover:shadow-sm ${isNext ? 'text-right' : ''}`} data-testid={`link-${direction}-chapter`}>
      <span className="flex items-center justify-between gap-3 font-mono-custom text-[11px] uppercase tracking-[0.17em] text-muted-foreground">
        {!isNext && <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />}
        <span>{direction} chapter</span>
        {isNext && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
      </span>
      <span className="mt-3 block font-display text-xl leading-tight text-primary transition-colors group-hover:text-accent">{chapter.title}</span>
    </Link>
  );
}