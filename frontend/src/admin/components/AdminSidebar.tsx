import type { PageKey } from "../../content/defaults";

export type AdminNavItem = { key: PageKey; label: string; icon: string; path: string };

/** Sidebar order and icons, mirroring the Bocusto Luthier admin portal. */
export const ADMIN_PAGES: AdminNavItem[] = [
  { key: "common", label: "ส่วนร่วม (เมนู/ท้ายเว็บ)", icon: "dashboard", path: "/" },
  { key: "home", label: "ตั้งค่าหน้าแรก", icon: "home", path: "/" },
  { key: "about", label: "เกี่ยวกับเรา", icon: "description", path: "/about" },
  { key: "models", label: "รุ่นกีตาร์", icon: "queue_music", path: "/models" },
  { key: "available", label: "สินค้าพร้อมส่ง", icon: "inventory_2", path: "/available" },
  { key: "order", label: "สั่งทำพิเศษ", icon: "handyman", path: "/order" },
  { key: "gallery", label: "แกลเลอรี", icon: "photo_library", path: "/gallery" },
  { key: "events", label: "กิจกรรมและข่าว", icon: "event", path: "/events" },
  { key: "contact", label: "ติดต่อเรา", icon: "mail", path: "/contact" }
];

type Props = {
  current: PageKey;
  onSelect: (page: PageKey) => void;
  onLogout: () => void;
  /** Pages carrying at least one saved override get a marker. */
  editedPages: Set<string>;
};

export default function AdminSidebar({ current, onSelect, onLogout, editedPages }: Props) {
  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col py-8 px-4 z-50 custom-scrollbar-dark overflow-y-auto"
      style={{ width: "260px", backgroundColor: "#2e3132" }}
    >
      <div className="mb-10 px-2">
        <h1 className="font-bold leading-none" style={{ color: "#e1e3e4", fontSize: "18px" }}>
          Bocusto Guitars
        </h1>
        <p
          className="uppercase mt-1 font-semibold"
          style={{ fontSize: "9px", letterSpacing: "0.1em", color: "#e1e3e4", opacity: 0.6 }}
        >
          ระบบจัดการเนื้อหา
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {ADMIN_PAGES.map((item) => {
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 ease-in-out ${
                isActive ? "font-bold opacity-100" : "opacity-60 hover:opacity-100 hover:bg-white/10"
              }`}
              style={{
                color: isActive ? "#dde1ff" : "#e1e3e4",
                backgroundColor: isActive ? "rgba(255,255,255,0.1)" : undefined
              }}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="flex-1" style={{ fontSize: "14px" }}>
                {item.label}
              </span>
              {editedPages.has(item.key) && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#f2ca50" }} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t pt-6 mt-6" style={{ borderColor: "rgba(225,227,228,0.1)" }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 ease-in-out opacity-60 hover:opacity-100 hover:bg-white/10"
          style={{ color: "#e1e3e4" }}
        >
          <span className="material-symbols-outlined">logout</span>
          <span style={{ fontSize: "14px" }}>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
