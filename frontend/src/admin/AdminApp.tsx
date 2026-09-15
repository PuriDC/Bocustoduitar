import { AdminAuthProvider, useAdminAuth } from "./AuthContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function AdminGate() {
  const { user, checking } = useAdminAuth();

  if (checking) {
    return (
      <div className="admin-portal min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-600 border-slate-200 animate-spin" />
          <p className="text-slate-600 font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return user ? <AdminDashboard /> : <AdminLogin />;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
