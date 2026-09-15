import { usePageContent } from "../content/ContentContext";

const TILE_IMG = "w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000";

export default function About() {
  const { hero, legacy, workshop, materials, founder } = usePageContent("about");

  return (
    <div className="pt-24">
      <section className="relative min-h-[620px] md:h-[921px] flex items-end px-6 md:px-12 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt={hero.alt}
            src={hero.image}
            className="w-full h-full object-cover grayscale brightness-50 contrast-125"
          />
          <div className="absolute inset-0 tonal-fade" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <span className="text-technical text-primary mb-4 block">{hero.eyebrow}</span>
          <h1 className="font-headline italic font-light text-6xl md:text-9xl text-on-surface leading-[0.9] tracking-tight mb-8">
            {hero.titleLine1} <br /> {hero.titleLine2}
          </h1>
          <p className="font-body text-xl md:text-2xl font-light text-on-surface-variant max-w-2xl leading-relaxed">
            {hero.body}
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center bg-surface-container-low">
        <div className="md:col-span-5 order-2 md:order-1">
          <h2 className="text-technical text-primary mb-6">{legacy.eyebrow}</h2>
          <h3 className="font-headline italic font-light text-4xl md:text-5xl text-on-surface mb-8 leading-tight">
            {legacy.title}
          </h3>
          <div className="space-y-6 text-on-surface-variant font-light text-lg leading-relaxed">
            <p>{legacy.body1}</p>
            <p>{legacy.body2}</p>
          </div>
        </div>
        <div className="md:col-span-7 order-1 md:order-2 flex justify-end">
          <div className="relative w-full max-w-2xl aspect-[4/5] bg-surface-container-high overflow-hidden border-b-4 border-primary">
            <img
              alt={legacy.alt}
              src={legacy.image}
              className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
            />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-12 bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-16 gap-4">
          <h2 className="font-headline italic font-light text-4xl md:text-6xl text-on-surface">{workshop.title}</h2>
          <span className="text-technical text-on-surface-variant">{workshop.caption}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-surface-container min-h-[320px]">
            <img alt={workshop.benchAlt} src={workshop.benchImage} className={TILE_IMG} />
            <div className="absolute bottom-0 left-0 p-8 tonal-fade w-full">
              <span className="text-technical text-primary">{workshop.benchEyebrow}</span>
              <h4 className="font-headline italic font-light text-2xl text-on-surface">{workshop.benchTitle}</h4>
            </div>
          </div>
          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden bg-surface-container min-h-[240px]">
            <img alt={workshop.bracingAlt} src={workshop.bracingImage} className={TILE_IMG} />
            <div className="absolute bottom-0 left-0 p-6">
              <h4 className="font-headline italic font-light text-xl text-on-surface">{workshop.bracingTitle}</h4>
            </div>
          </div>
          <div className="md:col-span-1 md:row-span-2 relative group overflow-hidden bg-surface-container min-h-[240px]">
            <img alt={workshop.finishAlt} src={workshop.finishImage} className={TILE_IMG} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="sidebar-text text-technical text-primary opacity-40">{workshop.finishSideLabel}</span>
            </div>
            <div className="absolute bottom-0 left-0 p-6">
              <h4 className="font-headline italic font-light text-xl text-on-surface">{workshop.finishTitle}</h4>
            </div>
          </div>
          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden bg-surface-container min-h-[240px]">
            <img alt={workshop.toolsAlt} src={workshop.toolsImage} className={TILE_IMG} />
            <div className="absolute bottom-0 left-0 p-6">
              <h4 className="font-headline italic font-light text-xl text-on-surface">{workshop.toolsTitle}</h4>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-container-lowest overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-12">
            <div>
              <h2 className="text-technical text-primary mb-6">{materials.eyebrow}</h2>
              <h3 className="font-headline italic font-light text-4xl md:text-6xl text-on-surface leading-tight">
                {materials.titleLine1} <br /> {materials.titleLine2}
              </h3>
            </div>
            <div className="space-y-8">
              {materials.list.map((material, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <span className="font-headline italic text-3xl text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h5 className="text-on-surface font-semibold mb-2 uppercase text-[10px] tracking-widest">
                      {material.name}
                    </h5>
                    <p className="text-on-surface-variant font-light leading-relaxed">{material.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -right-12 w-64 h-64 border-t border-r border-primary opacity-20" />
            <img
              alt={materials.alt}
              src={materials.image}
              className="w-full grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
            />
            <div className="mt-8 p-6 bg-surface-container-high border-l-4 border-primary">
              <p className="italic text-on-surface font-headline text-xl">{materials.quote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 px-6 md:px-12 bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-12">
            <span className="material-symbols-outlined text-primary text-4xl">ink_pen</span>
          </div>
          <h2 className="text-technical text-primary mb-12">{founder.eyebrow}</h2>
          <div className="font-headline italic font-light text-2xl md:text-4xl text-on-surface leading-relaxed mb-16 space-y-8">
            <p>{founder.quote1}</p>
            <p>{founder.quote2}</p>
          </div>
          <div className="inline-block border-t border-outline-variant pt-8 px-12">
            <p className="text-on-surface font-headline italic text-2xl">{founder.name}</p>
            <p className="text-technical text-primary mt-2">{founder.role}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
