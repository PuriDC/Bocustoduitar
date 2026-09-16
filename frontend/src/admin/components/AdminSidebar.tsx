import type { PageKey } from "../../content/defaults";

export type AdminNavItem = { key: PageKey; label: string; icon: string; path: string };

/** Sidebar order and icons. "common" is the shared chrome, not a page of its own. */
export const ADMIN_PAGES: AdminNavItem[] = [
  { key: "common", label: "เมนู & ท้ายเว็บ", icon: "dashboard_customize", path: "/" },
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
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] z-50 flex flex-col bg-[#16181a] text-slate-300">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f2ca50] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#16181a] text-xl leading-none">music_note</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-[15px] leading-tight truncate">Bocusto Guitars</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">ระบบจัดการเนื้อหา</p>
          </div>
        </div>
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
