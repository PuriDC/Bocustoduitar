import { usePageContent } from "../content/ContentContext";

export default function Footer() {
  const { footer } = usePageContent("common");

  return (
    <footer className="relative border-t border-primary/30 w-full bg-surface-container-lowest">
      <div className="max-w-screen-2xl mx-auto flex flex-col items-center py-20 px-8 text-center">
        <div className="font-headline italic text-3xl text-primary mb-6">{footer.brand}</div>
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
