import libraryIndex from '@/data/library-index.json';

export type SourceStatus = 'ready' | 'partial' | 'unavailable';

export type LibrarySource = {
  id: string;
  name: string;
  shortName: string;
  url: string;
  description: string;
  chapterCount: number;
  status: SourceStatus;
};

export type LibrarySection = {
  id: string;
  sourceId: string;
  name: string;
  chapterCount: number;
  dataFile?: string;
};

export type LibraryChapter = {
  id: string;
  sourceId: string;
  sectionId: string;
  title: string;
  chapterNumber: number;
  url: string;
  language: string;
  excerpt: string;
  dataFile?: string;
};

export type LibraryChapterContent = {
  chapter: LibraryChapter;
  content: string;
  fetchedAt: string;
  sourceTitle: string;
};

export type StaticLibrary = {
  sources: LibrarySource[];
  sections: LibrarySection[];
  chapters: LibraryChapter[];
  lastUpdated: string;
  totalChapters: number;
  availableSources: number;
  generatedAt: string;
};

export const staticLibrary = libraryIndex as StaticLibrary;

/**
 * Chapter text is intentionally NOT bundled into the application.
 * Each chapter lives in public/data/chapters/<chapterId>.json and is
 * downloaded only when that chapter is opened.
 */
export async function getStaticChapterContent(chapterId: string): Promise<LibraryChapterContent | undefined> {
  const chapter = staticLibrary.chapters.find((item) => item.id === chapterId);
  if (!chapter) return undefined;

  const fileName = chapter.dataFile ?? `${chapter.id}.json`;
  const response = await fetch(`${import.meta.env.BASE_URL}data/chapters/${encodeURIComponent(fileName)}`);
  if (!response.ok) return undefined;
  return (await response.json()) as LibraryChapterContent;
}

export async function getStaticSection(sectionId: string) {
  const sectionIndex = staticLibrary.sections.findIndex((item) => item.id === sectionId);
  if (sectionIndex < 0) return undefined;
  const fileName = staticLibrary.sections[sectionIndex].dataFile ?? `section-${String(sectionIndex + 1).padStart(3, '0')}.json`;
  const response = await fetch(`${import.meta.env.BASE_URL}data/sections/${encodeURIComponent(fileName)}`);
  if (!response.ok) return undefined;
  return response.json();
}
