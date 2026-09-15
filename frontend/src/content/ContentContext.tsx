import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultContent, type ContentTree, type PageKey } from "./defaults";
import { applyOverrides } from "./paths";

type ContentState = {
  /** Defaults with any administrator edits applied. */
  content: ContentTree;
  /** Only the values that differ from the shipped defaults. */
  overrides: Record<string, string>;
  loading: boolean;
  /** Re-reads the published content — call after saving from the admin panel. */
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as Record<string, string>;
      setOverrides(data ?? {});
    } catch (err) {
      // The site is fully readable on defaults alone; never block rendering.
      console.warn("[content] using shipped defaults.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<ContentState>(
    () => ({
      content: applyOverrides(defaultContent, overrides),
      overrides,
      loading,
      refresh: load
    }),
    [overrides, loading, load]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/**
 * Supplies an explicit content tree instead of the published one. The admin
 * preview uses it to render the real page components against unsaved drafts.
 */
export function PreviewContentProvider({ content, children }: { content: ContentTree; children: ReactNode }) {
  const value = useMemo<ContentState>(
    () => ({ content, overrides: {}, loading: false, refresh: async () => {} }),
    [content]
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContentState(): ContentState {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>.");
  return ctx;
}

/** The whole merged tree — used by the admin panel and by shared chrome. */
export function useContent(): ContentState {
  return useContentState();
}

/** The merged content for one page, e.g. `usePageContent("models").hero.title`. */
export function usePageContent<K extends PageKey>(page: K): ContentTree[K] {
  return useContentState().content[page];
}
