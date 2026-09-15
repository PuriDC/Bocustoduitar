import { useEffect, useRef, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { PreviewContentProvider } from "../content/ContentContext";
import type { ContentTree, PageKey } from "../content/defaults";
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

/** Width the public site is designed against; the preview scales down from it. */
const DESIGN_WIDTH = 1440;

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

const ROUTE_FOR_PAGE: Record<PageKey, string> = {
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
};

/**
 * Renders the real public page components — not a mock — against the draft
 * content, so what the editor sees is exactly what visitors will get.
 *
 * The scaled wrapper is deliberate: a CSS transform makes the wrapper the
 * containing block for `position: fixed`, which keeps the site's fixed navbar
 * inside the preview panel instead of pinning it to the browser window.
 */
export default function PagePreview({ page, content }: Props) {
  const Page = PAGE_COMPONENTS[page];
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [stageHeight, setStageHeight] = useState(900);

  // Fit the 1440px design to whatever width the preview column has.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / DESIGN_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reserve the scaled height so the panel scrolls over the whole page.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setStageHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, content]);

  return (
    <div ref={containerRef} className="w-full" style={{ height: stageHeight * scale }}>
      <div
        className="site-preview bg-background text-on-surface font-body select-none pointer-events-none"
        style={{
          width: DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // Contains the site's fixed navbar within this box.
          contain: "layout"
        }}
      >
        <div ref={stageRef}>
          <PreviewContentProvider content={content}>
            <MemoryRouter initialEntries={[ROUTE_FOR_PAGE[page]]}>
              <Navbar />
              <main>
                <Page />
              </main>
              <Footer />
            </MemoryRouter>
          </PreviewContentProvider>
        </div>
      </div>
    </div>
  );
}
