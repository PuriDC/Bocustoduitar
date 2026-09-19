import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultContent, type ContentTree, type PageKey } from "./defaults";
import { DEFAULT_LANG, readStoredLang, splitOverridesByLang, storeLang, type Lang } from "./lang";
import { applyOverrides } from "./paths";
import { thaiDefaults } from "./th";

type ContentState = {
  /** Defaults with any administrator edits applied, in the active language. */
  content: ContentTree;
  /** Values for the active language that differ from the shipped defaults. */
  overrides: Record<string, string>;
  /** The language the site is currently rendering in. */
  lang: Lang;
  setLang: (lang: Lang) => void;
  loading: boolean;
  /** Re-reads the published content — call after saving from the admin panel. */
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentState | null>(null);

/** Shipped copy for one language: English is the tree itself, Thai an overlay. */
function defaultsFor(lang: Lang): Record<string, string> {
  return lang === "th" ? thaiDefaults : {};
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [loading, setLoading] = useState(true);

  // Read the stored preference after mount so the first server-rendered or
  // cached paint is not tied to one visitor's choice.
  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    storeLang(next);
  }, []);

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

  const byLang = useMemo(() => splitOverridesByLang(overrides), [overrides]);

  const value = useMemo<ContentState>(() => {
    // Shipped translations first, then the administrator's edits on top.
    const merged = { ...defaultsFor(lang), ...byLang[lang] };
    return {
      content: applyOverrides(defaultContent, merged),
      overrides: byLang[lang],
      lang,
      setLang,
      loading,
      refresh: load
    };
  }, [byLang, lang, setLang, loading, load]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/**
 * Supplies an explicit content tree instead of the published one. The admin
 * preview uses it to render the real page components against unsaved drafts.
 */
export function PreviewContentProvider({
  content,
  lang = DEFAULT_LANG,
  children
}: {
  content: ContentTree;
  lang?: Lang;
  children: ReactNode;
}) {
  const value = useMemo<ContentState>(
    () => ({ content, overrides: {}, lang, setLang: () => {}, loading: false, refresh: async () => {} }),
    [content, lang]
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
