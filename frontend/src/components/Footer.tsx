import { usePageContent } from "../content/ContentContext";
import logo from "../assets/bocusto-logo.png";

export default function Footer() {
  const { footer } = usePageContent("common");

  return (
    <footer className="relative border-t border-primary/30 w-full bg-surface-container-lowest">
      <div className="max-w-screen-2xl mx-auto flex flex-col items-center py-20 px-8 text-center">
        {/* Larger than the navbar's: here the wordmark is the sign-off rather
            than a corner mark, and it is the only brand element on the row. */}
        <img src={logo} alt={footer.brand} width={155} height={60} className="h-12 md:h-14 w-auto mb-6" />
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
          {footer.links.map((link, i) => (
            <a
              key={i}
              className="text-technical font-light text-on-surface/60 hover:text-primary transition-all"
              href="#"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="w-16 h-px bg-primary/30 mb-8" />
        <p className="text-technical font-light text-on-surface/50">{footer.copyright}</p>
        <button
          className="mt-12 text-primary hover:opacity-70 transition-all flex flex-col items-center gap-2"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="material-symbols-outlined">keyboard_arrow_up</span>
          <span className="text-[8px] tracking-[0.5em] uppercase">{footer.topLabel}</span>
        </button>
      </div>
    </footer>
  );
}
