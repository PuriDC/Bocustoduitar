import { usePageContent } from "../content/ContentContext";

/** Repeating aspect rhythm for the masonry columns, applied by position. */
const ASPECTS = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[3/4]", "aspect-[4/5]", "aspect-[16/9]"];

export default function Gallery() {
  const { hero, plates, banner } = usePageContent("gallery");

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 md:px-12 mb-20 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-technical text-primary mb-4 block">{hero.eyebrow}</span>
            <h1 className="font-headline italic font-light text-5xl md:text-8xl text-on-surface leading-none mb-6">
              {hero.titleLine1} <br /> {hero.titleLine2}
            </h1>
          </div>
          <div className="md:text-right">
            <p className="font-body text-lg font-light text-on-surface-variant max-w-md leading-relaxed">{hero.body}</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-8 max-w-screen-2xl mx-auto">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {plates.map((plate, i) => (
            <div
              key={i}
              className={`relative group overflow-hidden bg-surface-container-high break-inside-avoid ${
                ASPECTS[i % ASPECTS.length]
              }`}
            >
              <img
                alt={plate.alt}
                src={plate.image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 tonal-fade opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <span className="text-technical text-primary mb-2">{plate.category}</span>
                <p className="font-headline italic font-light text-2xl text-on-surface">{plate.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 md:mt-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="relative w-full h-[420px] md:h-[512px] overflow-hidden flex items-center justify-center">
          <img alt={banner.alt} src={banner.image} className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="relative z-10 text-center max-w-3xl px-6">
            <h2 className="font-headline italic font-light text-4xl md:text-7xl text-primary mb-8">{banner.title}</h2>
            <button className="btn-shine bg-primary text-on-primary px-10 py-4 text-technical font-bold hover:brightness-110 transition-all border-b-4 border-transparent hover:border-surface-container-highest">
              {banner.cta}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
