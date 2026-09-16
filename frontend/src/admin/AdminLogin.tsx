import { useState } from "react";
import { useAdminAuth } from "./AuthContext";

const FIELD =
  "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-slate-50 text-slate-900 placeholder-slate-400 " +
  "border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-portal min-h-screen flex bg-[#f6f7f9]">
      {/* Brand panel, hidden on small screens where the form should own the view. */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#16181a] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f2ca50] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#16181a] leading-none">music_note</span>
          </div>
          <span className="font-bold text-lg">Bocusto Guitars</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4">ระบบจัดการเนื้อหาเว็บไซต์</h2>
          <p className="text-slate-400 leading-relaxed max-w-sm">
            แก้ข้อความและรูปภาพทุกส่วนของเว็บไซต์ พร้อมดูตัวอย่างหน้าจริงก่อนเผยแพร่
          </p>
        </div>

        <p className="text-xs text-slate-600">© 2024 Bocusto Guitars</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#16181a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#f2ca50] text-xl leading-none">music_note</span>
            </div>
            <span className="font-bold text-slate-900">Bocusto Guitars</span>
          </div>

          <h1 className="text-xl font-bold text-slate-900">เข้าสู่ระบบ</h1>
          <p className="text-[13px] text-slate-500 mt-1 mb-7">สำหรับผู้ดูแลระบบเท่านั้น</p>

          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5" htmlFor="admin-id">
            ชื่อผู้ใช้ หรือ อีเมล
          </label>
          <input
            id="admin-id"
            autoFocus
            autoComplete="username"
            className={`${FIELD} mb-5`}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5" htmlFor="admin-pw">
            รหัสผ่าน
          </label>
          <input
            id="admin-pw"
            type="password"
            autoComplete="current-password"
            className={`${FIELD} mb-6`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="flex items-start gap-2 text-[13px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5 mb-5">
              <span className="material-symbols-outlined text-lg leading-none shrink-0">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-60"
          >
            {busy && <span className="material-symbols-outlined text-lg leading-none animate-spin">progress_activity</span>}
            {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <p className="text-xs text-slate-400 mt-6 leading-relaxed">
            บัญชีผู้ดูแลของ Bocusto Luthier ใช้เข้าสู่ระบบที่นี่ได้เช่นกัน
          </p>
        </form>
      </div>
    </div>
  );
}
