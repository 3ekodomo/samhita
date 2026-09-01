import libraryJson from '@/data/library.json';

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
  chapterContent: LibraryChapterContent[];
  lastUpdated: string;
  totalChapters: number;
  availableSources: number;
  generatedAt: string;
};

export const staticLibrary = libraryJson as StaticLibrary;

const chapterContentById = new Map(
  staticLibrary.chapterContent.map((item) => [item.chapter.id, item]),
);

export function getStaticChapterContent(chapterId: string) {
  return chapterContentById.get(chapterId);
}