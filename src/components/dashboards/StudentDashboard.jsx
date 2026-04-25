import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { StudentSidebar } from '../student/StudentSidebar';
import { FindGigs }       from '../student/FindGigs';
import { GigReels }       from '../student/GigReels';
import { CollegeGigs }    from '../student/CollegeGigs';
import { Feed }           from '../student/Feed';
import { Collaboration }  from '../student/Collaboration';
import StudentMessages    from '../student/Messages';
import { Dashboard }      from '../student/Dashboard';
import { Credits }        from '../student/Credits';
import { Profile }        from '../student/Profile';
import { Settings }       from '../student/Settings';
import { PeopleDirectory } from '../shared/PeopleDirectory';
import { MobileNav }       from '../shared/MobileNav';

/**
 * 🎓 Student Dashboard
 *
 * Gets user directly from AuthContext (Zustand) — no prop drilling.
 */
export function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden h-screen">
      {/* Desktop-only Sidebar */}
      <aside className="hidden md:flex h-full border-r shrink-0">
        <StudentSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile-only Nav */}
        <MobileNav role="student" />

        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          <Routes>
            <Route index                 element={<Navigate to="/student-dashboard/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard user={user} />} />
            <Route path="find-gigs"      element={<FindGigs user={user} />} />
            <Route path="gig-reels"      element={<GigReels user={user} />} />
            <Route path="college-gigs"   element={<CollegeGigs user={user} />} />
            <Route path="feed"           element={<Feed user={user} />} />
            <Route path="collaboration"  element={<Collaboration user={user} />} />
            <Route path="messages"       element={<StudentMessages />} />
            <Route path="credits"        element={<Credits user={user} />} />
            <Route path="profile"        element={<Profile user={user} />} />
            <Route path="settings"       element={<Settings user={user} />} />
            <Route path="people"         element={<PeopleDirectory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
