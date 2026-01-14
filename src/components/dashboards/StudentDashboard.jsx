import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentSidebar } from '../student/StudentSidebar';
import { FindGigs } from '../student/FindGigs';
import { GigReels } from '../student/GigReels';
import { CollegeGigs } from '../student/CollegeGigs';
import { Feed } from '../student/Feed';
import { Collaboration } from '../student/Collaboration';
import StudentMessages from '../student/Messages'; // ✅ fixed import
import { Dashboard } from '../student/Dashboard';
import { Credits } from '../student/Credits';
import { Profile } from '../student/Profile';
import { Settings } from '../student/Settings';

export function StudentDashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-background flex">
      <StudentSidebar user={user} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/student-dashboard/find-gigs" />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/find-gigs" element={<FindGigs user={user} />} />
          <Route path="/gig-reels" element={<GigReels user={user} />} />
          <Route path="/college-gigs" element={<CollegeGigs user={user} />} />
          <Route path="/feed" element={<Feed user={user} />} />
          <Route path="/collaboration" element={<Collaboration user={user} />} />
          <Route path="/messages" element={<StudentMessages user={user} />} /> {/* ✅ fixed */}
          <Route path="/credits" element={<Credits user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
        </Routes>
      </main>
    </div>
  );
}
