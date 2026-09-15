import { useEffect, useMemo, useState } from "react";
import { useContent } from "../content/ContentContext";
import type { PageKey } from "../content/defaults";
import { applyOverrides, flatten, humanizePath, isImageField, isLongText } from "../content/paths";
import { useAdminAuth } from "./AuthContext";
import AdminSidebar, { ADMIN_PAGES } from "./components/AdminSidebar";
import AdminTopBar from "./components/AdminTopBar";
import PagePreview from "./PagePreview";

const INPUT_CLASS =
  "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-blue-600 text-slate-950 font-semibold bg-slate-50 border-slate-300 placeholder-slate-400";
const LABEL_CLASS = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

type Toast = { kind: "idle" | "saving" | "ok" | "error"; message: string };

export default function AdminDashboard() {
  const { content, overrides, refresh } = useContent();
  const { user, logout, authedFetch } = useAdminAuth();

  const [page, setPage] = useState<PageKey>("home");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [toast, setToast] = useState<Toast>({ kind: "idle", message: "" });

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

  // Reset the tab whenever the page changes, and keep it valid.
  useEffect(() => {
    setActiveSection(sections[0]?.[0] ?? null);
    setQuery("");
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirtyKeys = Object.keys(drafts);

  // A search spans every section; otherwise only the selected tab is shown.
  const searching = query.trim().length > 0;
  const visibleFields = useMemo(() => {
    if (searching) {
      const needle = query.trim().toLowerCase();
      return fields.filter((f) => f.key.toLowerCase().includes(needle) || f.value.toLowerCase().includes(needle));
    }
    return sections.find(([name]) => name === activeSection)?.[1] ?? [];
  }, [searching, query, fields, sections, activeSection]);

  // What the preview renders: published content with unsaved edits applied.
  const previewContent = useMemo(() => applyOverrides(content, drafts), [content, drafts]);
  const editedPages = useMemo(() => new Set(Object.keys(overrides).map((k) => k.split(".")[0])), [overrides]);

  const setDraft = (key: string, published: string, next: string) => {
    setDrafts((prev) => {
      const copy = { ...prev };
      if (next === published) delete copy[key];
      else copy[key] = next;
      return copy;
    });
    setToast({ kind: "idle", message: "" });
  };

  const readFileAsDataUrl = (key: string, published: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraft(key, published, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!dirtyKeys.length) return;
    setToast({ kind: "saving", message: "กำลังบันทึก..." });
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
      setToast({ kind: "ok", message: `บันทึกแล้ว ${data.saved} รายการ` });
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    }
  };

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
      setToast({ kind: "ok", message: "คืนค่าข้อความต้นฉบับแล้ว" });
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "คืนค่าเดิมไม่สำเร็จ" });
    }
  };

  return (
    <div className="admin-portal min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <AdminSidebar current={page} onSelect={setPage} onLogout={logout} editedPages={editedPages} />
      <AdminTopBar query={query} onQueryChange={setQuery} username={user?.username} />

      <main style={{ marginLeft: "260px", paddingTop: "64px" }} className="min-h-screen flex flex-col">
        <div
          className="px-8 py-5 border-b bg-white flex flex-wrap justify-between items-center gap-4"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div>
            <h2 className="font-bold text-2xl text-slate-800 tracking-tight">{activePage.label}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {fields.length} ช่องที่แก้ไขได้ · แก้แล้วกด “บันทึกการเปลี่ยนแปลง” เพื่อเผยแพร่ขึ้นเว็บจริง
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {toast.message && (
              <span
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg border ${
                  toast.kind === "error"
                    ? "text-rose-600 bg-rose-50 border-rose-200"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}
              >
                {toast.message}
              </span>
            )}
            <a
              href={activePage.path}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              เปิดหน้าจริง
            </a>
            <button
              onClick={() => setShowPreview((prev) => !prev)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showPreview
                  ? "bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{showPreview ? "visibility_off" : "visibility"}</span>
              {showPreview ? "ซ่อนตัวอย่าง" : "แสดงตัวอย่าง"}
            </button>
            <button
              onClick={() => setDrafts({})}
              disabled={!dirtyKeys.length}
              className="px-4 py-2 rounded-lg border text-sm font-semibold bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              ยกเลิกที่แก้
            </button>
            <button
              onClick={save}
              disabled={!dirtyKeys.length || toast.kind === "saving"}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              บันทึกการเปลี่ยนแปลง
              {dirtyKeys.length > 0 && (
                <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs">{dirtyKeys.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col xl:flex-row items-stretch">
          <div
            className={`p-8 overflow-y-auto custom-scrollbar transition-all duration-300 border-r ${
              showPreview ? "xl:w-[46%] xl:shrink-0" : "max-w-5xl mx-auto w-full"
            }`}
            style={{ borderColor: "#e2e8f0" }}
          >
            {searching ? (
              <p className="text-sm text-slate-500 mb-6">
                พบ {visibleFields.length} ช่องที่ตรงกับ “{query}” — ล้างช่องค้นหาเพื่อกลับไปดูตามหมวด
              </p>
            ) : (
              <div className="flex flex-wrap border-b mb-6" style={{ borderColor: "#e2e8f0" }}>
                {sections.map(([name, sectionFields]) => {
                  const dirtyHere = sectionFields.some((f) => f.key in drafts);
                  return (
                    <button
                      key={name}
                      onClick={() => setActiveSection(name)}
                      className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all ${
                        activeSection === name
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {humanizePath(name)}
                      {dirtyHere && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="space-y-6 bg-white p-6 rounded-2xl border"
              style={{ borderColor: "#e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)" }}
            >
              {visibleFields.length === 0 && <p className="text-sm text-slate-500">ไม่พบช่องที่ตรงกับคำค้นหา</p>}

              {visibleFields.map(({ key, value: published }) => {
                const value = drafts[key] ?? published;
                const isOverridden = key in overrides;
                const isDirty = key in drafts;
                const label = humanizePath(key.split(".").slice(searching ? 1 : 2).join(".")) || humanizePath(key);

                return (
                  <div key={key} className={isDirty ? "border-l-2 border-amber-400 pl-4 -ml-4" : ""}>
                    <div className="flex items-start justify-between gap-4">
                      <label className={LABEL_CLASS} htmlFor={key}>
                        {label}
                      </label>
                      {(isOverridden || isDirty) && (
                        <button
                          onClick={() => resetField(key)}
                          className="text-[11px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">undo</span>
                          คืนค่าเดิม
                        </button>
                      )}
                    </div>

                    {isImageField(key, published) ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            id={key}
                            type="text"
                            className={INPUT_CLASS}
                            value={value}
                            placeholder="ใส่ URL รูปภาพ หรือ อัปโหลดไฟล์"
                            onChange={(e) => setDraft(key, published, e.target.value)}
                          />
                          <label className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap">
                            <span className="material-symbols-outlined text-base">cloud_upload</span>
                            เลือกไฟล์
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) readFileAsDataUrl(key, published, file);
                              }}
                            />
                          </label>
                        </div>
                        {value && (
                          <img
                            src={value}
                            alt=""
                            className="w-full h-36 object-cover rounded-lg border border-slate-200 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.opacity = "0.15";
                            }}
                          />
                        )}
                        {value.startsWith("data:image") && (
                          <span className="inline-block text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            โหลดไฟล์โลคอลสำเร็จ
                          </span>
                        )}
                      </div>
                    ) : isLongText(published) ? (
                      <textarea
                        id={key}
                        rows={4}
                        className={`${INPUT_CLASS} resize-y`}
                        value={value}
                        onChange={(e) => setDraft(key, published, e.target.value)}
                      />
                    ) : (
                      <input
                        id={key}
                        type="text"
                        className={INPUT_CLASS}
                        value={value}
                        onChange={(e) => setDraft(key, published, e.target.value)}
                      />
                    )}

                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono break-all">{key}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {showPreview && (
            <div className="flex-1 bg-slate-900 flex flex-col min-w-0">
              <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between sticky top-0 z-10">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">desktop_windows</span>
                  ตัวอย่างหน้าเว็บจริง
                </span>
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800/40 px-2 py-0.5 rounded text-[10px] normal-case tracking-normal">
                  {dirtyKeys.length ? "กำลังแสดงฉบับร่างที่ยังไม่บันทึก" : "อัปเดตอัตโนมัติ"}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-slate-800">
                  <PagePreview page={page} content={previewContent} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
