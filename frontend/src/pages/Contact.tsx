import { useState } from "react";
import { usePageContent } from "../content/ContentContext";

/** Underlined, borderless fields — the design uses a single rule under each input. */
const FIELD_CLASS =
  "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary text-on-surface py-4 px-0 transition-all placeholder:text-on-surface/20 font-body";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const { hero, form, details } = usePageContent("contact");
  const subjectOptions = form.subjects.map((s) => s.label);

  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  // Falls back to the first configured subject until the visitor picks one.
  const selectedSubject = values.subject || subjectOptions[0] || "";

  const update = (field: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, subject: selectedSubject })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send your inquiry.");
      setStatus("success");
      setFeedback(data.message);
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Could not send your inquiry.");
    }
  };

  return (
    <div className="pt-24 flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 min-h-[512px] md:min-h-screen relative overflow-hidden">
        <img alt={hero.alt} src={hero.image} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/20 to-transparent" />
        <div className="absolute bottom-12 left-6 md:left-12 right-6 max-w-md">
          <h2 className="font-headline italic font-light text-4xl md:text-7xl text-primary leading-[0.9] mb-6">
            {hero.title}
          </h2>
          <p className="font-body font-light text-lg text-on-surface opacity-90 leading-relaxed">{hero.body}</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-24 bg-surface flex flex-col justify-center">
        <div className="max-w-xl">
          <div className="mb-16">
            <span className="text-technical text-primary mb-6 block">{form.eyebrow}</span>
            <h1 className="font-headline italic font-light text-5xl md:text-8xl text-on-surface mb-10 leading-none">
              {form.title}
            </h1>
            <p className="font-body font-light text-xl text-on-surface-variant leading-relaxed">{form.body}</p>
          </div>

          <form className="space-y-12 mb-24" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="text-technical text-primary mb-3 block" htmlFor="contact-name">
                  {form.nameLabel}
                </label>
                <input
                  id="contact-name"
                  className={FIELD_CLASS}
                  placeholder={form.namePlaceholder}
                  type="text"
                  value={values.name}
                  onChange={(e) => update("name")(e.target.value)}
                />
              </div>
              <div>
                <label className="text-technical text-primary mb-3 block" htmlFor="contact-email">
                  {form.emailLabel}
                </label>
                <input
                  id="contact-email"
                  className={FIELD_CLASS}
                  placeholder={form.emailPlaceholder}
                  type="email"
                  value={values.email}
                  onChange={(e) => update("email")(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-technical text-primary mb-3 block" htmlFor="contact-subject">
                {form.subjectLabel}
              </label>
              <select
                id="contact-subject"
                className={`${FIELD_CLASS} appearance-none`}
                value={selectedSubject}
                onChange={(e) => update("subject")(e.target.value)}
              >
                {subjectOptions.map((subject, i) => (
                  <option key={i} className="bg-surface">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-technical text-primary mb-3 block" htmlFor="contact-message">
                {form.messageLabel}
              </label>
              <textarea
                id="contact-message"
                className={`${FIELD_CLASS} resize-none`}
                placeholder={form.messagePlaceholder}
                rows={2}
                value={values.message}
                onChange={(e) => update("message")(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-shine group flex items-center justify-center gap-4 bg-primary text-on-primary px-10 py-5 text-technical font-bold hover:brightness-110 transition-all w-fit disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : form.submit}
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
              {feedback && (
                <p className={`text-technical ${status === "error" ? "text-error" : "text-primary"}`}>{feedback}</p>
              )}
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 border-t border-outline-variant/30">
            <div>
              <span className="text-technical text-primary mb-6 block">{details.studioLabel}</span>
              <address className="not-italic font-body font-light text-on-surface-variant leading-loose text-lg">
                {details.addressLine1}
                <br />
                {details.addressLine2}
                <br />
                {details.addressLine3}
              </address>
            </div>
            <div>
              <span className="text-technical text-primary mb-6 block">{details.conciergeLabel}</span>
              <p className="font-body font-light text-on-surface-variant leading-loose text-lg">
                {details.email}
                <br />
                {details.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
