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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile-only Nav */}
      <MobileNav role="employer" />

      {/* Desktop-only Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <EmployerSidebar />
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0 pb-20 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard user={user} />} />
            <Route path="post-gig"       element={<PostGig user={user} />} />
            <Route path="applications"   element={<Applications user={user} />} />
            <Route path="messages/:userId" element={<Messages />} />
            <Route path="messages"       element={<Messages />} />
            <Route path="plans"          element={<Plans user={user} />} />
            <Route path="people"         element={<PeopleDirectory />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default EmployerDashboard;
