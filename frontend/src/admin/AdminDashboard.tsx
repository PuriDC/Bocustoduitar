import { useCallback, useEffect, useMemo, useState } from "react";
import { useContent } from "../content/ContentContext";
import type { PageKey } from "../content/defaults";
import { applyOverrides, flatten, humanizePath } from "../content/paths";
import { useAdminAuth } from "./AuthContext";
import AdminSidebar, { ADMIN_PAGES } from "./components/AdminSidebar";
import FieldEditor from "./components/FieldEditor";
import SaveBar from "./components/SaveBar";
import Toast, { type ToastState } from "./components/Toast";
import PagePreview, { ROUTE_FOR_PAGE, type Viewport } from "./PagePreview";

export default function AdminDashboard() {
  const { content, overrides, refresh } = useContent();
  const { user, logout, authedFetch } = useAdminAuth();

  const [page, setPage] = useState<PageKey>("home");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const activePage = ADMIN_PAGES.find((p) => p.key === page)!;
  const fields = useMemo(() => flatten(content[page], page), [content, page]);

  // Group by the section directly under the page, preserving declaration order.
  const sections = useMemo(() => {
    const groups = new Map<string, typeof fields>();
    for (const field of fields) {
      const section = field.key.split(".")[1] ?? "general";
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section)!.push(field);
    }
    return [...groups.entries()];
  }, [fields]);

  useEffect(() => {
    setActiveSection(sections[0]?.[0] ?? null);
    setQuery("");
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirtyKeys = Object.keys(drafts);
  const dirtyPages = useMemo(() => new Set(dirtyKeys.map((k) => k.split(".")[0])), [dirtyKeys]);
  const editedPages = useMemo(() => new Set(Object.keys(overrides).map((k) => k.split(".")[0])), [overrides]);

  const searching = query.trim().length > 0;
  const visibleFields = useMemo(() => {
    if (searching) {
      const needle = query.trim().toLowerCase();
      return fields.filter((f) => f.key.toLowerCase().includes(needle) || f.value.toLowerCase().includes(needle));
    }
    return sections.find(([name]) => name === activeSection)?.[1] ?? [];
  }, [searching, query, fields, sections, activeSection]);

  // The preview renders published content with unsaved edits applied on top.
  const previewContent = useMemo(() => applyOverrides(content, drafts), [content, drafts]);

  /** Sends the raw bytes; the server validates the type from magic bytes. */
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const res = await authedFetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");
      return data.url as string;
    },
    [authedFetch]
  );

  const setDraft = (key: string, published: string, next: string) => {
    setDrafts((prev) => {
      const copy = { ...prev };
      if (next === published) delete copy[key];
      else copy[key] = next;
      return copy;
    });
  };

  const save = useCallback(async () => {
    if (!Object.keys(drafts).length || saving) return;
    setSaving(true);
    try {
      const res = await authedFetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drafts)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setDrafts({});
      await refresh();
      setToast({ kind: "success", message: `เผยแพร่ ${data.saved} รายการขึ้นเว็บแล้ว` });
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }, [drafts, saving, authedFetch, refresh]);

  // Ctrl/Cmd+S publishes, the way any editor would.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Nothing is auto-saved, so a reload would silently lose edits.
  useEffect(() => {
    if (!dirtyKeys.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyKeys.length]);

  const resetField = async (key: string) => {
    setDrafts((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    if (!(key in overrides)) return;
    try {
      const res = await authedFetch(`/api/content/${key}`, { method: "DELETE" });
      if (!res.ok) throw new Error("คืนค่าเดิมไม่สำเร็จ");
      await refresh();
      setToast({ kind: "success", message: "คืนค่าข้อความต้นฉบับแล้ว" });
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "คืนค่าเดิมไม่สำเร็จ" });
    }
  };

  const editedHere = fields.filter((f) => f.key in overrides).length;

  return (
    <div className="admin-portal min-h-screen bg-[#f6f7f9] text-slate-900">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <SaveBar count={dirtyKeys.length} saving={saving} onSave={save} onDiscard={() => setDrafts({})} />

      <AdminSidebar
        current={page}
        onSelect={setPage}
        onLogout={logout}
        editedPages={editedPages}
        dirtyPages={dirtyPages}
        username={user?.username}
      />

      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 pt-6 pb-0 sticky top-0 z-30">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">{activePage.label}</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {page === "common"
                  ? "แถบเมนูและท้ายเว็บ แสดงบนทุกหน้า"
                  : `${fields.length} ช่องที่แก้ไขได้`}
                {editedHere > 0 && <span className="text-slate-400"> · แก้ไปแล้ว {editedHere} ช่อง</span>}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] leading-none pointer-events-none">
                  search
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาช่องในหน้านี้"
                  className="w-56 lg:w-64 pl-10 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  title={showPreview ? "ซ่อนตัวอย่าง" : "แสดงตัวอย่าง"}
                  className={`p-2 rounded-md transition ${
                    showPreview ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">visibility</span>
                </button>
                {showPreview && (
                  <>
                    <button
                      onClick={() => setViewport("desktop")}
                      title="มุมมองคอมพิวเตอร์"
                      className={`p-2 rounded-md transition ${
                        viewport === "desktop" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] leading-none">desktop_windows</span>
                    </button>
                    <button
                      onClick={() => setViewport("mobile")}
                      title="มุมมองมือถือ"
                      className={`p-2 rounded-md transition ${
                        viewport === "mobile" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] leading-none">smartphone</span>
                    </button>
                  </>
                )}
              </div>

              <a
                href={activePage.path}
                target="_blank"
                rel="noreferrer"
                title="เปิดหน้าจริงในแท็บใหม่"
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
              >
                <span className="material-symbols-outlined text-[20px] leading-none">open_in_new</span>
              </a>
            </div>
          </div>

          {!searching && (
            <div className="flex gap-1 overflow-x-auto -mb-px">
              {sections.map(([name, sectionFields]) => {
                const dirtyHere = sectionFields.some((f) => f.key in drafts);
                const isActive = activeSection === name;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveSection(name)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {humanizePath(name)}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {sectionFields.length}
                    </span>
                    {dirtyHere && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col xl:flex-row items-stretch">
          <div
            className={`p-6 lg:p-8 ${dirtyKeys.length ? "pb-28" : "pb-10"} ${
              showPreview ? "xl:w-[46%] xl:shrink-0 xl:border-r xl:border-slate-200" : "max-w-5xl mx-auto w-full"
            }`}
          >
            {searching && (
              <p className="text-sm text-slate-500 mb-5">
                พบ <span className="font-bold text-slate-800">{visibleFields.length}</span> ช่องที่ตรงกับ “{query}”
              </p>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              {visibleFields.length === 0 ? (
                <div className="py-14 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                  <p className="text-sm text-slate-500 mt-2">ไม่พบช่องที่ตรงกับคำค้นหา</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${showPreview ? "grid-cols-1" : "md:grid-cols-2"}`}>
                  {visibleFields.map(({ key, value }) => (
                    <FieldEditor
                      key={key}
                      fieldKey={key}
                      published={value}
                      draft={drafts[key]}
                      isOverridden={key in overrides}
                      labelDepth={searching ? 1 : 2}
                      onChange={(next) => setDraft(key, value, next)}
                      onReset={() => void resetField(key)}
                      onUpload={uploadImage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {showPreview && (
            <div className="flex-1 min-w-0 bg-slate-100 flex flex-col">
              <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 min-w-0 text-center">
                  <span className="inline-block max-w-full truncate px-3 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-500">
                    bocustoguitar.com{ROUTE_FOR_PAGE[page]}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                    dirtyKeys.length ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {dirtyKeys.length ? "ฉบับร่าง" : "เผยแพร่แล้ว"}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <div className="rounded-xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
                  <PagePreview page={page} content={previewContent} viewport={viewport} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
