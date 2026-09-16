type Props = {
  count: number;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

/**
 * Floating action bar. It exists only while there is something to save, so the
 * page header stays uncluttered the rest of the time.
 */
export default function SaveBar({ count, saving, onSave, onDiscard }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeSlideUp_.2s_ease-out]">
      <div className="flex items-center gap-4 pl-5 pr-2 py-2 rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/25 border border-white/10">
        <span className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {count} รายการยังไม่บันทึก
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDiscard}
            disabled={saving}
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-sm font-bold transition active:scale-95 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg leading-none">
              {saving ? "progress_activity" : "cloud_upload"}
            </span>
            {saving ? "กำลังบันทึก..." : "เผยแพร่"}
            <kbd className="hidden sm:inline text-[10px] font-sans font-medium bg-white/20 rounded px-1.5 py-0.5">
              Ctrl S
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
