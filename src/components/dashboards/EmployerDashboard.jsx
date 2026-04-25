import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import EmployerSidebar from '../employer/EmployerSidebar';
import PostGig         from '../employer/PostGig';
import Applications    from '../employer/Applications';
import Messages        from '../employer/Messages';
import Dashboard       from '../employer/Dashboard';
import Plans           from '../employer/Plans';
import { PeopleDirectory } from '../shared/PeopleDirectory';
import { MobileNav }       from '../shared/MobileNav';

/**
 * 💼 Employer Dashboard
 *
 * Gets user directly from AuthContext (Zustand) — no prop drilling.
 * Socket singleton is managed inside Messages.jsx itself.
 */
function EmployerDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden h-screen">
      {/* Desktop-only Sidebar */}
      <aside className="hidden md:flex h-full border-r shrink-0">
        <EmployerSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile-only Nav (appears at top on mobile) */}
        <MobileNav role="employer" />

        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          <Routes>
            <Route index element={<Navigate to="/employer-dashboard/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="post-gig" element={<PostGig user={user} />} />
            <Route path="applications" element={<Applications user={user} />} />
            <Route path="messages/:userId" element={<Messages />} />
            <Route path="messages" element={<Messages />} />
            <Route path="plans" element={<Plans user={user} />} />
            <Route path="people" element={<PeopleDirectory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EmployerDashboard;
