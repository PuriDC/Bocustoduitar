import { useEffect } from "react";

export type ToastState = { kind: "success" | "error"; message: string } | null;

/** Transient confirmation, so the save button does not have to carry status text. */
export default function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, toast.kind === "error" ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.kind === "error";

  return (
    <div
      role="status"
      className={`fixed top-6 right-6 z-[60] flex items-start gap-3 max-w-sm px-4 py-3 rounded-xl border shadow-lg animate-[fadeSlideDown_.18s_ease-out] ${
        isError ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
    >
      <span className="material-symbols-outlined text-xl leading-none shrink-0">
        {isError ? "error" : "check_circle"}
      </span>
      <p className="text-sm font-semibold leading-snug flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="opacity-50 hover:opacity-100 shrink-0" aria-label="ปิด">
        <span className="material-symbols-outlined text-lg leading-none">close</span>
      </button>
    </div>
  );
}
