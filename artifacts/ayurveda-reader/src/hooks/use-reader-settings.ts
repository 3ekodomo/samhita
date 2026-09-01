import { useState, useEffect } from 'react';

export type ReaderSettings = {
  textSize: number; // e.g. 1 (default), 1.2, 1.5
  spacing: number;  // e.g. 1.9 (default), 2.5
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
};

const DEFAULT_SETTINGS: ReaderSettings = {
  textSize: 1,
  spacing: 1.9,
};

const STORAGE_KEY = 'ayurveda-reader-data';

export function useReaderSettings() {
  const [data, setData] = useState<ReaderData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse reader data from local storage', e);
    }
    return {
      settings: DEFAULT_SETTINGS,
      bookmarks: [],
      highlights: [],
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
    updateSettings,
    toggleBookmark,
    isBookmarked,
    toggleHighlight,
    isHighlighted,
    exportData,
    importData,
  };
}
