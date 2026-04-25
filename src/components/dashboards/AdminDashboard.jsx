import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Dashboard }    from '../admin/Dashboard';
import { Students }     from '../admin/Students';
import { Employers }    from '../admin/Employers';
import { Gigs }         from '../admin/Gigs';

/**
 * ⚙️ Admin Dashboard
 *
 * Gets user directly from AuthContext (Zustand) — no prop drilling.
 */
export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <AdminSidebar />

      <main className="flex-1 h-full overflow-y-auto">
        <Routes>
          <Route path="/"           element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard user={user} />} />
          <Route path="students"    element={<Students user={user} />} />
          <Route path="employers"   element={<Employers user={user} />} />
          <Route path="gigs"        element={<Gigs user={user} />} />
        </Routes>
      </main>
    </div>
  );
}