import { usePageContent } from "../content/ContentContext";

export default function StatsStrip() {
  const { stats } = usePageContent("home");

  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-surface-container border-y border-outline-variant/60">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <p className="number-serif text-4xl md:text-5xl text-primary mb-2">{stat.value}</p>
            <p className="text-technical text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
