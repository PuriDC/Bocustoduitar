import { Link } from "react-router-dom";
import { usePageContent } from "../content/ContentContext";

export default function FeaturedBuild() {
  const { featured } = usePageContent("home");

  return (
    <section id="featured" className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-px bg-primary" />
              <p className="text-technical text-primary">{featured.eyebrow}</p>
            </div>
            <h2 className="font-headline italic font-light text-4xl md:text-5xl text-on-surface">{featured.title}</h2>
          </div>
          <Link
            className="text-technical text-on-surface-variant hover:text-primary transition-colors pb-2 border-b border-primary/30"
            to="/available"
          >
            {featured.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-8 card-hover group relative aspect-video md:aspect-auto md:h-[600px] overflow-hidden bg-surface-container border border-outline-variant/60">
            <img
              alt={featured.mainImageAlt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={featured.mainImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute top-8 right-8 border border-primary/40 px-4 py-2 backdrop-blur-sm bg-background/30">
              <p className="text-technical text-primary">{featured.badge}</p>
            </div>
            <div className="absolute bottom-10 left-10 right-10">
              <p className="text-technical text-primary mb-3">{featured.model}</p>
              <h3 className="font-headline italic font-light text-3xl md:text-4xl text-on-surface mb-4">
                {featured.name}
              </h3>
              <Link
                to="/order"
                className="inline-block text-technical border-b-2 border-primary pb-1 text-on-surface hover:text-primary transition-colors"
              >
                {featured.cta}
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">
            <div className="card-hover flex-1 group relative overflow-hidden bg-surface-container border border-outline-variant/60 min-h-[240px]">
              <img
                alt={featured.craftImageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={featured.craftImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-technical text-primary mb-2">{featured.craftLabel}</p>
                <p className="font-body text-sm text-on-surface-variant font-light">{featured.craftDetails}</p>
              </div>
            </div>
            <div className="card-hover flex-1 group relative overflow-hidden bg-surface-container border border-outline-variant/60 min-h-[240px]">
              <img
                alt={featured.acousticImageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={featured.acousticImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-technical text-primary mb-2">{featured.acousticLabel}</p>
                <p className="font-body text-sm text-on-surface-variant font-light">{featured.acousticEngineering}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
