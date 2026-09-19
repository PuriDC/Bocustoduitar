import { Link, NavLink } from "react-router-dom";
import { usePageContent } from "../content/ContentContext";

const NAV_ORDER = ["about", "models", "available", "order", "gallery", "events", "contact"] as const;

export default function Navbar() {
  const { brand, nav } = usePageContent("common");

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0806]/85 backdrop-blur-md border-b border-outline-variant/60">
      <div className="flex justify-between items-center px-6 md:px-12 py-5 w-full max-w-screen-2xl mx-auto">
        <Link className="font-headline italic text-2xl text-primary tracking-tight" to="/">
          {brand.namePrimary} <span className="text-on-surface">{brand.nameSecondary}</span>
        </Link>
        <div className="hidden lg:flex items-center gap-10">
          {NAV_ORDER.map((key) => (
            <NavLink
              key={key}
              to={`/${key}`}
              className={({ isActive }) =>
                `text-technical transition-colors duration-300 pb-1 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
                }`
              }
            >
              {nav[key]}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-technical text-on-surface-variant hover:text-primary transition-colors">
            {brand.languageToggle}
          </button>
          <a
            href="https://bocustotonewood.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bocusto Tonewood"
            className="text-primary hover:text-on-surface transition-colors active:scale-95 duration-200 relative"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-background text-[8px] flex items-center justify-center rounded-full font-bold">
              {brand.cartCount}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
