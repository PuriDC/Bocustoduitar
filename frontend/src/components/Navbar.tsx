import { Link, NavLink } from "react-router-dom";
import { useContent, usePageContent } from "../content/ContentContext";
import type { ContentTree } from "../content/defaults";
import type { Lang } from "../content/lang";
import logo from "../assets/bocusto-logo.png";

type CommonBrand = ContentTree["common"]["brand"];

const NAV_ORDER = ["about", "models", "available", "order", "gallery", "events", "contact"] as const;

/** Declaration order is also left-to-right order, which the marker relies on. */
const LANGUAGE_OPTIONS = [
  { code: "en", label: (brand: CommonBrand) => brand.languageEn },
  { code: "th", label: (brand: CommonBrand) => brand.languageTh }
] as const satisfies ReadonlyArray<{ code: Lang; label: (brand: CommonBrand) => string }>;

export default function Navbar() {
  const { brand, nav } = usePageContent("common");
  const { lang, setLang } = useContent();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0806]/85 backdrop-blur-md border-b border-outline-variant/60">
      <div className="flex justify-between items-center px-6 md:px-12 py-5 w-full max-w-screen-2xl mx-auto">
        {/* The wordmark carries the name, so it is the accessible name here and
            the brand strings stay the single source for it. Height is fixed and
            width follows the 559:217 artwork, which keeps the bar from shifting
            while the image loads. */}
        <Link to="/" className="shrink-0" aria-label={`${brand.namePrimary} ${brand.nameSecondary}`}>
          <img
            src={logo}
            alt={`${brand.namePrimary} ${brand.nameSecondary}`}
            width={103}
            height={40}
            className="h-8 md:h-10 w-auto"
          />
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
          <div
            role="group"
            aria-label={brand.languageSwitchLabel}
            className="hidden md:grid grid-cols-2 relative overflow-hidden rounded border border-outline-variant hover:border-outline transition-colors duration-300"
          >
            {/* The marker slides between the two halves, so the control reads as
                one switch rather than two buttons that happen to sit together.
                A two-column grid keeps the halves equal, which is what makes
                translating the marker by exactly 100% land it correctly. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/2 bg-primary shadow-[0_0_14px_rgba(212,169,74,0.3)] transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: lang === "th" ? "translateX(100%)" : "translateX(0)" }}
            />
            {LANGUAGE_OPTIONS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                // Sized here rather than with .text-technical: that class grows
                // for Thai, and these two labels stay Latin in either language.
                className={`relative px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  lang === code ? "text-on-primary" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {label(brand)}
              </button>
            ))}
          </div>
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
