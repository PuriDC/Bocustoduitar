import { useState } from "react";
import { usePageContent } from "../content/ContentContext";

const FIELD_CLASS =
  "w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all";

type Status = "idle" | "loading" | "success" | "error";

export default function Order() {
  const { hero, phase1, phase2, phase3, phase4, form } = usePageContent("order");
  const modelOptions = form.models.map((m) => m.label);

  const [values, setValues] = useState({ name: "", email: "", model: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  // Falls back to the first configured model until the visitor picks one, so an
  // administrator renaming the options never leaves the select out of sync.
  const selectedModel = values.model || modelOptions[0] || "";

  const update = (field: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, model: selectedModel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your request.");
      setStatus("success");
      setFeedback(data.message);
      setValues({ name: "", email: "", model: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Could not submit your request.");
    }
  };

  return (
    <div className="pt-32">
      <section className="relative min-h-[560px] md:h-[716px] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt={hero.alt} src={hero.image} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <p className="text-technical text-primary mb-4">{hero.eyebrow}</p>
          <h1 className="text-5xl md:text-8xl font-headline italic font-light tracking-tight leading-none text-on-surface mb-8">
            {hero.titleLine1} <br /> {hero.titleLine2}
          </h1>
          <p className="text-lg md:text-xl font-light text-on-surface-variant max-w-xl leading-relaxed">{hero.body}</p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-24 md:py-32 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-surface-container-high p-8 md:p-12 flex flex-col justify-between">
            <div>
              <p className="text-technical text-primary mb-8">{phase1.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-headline italic font-light mb-6">{phase1.title}</h2>
              <p className="text-lg font-light text-on-surface-variant leading-relaxed max-w-md">{phase1.body}</p>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <span className="h-px w-12 bg-primary" />
              <span className="text-technical text-on-surface">{phase1.tag}</span>
            </div>
          </div>

          <div className="md:col-span-5 relative group overflow-hidden aspect-square md:aspect-auto min-h-[320px]">
            <img
              alt={phase2.alt}
              src={phase2.image}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <p className="text-technical text-primary mb-4">{phase2.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-headline italic font-light text-on-surface">{phase2.title}</h2>
            </div>
          </div>

          <div className="md:col-span-5 bg-surface-container-high p-8 md:p-12 flex flex-col justify-center border-b-4 border-primary/20 hover:border-primary transition-colors duration-500">
            <p className="text-technical text-primary mb-8">{phase3.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-headline italic font-light mb-6">{phase3.title}</h2>
            <p className="text-lg font-light text-on-surface-variant leading-relaxed">{phase3.body}</p>
            <div className="mt-12">
              <span className="material-symbols-outlined text-4xl text-primary/40">handyman</span>
            </div>
          </div>

          <div className="md:col-span-7 relative h-[400px] md:h-auto min-h-[400px] overflow-hidden">
            <img alt={phase4.alt} src={phase4.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 right-8 md:right-12 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
              <div>
                <p className="text-technical text-primary mb-4">{phase4.eyebrow}</p>
                <h2 className="text-3xl md:text-4xl font-headline italic font-light text-on-surface">{phase4.title}</h2>
              </div>
              <p className="text-on-surface-variant text-sm font-light max-w-xs sm:text-right">{phase4.body}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-24 md:py-32 flex flex-col md:flex-row gap-12 md:gap-20 max-w-screen-2xl mx-auto">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl font-headline italic font-light leading-tight mb-8">
            {form.titleLine1} <br /> {form.titleLine2}
          </h2>
          <p className="text-lg font-light text-on-surface-variant mb-12">{form.body}</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="text-sm tracking-widest uppercase">{form.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-sm tracking-widest uppercase">{form.location}</span>
            </div>
          </div>
        </div>

        <div className="md:w-2/3 bg-surface-container p-6 md:p-12 shadow-2xl">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-technical text-on-surface-variant block" htmlFor="order-name">
                {form.nameLabel}
              </label>
              <input
                id="order-name"
                className={FIELD_CLASS}
                type="text"
                value={values.name}
                onChange={(e) => update("name")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-technical text-on-surface-variant block" htmlFor="order-email">
                {form.emailLabel}
              </label>
              <input
                id="order-email"
                className={FIELD_CLASS}
                type="email"
                value={values.email}
                onChange={(e) => update("email")(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-technical text-on-surface-variant block" htmlFor="order-model">
                {form.modelLabel}
              </label>
              <select
                id="order-model"
                className={`${FIELD_CLASS} appearance-none`}
                value={selectedModel}
                onChange={(e) => update("model")(e.target.value)}
              >
                {modelOptions.map((model, i) => (
                  <option key={i}>{model}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-technical text-on-surface-variant block" htmlFor="order-message">
                {form.messageLabel}
              </label>
              <textarea
                id="order-message"
                className={`${FIELD_CLASS} resize-none`}
                rows={5}
                value={values.message}
                onChange={(e) => update("message")(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-shine bg-primary text-on-primary px-12 py-5 text-technical font-bold hover:opacity-90 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : form.submit}
                <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">
                  arrow_forward
                </span>
              </button>
              {feedback && (
                <p className={`text-technical ${status === "error" ? "text-error" : "text-primary"}`}>{feedback}</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
