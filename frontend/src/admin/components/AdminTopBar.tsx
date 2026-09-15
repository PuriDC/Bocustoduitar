import { useState } from "react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  username?: string;
};

/**
 * Search filters the fields of the page being edited, which is the only index
 * this admin has — there are no orders or products to search across.
 */
export default function AdminTopBar({ query, onQueryChange, username }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <header
      className="fixed top-0 right-0 flex justify-between items-center z-40 border-b"
      style={{
        left: "260px",
        height: "64px",
        backgroundColor: "#f8f9fa",
        borderColor: "#c4c5d9",
        paddingLeft: "32px",
        paddingRight: "32px"
      }}
    >
      <div
        className={`flex items-center rounded-full px-4 py-2 transition-all duration-200 border ${
          focused ? "bg-white border-blue-500 shadow-sm w-[480px]" : "bg-[#f3f4f5] border-transparent w-96"
        }`}
      >
        <span className="material-symbols-outlined mr-2" style={{ color: "#434656", fontSize: "20px" }}>
          search
        </span>
        <input
          className="bg-transparent border-none focus:ring-0 w-full outline-none"
          placeholder="ค้นหาช่องเนื้อหาในหน้านี้..."
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ fontSize: "14px", color: "#191c1d" }}
        />
        {query && (
          <button onClick={() => onQueryChange("")} className="text-slate-400 hover:text-rose-500">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ backgroundColor: "#2e3132", color: "#e1e3e4" }}
        >
          {(username ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-bold text-slate-800">{username}</p>
          <p className="text-[11px] text-slate-500">ผู้ดูแลระบบ</p>
        </div>
      </div>
    </header>
  );
}
