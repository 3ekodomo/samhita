import { useState, useEffect } from 'react';

export type ReaderSettings = {
  textSize: number; // e.g. 1 (default), 1.2, 1.5
  spacing: number;  // e.g. 1.9 (default), 2.5
  hideShlokaControls: boolean;
};

export type Bookmark = {
  chapterId: string;
  blockIndex: number;
};

export type Highlight = {
  chapterId: string;
  blockIndex: number;
};

export type ReaderData = {
  settings: ReaderSettings;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  chapterBookmarks: string[];
};

const DEFAULT_SETTINGS: ReaderSettings = {
  textSize: 1,
  spacing: 1.9,
  hideShlokaControls: false,
};

const STORAGE_KEY = 'ayurveda-reader-data';

export function useReaderSettings() {
  const [data, setData] = useState<ReaderData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          bookmarks: parsed.bookmarks || [],
          highlights: parsed.highlights || [],
          chapterBookmarks: parsed.chapterBookmarks || [],
        };
      }
    } catch (e) {
      console.error('Failed to parse reader data from local storage', e);
    }
    return {
      settings: DEFAULT_SETTINGS,
      bookmarks: [],
      highlights: [],
      chapterBookmarks: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateSettings = (settings: Partial<ReaderSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const toggleBookmark = (chapterId: string, blockIndex: number) => {
    setData((prev) => {
      const exists = prev.bookmarks.some((b) => b.chapterId === chapterId && b.blockIndex === blockIndex);
      if (exists) {
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((b) => !(b.chapterId === chapterId && b.blockIndex === blockIndex)),
        };
      } else {
        return {
          ...prev,
          bookmarks: [...prev.bookmarks, { chapterId, blockIndex }],
        };
      }
    });
  };

  const isBookmarked = (chapterId: string, blockIndex: number) => {
    return data.bookmarks.some((b) => b.chapterId === chapterId && b.blockIndex === blockIndex);
  };

  const toggleChapterBookmark = (chapterId: string) => {
    setData((prev) => {
      const exists = prev.chapterBookmarks?.includes(chapterId);
      if (exists) {
        return {
          ...prev,
          chapterBookmarks: (prev.chapterBookmarks || []).filter((id) => id !== chapterId),
        };
      } else {
        return {
          ...prev,
          chapterBookmarks: [...(prev.chapterBookmarks || []), chapterId],
        };
      }
    });
  };

  const isChapterBookmarked = (chapterId: string) => {
    return data.chapterBookmarks?.includes(chapterId) ?? false;
  };

  const toggleHighlight = (chapterId: string, blockIndex: number) => {
    setData((prev) => {
      const exists = prev.highlights.some((h) => h.chapterId === chapterId && h.blockIndex === blockIndex);
      if (exists) {
        return {
          ...prev,
          highlights: prev.highlights.filter((h) => !(h.chapterId === chapterId && h.blockIndex === blockIndex)),
        };
      } else {
        return {
          ...prev,
          highlights: [...prev.highlights, { chapterId, blockIndex }],
        };
      }
    });
  };

  const isHighlighted = (chapterId: string, blockIndex: number) => {
    return data.highlights.some((h) => h.chapterId === chapterId && h.blockIndex === blockIndex);
  };

  const exportData = () => {
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString) as ReaderData;
      if (parsed && parsed.settings && Array.isArray(parsed.bookmarks) && Array.isArray(parsed.highlights)) {
        setData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON for reader data', e);
    }
    return false;
  };

  return {
    settings: data.settings,
    bookmarks: data.bookmarks,
    highlights: data.highlights,
    chapterBookmarks: data.chapterBookmarks,
    updateSettings,
    toggleBookmark,
    isBookmarked,
    toggleChapterBookmark,
    isChapterBookmarked,
    toggleHighlight,
    isHighlighted,
    exportData,
    importData,
  };
}
