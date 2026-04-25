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
    <div className="h-screen overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Mobile-only Nav */}
      <MobileNav role="student" />

      {/* Desktop-only Sidebar */}
      <div className="hidden md:flex h-full border-r">
        <StudentSidebar />
      </div>

        <div className="flex-1 h-full overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
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
        </div>
    </div>
  );
}
