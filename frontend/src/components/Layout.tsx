import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

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
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
