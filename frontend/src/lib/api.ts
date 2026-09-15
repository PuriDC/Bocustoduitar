import { useCallback, useState } from "react";

export type SubscribeStatus = "idle" | "loading" | "success" | "error";

/** Newsletter signup state, shared by every section that offers the form. */
export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [message, setMessage] = useState("");

  const subscribe = useCallback(async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Subscription failed.");
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Subscription failed.");
    }
  }, [email]);

  return { email, setEmail, status, message, subscribe };
}
