import { useNewsletter } from "../lib/api";
import { usePageContent } from "../content/ContentContext";
import type { ContentTree } from "../content/defaults";

type Instrument = ContentTree["available"]["inventory"][number];

/** Staggered offsets that give the grid its rhythm, by position in the grid. */
const OFFSETS = ["", "md:mt-12", "", ""];

function InstrumentCard({ item, offset }: { item: Instrument; offset: string }) {
  return (
    <article className={`group relative ${offset}`}>
      <div className="aspect-[3/4] overflow-hidden bg-surface-container-high mb-6 relative">
        <img
          alt={item.alt}
          src={item.image}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 tonal-stack opacity-40 group-hover:opacity-20 transition-opacity" />
        {item.badge && (
          <div className="absolute top-4 right-4">
            <span className="text-technical bg-primary text-on-primary px-3 py-1">{item.badge}</span>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-baseline gap-4">
          <h2 className="font-headline italic font-light text-3xl">{item.name}</h2>
          <p className="text-technical text-primary whitespace-nowrap">{item.price}</p>
        </div>
        <div className="border-b-4 border-outline-variant group-hover:border-primary transition-colors duration-500 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-technical text-on-surface-variant">{item.spec1Label}</p>
              <p className="text-sm font-light mt-1">{item.spec1Value}</p>
            </div>
            <div>
              <p className="text-technical text-on-surface-variant">{item.spec2Label}</p>
              <p className="text-sm font-light mt-1">{item.spec2Value}</p>
            </div>
          </div>
        </div>
        <button className="btn-shine w-full bg-primary text-on-primary text-technical font-bold py-4 active:scale-[0.98] transition-all">
          {item.cta}
        </button>
      </div>
    </article>
  );
}

export default function Available() {
  const { hero, inventory, commission, newsletter } = usePageContent("available");
  const { email, setEmail, status, message, subscribe } = useNewsletter();

  // The commission card sits in the fifth slot, between the inventory cards.
  const beforeCommission = inventory.slice(0, 4);
  const afterCommission = inventory.slice(4);

  return (
    <div className="pt-32 pb-24">
      <header className="px-6 md:px-12 max-w-screen-2xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <p className="text-technical text-primary mb-4">{hero.eyebrow}</p>
            <h1 className="font-headline italic font-light text-5xl md:text-8xl text-on-surface leading-none">
              {hero.title}
            </h1>
          </div>
          <div className="md:col-span-4 pb-2">
            <p className="font-body text-lg font-light text-on-surface-variant leading-relaxed">{hero.body}</p>
          </div>
        </div>
      </header>

      <section className="px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {beforeCommission.map((item, i) => (
            <InstrumentCard key={i} item={item} offset={OFFSETS[i] ?? ""} />
          ))}

          <article className="group relative lg:-mt-12">
            <div className="aspect-[3/4] overflow-hidden bg-surface-container-high mb-6 relative">
              <img
                alt={commission.alt}
                src={commission.image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 tonal-stack opacity-40 group-hover:opacity-20 transition-opacity" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-headline italic font-light text-2xl text-on-surface leading-tight">
                  {commission.title}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-body text-sm font-light text-on-surface-variant leading-relaxed">{commission.body}</p>
              <button className="w-full border border-outline-variant text-on-surface text-technical py-4 hover:bg-surface-container-high hover:border-primary transition-all">
                {commission.cta}
              </button>
            </div>
          </article>

          {afterCommission.map((item, i) => (
            <InstrumentCard key={`after-${i}`} item={item} offset="" />
          ))}
        </div>
      </section>

      <section className="mt-24 md:mt-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <div className="bg-surface-container-high py-16 md:py-20 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="max-w-2xl mx-auto relative z-10">
            <p className="text-technical text-primary mb-6">{newsletter.eyebrow}</p>
            <h2 className="font-headline italic font-light text-4xl md:text-5xl mb-8">{newsletter.title}</h2>
            <p className="font-body text-lg font-light text-on-surface-variant mb-12">{newsletter.body}</p>
            <form
              className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                void subscribe();
              }}
            >
              <input
                className="bg-surface-container-lowest border border-outline-variant text-on-surface text-technical tracking-widest py-4 px-6 flex-grow focus:border-primary focus:ring-0 placeholder:text-on-surface/30 transition-colors"
                placeholder={newsletter.placeholder}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-shine bg-primary text-on-primary text-technical font-bold py-4 px-10 active:scale-95 transition-transform disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : newsletter.cta}
              </button>
            </form>
            {message && (
              <p className={`mt-6 text-technical ${status === "error" ? "text-error" : "text-primary"}`}>{message}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
