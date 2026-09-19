import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useContent } from "../content/ContentContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Keeps `<html lang>` on the language the page is actually written in, which
 * assistive technology and the browser's translation prompt both read.
 *
 * This lives here rather than in `ContentProvider` because the provider also
 * wraps the admin panel, whose interface is Thai regardless of which language
 * the editor happens to be working on.
 */
function DocumentLang() {
  const { lang } = useContent();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}

/** Jump to the top on every route change — the fixed nav otherwise keeps the old scroll offset. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default function Layout() {
  return (
    <div className="text-on-surface font-body selection:bg-primary selection:text-background overflow-x-hidden">
      <div className="grain-overlay" />
      <DocumentLang />
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
