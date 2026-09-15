import { usePageContent } from "../content/ContentContext";

export default function Philosophy() {
  const { philosophy } = usePageContent("home");

  return (
    <section id="philosophy" className="py-24 md:py-40 px-6 md:px-12 bg-surface-container-low border-t border-outline-variant/60">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        <div className="md:col-span-5 relative">
          <div className="absolute -top-6 -left-6 w-full h-full border border-primary/30 hidden md:block" />
          <div className="aspect-[3/4] overflow-hidden relative">
            <img
              alt={philosophy.imageAlt}
              className="w-full h-full object-cover grayscale-[15%] contrast-110"
              src={philosophy.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-surface-container-high border border-primary/20 p-8 shadow-2xl hidden md:block">
            <p className="text-technical text-primary mb-2">{philosophy.badgeEyebrow}</p>
            <p className="font-headline italic text-2xl text-on-surface">{philosophy.badgeTitle}</p>
          </div>
        </div>
        <div className="md:col-span-7">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-10 h-px bg-primary" />
            <p className="text-technical text-primary">{philosophy.eyebrow}</p>
          </div>
          <h2 className="font-headline italic font-light text-4xl md:text-5xl text-on-surface mb-8 leading-tight">
            {philosophy.title}
          </h2>
          <div className="space-y-6 font-body text-lg text-on-surface-variant font-light leading-relaxed">
            <p>{philosophy.body1}</p>
            <p>{philosophy.body2}</p>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-outline-variant pt-10">
            {philosophy.pillars.map((pillar) => (
              <div key={pillar.number}>
                <span className="text-3xl number-serif text-primary">{pillar.number}</span>
                <p className="text-technical mt-3 text-on-surface-variant">{pillar.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
