import { useState } from "react";
import { useAdminAuth } from "./AuthContext";

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
    <div className="admin-portal min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#f8f9fa" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border"
        style={{ borderColor: "#e2e8f0", boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: "#2e3132" }}
        >
          <span className="material-symbols-outlined" style={{ color: "#f2ca50" }}>
            admin_panel_settings
          </span>
        </div>

        <h1 className="font-bold text-2xl text-slate-800 tracking-tight">Bocusto Guitars</h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">ระบบจัดการเนื้อหาเว็บไซต์</p>

        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="admin-id">
          ชื่อผู้ใช้ หรือ อีเมล
        </label>
        <input
          id="admin-id"
          autoFocus
          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-blue-600 text-slate-950 font-semibold bg-slate-50 border-slate-300 mb-5"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="admin-pw">
          รหัสผ่าน
        </label>
        <input
          id="admin-pw"
          type="password"
          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-blue-600 text-slate-950 font-semibold bg-slate-50 border-slate-300 mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-6">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">login</span>
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="text-xs text-slate-400 mt-8 leading-relaxed">
          บัญชีผู้ดูแลของ Bocusto Luthier ใช้เข้าสู่ระบบที่นี่ได้เช่นกัน
        </p>
      </form>
    </div>
  );
}
