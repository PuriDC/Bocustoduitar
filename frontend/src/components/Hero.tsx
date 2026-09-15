import { Link } from "react-router-dom";
import { usePageContent } from "../content/ContentContext";

export default function Hero() {
  const { hero } = usePageContent("home");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img alt={hero.imageAlt} className="w-full h-full object-cover opacity-50 scale-105" src={hero.image} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      <div className="relative z-10 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-10 h-px bg-primary" />
            <p className="text-technical text-primary">{hero.eyebrow}</p>
          </div>
          <h1 className="font-headline italic font-light text-6xl md:text-8xl text-on-surface leading-[0.95] mb-8 tracking-tight">
            {hero.titleLine1} <br /> <span className="text-primary">{hero.titleLine2}</span>
          </h1>
          <p className="font-body font-light text-lg md:text-xl text-on-surface-variant mb-12 leading-relaxed max-w-xl">
            {hero.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link
              to="/models"
              className="btn-shine bg-primary text-background px-9 py-4 text-technical font-bold hover:bg-[#e8c06a] transition-colors duration-300"
            >
              {hero.primaryCta}
            </Link>
            <Link
              to="/about"
              className="border border-on-surface/20 px-9 py-4 text-technical hover:border-primary hover:text-primary transition-colors duration-300"
            >
              {hero.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-60">
        <p className="text-technical text-on-surface-variant">{hero.scrollLabel}</p>
        <div className="w-px h-10 fade-line" />
      </div>
    </section>
  );
}
