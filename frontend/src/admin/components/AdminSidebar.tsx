import { useState } from "react";
import type { PageKey } from "../../content/defaults";
import logo from "../../assets/bocusto-logo.png";

/**
 * The sister site on the same VPS. Its admin is not a route — it is React state
 * behind a pushState that never changes the URL — so `?page=admin` is a query
 * its App.tsx reads on load to open the panel directly.
 *
 * The session does not travel: the token lives in localStorage, which is
 * per-origin, so the same account has to sign in again on the other domain.
 */
const SISTER_SITE = {
  name: "Bocusto Tonewood",
  home: "https://bocustotonewood.com",
  admin: "https://bocustotonewood.com/?page=admin"
};

export type AdminNavItem = { key: PageKey; label: string; icon: string; path: string };

/**
 * Sidebar order and icons — one entry per editable page.
 *
 * The shared chrome ("common": the navigation labels, footer, brand and
 * language toggle) is deliberately absent. Its content still ships in
 * `defaults.ts` and any override already saved for it is still applied; it
 * simply has no row here, so it cannot be edited from the panel.
 */
export const ADMIN_PAGES: AdminNavItem[] = [
  { key: "home", label: "หน้าแรก", icon: "home", path: "/" },
  { key: "about", label: "เกี่ยวกับเรา", icon: "info", path: "/about" },
  { key: "models", label: "รุ่นกีตาร์", icon: "queue_music", path: "/models" },
  { key: "available", label: "สินค้าพร้อมส่ง", icon: "inventory_2", path: "/available" },
  { key: "order", label: "สั่งทำพิเศษ", icon: "handyman", path: "/order" },
  { key: "gallery", label: "แกลเลอรี", icon: "photo_library", path: "/gallery" },
  { key: "events", label: "กิจกรรม & ข่าว", icon: "event", path: "/events" },
  { key: "contact", label: "ติดต่อเรา", icon: "mail", path: "/contact" }
];

type Props = {
  current: PageKey;
  onSelect: (page: PageKey) => void;
  onLogout: () => void;
  /** Pages holding at least one published override. */
  editedPages: Set<string>;
  /** Pages holding unsaved edits. */
  dirtyPages: Set<string>;
  username?: string;
};

export default function AdminSidebar({ current, onSelect, onLogout, editedPages, dirtyPages, username }: Props) {
  const [sisterOpen, setSisterOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] z-50 flex flex-col bg-[#16181a] text-slate-300">
      <div className="px-5 pt-6 pb-5">
        {/* The wordmark replaces both the placeholder tile and the set name —
            it already reads as "Bocusto Guitars", so repeating it in type
            beside the image would be the same words twice. */}
        <img src={logo} alt="Bocusto Guitars" width={129} height={50} className="h-10 w-auto mb-2.5" />
        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">ระบบจัดการเนื้อหา</p>
      </div>

      <p className="px-6 pb-2 text-[10px] uppercase tracking-[0.14em] text-slate-600 font-bold">หน้าเว็บไซต์</p>

      <nav className="flex-1 overflow-y-auto custom-scrollbar-dark px-3 pb-4 space-y-0.5">
        {ADMIN_PAGES.map((item) => {
          const isActive = current === item.key;
          const isDirty = dirtyPages.has(item.key);
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#f2ca50]" />}
              <span
                className="material-symbols-outlined text-[20px] leading-none shrink-0"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-sm truncate">{item.label}</span>
              {isDirty ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="มีการแก้ที่ยังไม่บันทึก" />
              ) : editedPages.has(item.key) ? (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" title="เคยแก้ไขแล้ว" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-0.5">
        <button
          onClick={() => setSisterOpen((open) => !open)}
          aria-expanded={sisterOpen}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition text-left"
        >
          <span className="material-symbols-outlined text-[20px] leading-none shrink-0">swap_horiz</span>
          <span className="flex-1 truncate">{SISTER_SITE.name}</span>
          <span
            className={`material-symbols-outlined text-[18px] leading-none shrink-0 transition-transform ${
              sisterOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {sisterOpen && (
          <div className="pl-6 space-y-0.5">
            <a
              href={SISTER_SITE.home}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">language</span>
              หน้าเว็บไซต์
            </a>
            <a
              href={SISTER_SITE.admin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">admin_panel_settings</span>
              หน้าผู้ดูแลระบบ
            </a>
          </div>
        )}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">open_in_new</span>
          เปิดเว็บไซต์
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition text-left"
        >
          <span className="material-symbols-outlined text-[20px] leading-none">logout</span>
          <span className="flex-1 truncate">ออกจากระบบ</span>
          {username && <span className="text-[11px] text-slate-600 truncate max-w-[70px]">{username}</span>}
        </button>
      </div>
    </aside>
  );
}
