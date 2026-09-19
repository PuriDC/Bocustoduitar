import { useMemo, useState } from "react";
import { usePageContent } from "../content/ContentContext";

export default function Events() {
  const { hero, featured, location, list, events, past } = usePageContent("events");
  const [filter, setFilter] = useState("");

  // Categories come from the events themselves, so renaming one in the admin
  // panel updates the filter row without any code change.
  const filters = useMemo(() => [list.allLabel, ...new Set(events.map((e) => e.category))], [list.allLabel, events]);
  // Fall back to "all" if the chosen category no longer exists — an
  // administrator renaming one would otherwise leave the list stuck on empty
  // with nothing on screen explaining why.
  const active = filter && filters.includes(filter) ? filter : list.allLabel;
  const visible = active === list.allLabel ? events : events.filter((e) => e.category === active);

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <section className="mb-24 flex flex-col md:flex-row items-start md:items-end gap-8">
        <div className="md:w-2/3">
          <span className="text-technical text-primary mb-4 block">{hero.eyebrow}</span>
          <h1 className="font-headline italic font-light text-5xl md:text-8xl leading-none text-on-surface">
            {hero.titleLine1} <br />
            {hero.titleLine2}
          </h1>
        </div>
        <div className="md:w-1/3 pb-4">
          <p className="text-lg font-light text-on-surface-variant max-w-md">{hero.body}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 md:mb-32">
        <div className="md:col-span-8 relative aspect-[16/9] overflow-hidden rounded-lg group">
          <img
            alt={featured.alt}
            src={featured.image}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 tonal-stack flex flex-col justify-end p-6 md:p-12">
            <span className="text-technical text-primary mb-2">{featured.eyebrow}</span>
            <h2 className="font-headline italic font-light text-3xl md:text-4xl text-on-surface mb-4">
              {featured.title}
            </h2>
            <p className="font-body text-on-surface-variant mb-6 max-w-lg">{featured.body}</p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-shine bg-primary text-on-primary px-8 py-3 text-technical font-bold hover:brightness-110 transition-all">
                {featured.primaryCta}
              </button>
              <button className="border border-outline px-8 py-3 text-technical text-on-surface hover:bg-surface-container-high transition-all">
                {featured.secondaryCta}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-high p-8 md:p-12 flex flex-col justify-center rounded-lg border-b-4 border-primary">
          <span className="text-technical text-primary mb-4">{location.eyebrow}</span>
          <div className="w-full h-48 mb-8 rounded bg-surface-container-low overflow-hidden">
            <img
              alt={location.alt}
              src={location.image}
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <h3 className="font-headline italic font-light text-2xl mb-2">{location.name}</h3>
          <p className="text-technical text-on-surface-variant mb-6">{location.dates}</p>
          <p className="text-on-surface-variant font-light mb-8">{location.body}</p>
          <a className="text-primary text-technical flex items-center group" href="#">
            {location.cta}
            <span className="material-symbols-outlined ml-2 text-sm transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </a>
        </div>
      </section>

      <section className="space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-outline-variant pb-6">
          <h2 className="font-headline italic font-light text-3xl md:text-4xl">{list.title}</h2>
          <div className="flex flex-wrap gap-6 md:gap-8">
            {filters.map((name) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`text-technical transition-colors ${
                  active === name ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {visible.map((event, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center py-8 border-b border-outline-variant hover:bg-surface-container-low transition-colors px-4 group"
          >
            <div className="md:col-span-2">
              <p className="font-headline italic font-light text-3xl">{event.date}</p>
              <p className="text-technical text-on-surface-variant">{event.city}</p>
            </div>
            <div className="md:col-span-5">
              <h3 className="font-headline italic font-light text-2xl group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-on-surface-variant font-light">{event.blurb}</p>
            </div>
            <div className="md:col-span-2">
              <span className="inline-block border border-outline px-3 py-1 text-technical text-on-surface-variant">
                {event.category}
              </span>
            </div>
            <div className="md:col-span-3 flex md:justify-end">
              <button className="border border-outline px-8 py-3 text-technical text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all">
                {event.cta}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-2 gap-4">
        {past.map((entry, i) => (
          <div
            key={i}
            className={`relative h-[420px] md:h-[600px] overflow-hidden ${
              i % 2 === 1 ? "translate-y-6 md:translate-y-24" : ""
            }`}
          >
            <img
              alt={entry.alt}
              src={entry.image}
              className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
            />
            <div className="absolute bottom-8 left-8">
              <h4 className="font-headline italic font-light text-2xl">{entry.title}</h4>
              <p className="text-technical opacity-60">{entry.caption}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
