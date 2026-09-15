import { useNewsletter } from "../lib/api";
import { usePageContent } from "../content/ContentContext";

export default function Newsletter() {
  const { newsletter } = usePageContent("home");
  const { email, setEmail, status, message, subscribe } = useNewsletter();

  return (
    <section id="contact" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_400px_at_50%_0%,rgba(212,169,74,0.08),transparent_70%)]" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="w-10 h-px bg-primary" />
          <p className="text-technical text-primary">{newsletter.eyebrow}</p>
          <span className="w-10 h-px bg-primary" />
        </div>
        <h2 className="font-headline italic font-light text-4xl md:text-5xl text-on-surface mb-8">
          {newsletter.title}
        </h2>
        <p className="font-body text-lg md:text-xl text-on-surface-variant font-light mb-12 max-w-2xl mx-auto">
          {newsletter.body}
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-center max-w-2xl mx-auto">
          <input
            className="flex-1 bg-surface-container-high border border-outline-variant text-on-surface px-6 py-4 focus:border-primary focus:ring-0 text-technical tracking-widest placeholder:text-on-surface/30 w-full transition-colors"
            placeholder={newsletter.placeholder}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={subscribe}
            disabled={status === "loading"}
            className="btn-shine bg-primary text-background px-12 py-4 text-technical font-bold whitespace-nowrap w-full md:w-auto hover:bg-[#e8c06a] transition-colors duration-300 disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : newsletter.cta}
          </button>
        </div>
        {message && (
          <p className={`mt-6 text-technical ${status === "error" ? "text-error" : "text-primary"}`}>{message}</p>
        )}
      </div>
    </section>
  );
}
