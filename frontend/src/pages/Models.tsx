import { usePageContent } from "../content/ContentContext";
import type { ContentTree } from "../content/defaults";

type Series = ContentTree["models"]["series"][number];

/** The second entry is laid out mirrored; the pattern repeats for any extras. */
const isInverted = (index: number) => index % 2 === 1;

function SeriesSpecs({ series, index }: { series: Series; index: number }) {
  const inverted = isInverted(index);
  return (
    <div
      className={`md:col-span-5 p-8 md:p-12 flex flex-col justify-between border-b-4 border-transparent hover:border-primary transition-all duration-500 ${
        inverted ? "bg-surface-container order-2 md:order-1" : "bg-surface-container-high"
      }`}
    >
      <div>
        <h3 className="text-technical text-on-surface-variant mb-8">{series.specsTitle}</h3>
        <ul className="space-y-6">
          {series.specs.map((spec, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="text-primary font-bold">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-medium">{spec.label}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{spec.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-12">
        <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">{series.blurb}</p>
        <button
          className={
            inverted
              ? "border border-primary/30 text-primary hover:bg-primary hover:text-on-primary px-8 py-3 text-technical font-bold transition-all"
              : "btn-shine bg-primary text-on-primary px-8 py-3 text-technical font-bold hover:opacity-90 transition-opacity"
          }
        >
          {series.cta}
        </button>
      </div>
    </div>
  );
}

function SeriesImage({ series, index }: { series: Series; index: number }) {
  const inverted = isInverted(index);
  return (
    <div
      className={`md:col-span-7 relative h-[420px] md:h-[600px] overflow-hidden ${inverted ? "order-1 md:order-2" : ""}`}
    >
      <img
        alt={series.alt}
        src={series.image}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className={`absolute bottom-8 ${inverted ? "right-8 text-right" : "left-8"}`}>
        <span className="text-technical text-primary">{series.chapter}</span>
        <h2 className="text-4xl md:text-5xl font-headline italic font-light text-on-surface">{series.name}</h2>
      </div>
    </div>
  );
}

export default function Models() {
  const { hero, series, cta } = usePageContent("models");

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 md:px-12 mb-24 max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <span className="text-technical text-primary mb-4 block">{hero.eyebrow}</span>
          <h1 className="text-5xl md:text-8xl font-headline italic font-light leading-[0.9] tracking-tight text-on-surface">
            {hero.titleLine1} <br />
            <span className="text-primary">{hero.titleLine2}</span>
          </h1>
        </div>
        <div className="md:col-span-4 pb-2">
          <p className="text-lg font-light text-on-surface-variant leading-relaxed">{hero.body}</p>
        </div>
      </section>

      <div className="px-6 md:px-12 max-w-screen-2xl mx-auto space-y-24 md:space-y-40">
        {series.map((entry, index) => (
          <section key={index} className="grid grid-cols-1 md:grid-cols-12 gap-0 group">
            {isInverted(index) ? (
              <>
                <SeriesSpecs series={entry} index={index} />
                <SeriesImage series={entry} index={index} />
              </>
            ) : (
              <>
                <SeriesImage series={entry} index={index} />
                <SeriesSpecs series={entry} index={index} />
              </>
            )}
          </section>
        ))}
      </div>

      <section className="mt-24 md:mt-40 mb-20 mx-6 md:mx-12 max-w-screen-2xl xl:mx-auto text-center py-24 md:py-32 bg-surface-container-low relative overflow-hidden">
        <div className="grain-texture absolute inset-0 pointer-events-none" />
        <div className="relative z-10 px-6">
          <h2 className="text-4xl md:text-5xl font-headline italic font-light mb-8">{cta.title}</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-12 font-light">{cta.body}</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button className="btn-shine bg-primary text-on-primary px-12 py-4 text-technical font-bold">
              {cta.primary}
            </button>
            <button className="text-technical font-bold text-on-surface border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors">
              {cta.secondary}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
