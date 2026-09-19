import { useCallback, useEffect, useRef, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { PreviewContentProvider } from "../content/ContentContext";
import type { ContentTree, PageKey } from "../content/defaults";
import type { Lang } from "../content/lang";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import About from "../pages/About";
import Models from "../pages/Models";
import Available from "../pages/Available";
import Order from "../pages/Order";
import Gallery from "../pages/Gallery";
import Events from "../pages/Events";
import Contact from "../pages/Contact";
import PreviewFrame from "./components/PreviewFrame";

export type Viewport = "desktop" | "mobile";

/** CSS widths the preview frame is given; media queries resolve against these. */
const DESIGN_WIDTH: Record<Viewport, number> = { desktop: 1440, mobile: 414 };
/** What `100vh` means inside the frame — a plausible device height, not the content height. */
const DESIGN_HEIGHT: Record<Viewport, number> = { desktop: 900, mobile: 896 };

const PAGE_COMPONENTS: Record<PageKey, () => JSX.Element> = {
  common: Home,
  home: Home,
  about: About,
  models: Models,
  available: Available,
  order: Order,
  gallery: Gallery,
  events: Events,
  contact: Contact
};

export const ROUTE_FOR_PAGE: Record<PageKey, string> = {
  common: "/",
  home: "/",
  about: "/about",
  models: "/models",
  available: "/available",
  order: "/order",
  gallery: "/gallery",
  events: "/events",
  contact: "/contact"
};

type Props = {
  page: PageKey;
  /** Published content with the current unsaved edits already applied. */
  content: ContentTree;
  /** The language `content` was resolved in, so the chrome matches it. */
  lang: Lang;
  viewport: Viewport;
};

/**
 * Renders the real public page components — not a mock — against the draft
 * content, so what the editor sees is exactly what visitors will get.
 */
export default function PagePreview({ page, content, lang, viewport }: Props) {
  const Page = PAGE_COMPONENTS[page];
  const width = DESIGN_WIDTH[viewport];

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(900);

  // Fit the frame to the panel. Mobile is capped at 1:1 so it is not blown up
  // past its real size on a wide screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / width, viewport === "mobile" ? 1 : 1.5));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, viewport]);

  const handleHeightChange = useCallback((next: number) => setHeight(next), []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      {/* Reserves the scaled footprint; the frame itself is transformed. */}
      <div style={{ width: width * scale, height: height * scale }}>
        <PreviewFrame
          width={width}
          viewportHeight={DESIGN_HEIGHT[viewport]}
          scale={scale}
          onHeightChange={handleHeightChange}
        >
          <div lang={lang} className="site-preview bg-background text-on-surface font-body select-none">
            <PreviewContentProvider content={content} lang={lang}>
              <MemoryRouter initialEntries={[ROUTE_FOR_PAGE[page]]}>
                <Navbar />
                <main>
                  <Page />
                </main>
                <Footer />
              </MemoryRouter>
            </PreviewContentProvider>
          </div>
        </PreviewFrame>
      </div>
    </div>
  );
}
