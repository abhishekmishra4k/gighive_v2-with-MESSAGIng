// import { useEffect, useState } from 'react';
// import axios from 'axios';

// // Duplicate top-level dashboard logic removed — the Dashboard component defined below contains the correct useEffect and socket handling.
// import { io } from 'socket.io-client';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Button } from '../ui/button';
// import { Users, FileText, DollarSign, Star, Plus, ChevronRight, Award, Clock } from 'lucide-react';

// export function Dashboard({ user }) {
// // This function is already defined above, so we can remove this duplicate
//   const [stats, setStats] = useState([]);
//   const [activeGigs, setActiveGigs] = useState([]);
//   const [recentApplications, setRecentApplications] = useState([]);
//   const [analytics, setAnalytics] = useState([]);

//   // pagination state for applications
//   const [visibleApplications, setVisibleApplications] = useState([]);
//   const [page, setPage] = useState(0);
//   const pageSize = 5;

//   // map common string keys to icon components so stat.icon (string) resolves correctly
//   const iconMap = {
//     FileText: FileText,
//     filetext: FileText,
//     fileText: FileText,
//     Users: Users,
//     users: Users,
//     Award: Award,
//     award: Award,
//     DollarSign: DollarSign,
//     dollarSign: DollarSign
//   };

//   useEffect(() => {
//     // Use env config if available, fallback to localhost
//     const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
//       ? process.env.REACT_APP_API_URL
//       : (typeof window !== 'undefined' && window.REACT_APP_API_URL) || 'http://localhost:5001';

//     // Wait until user is loaded before creating sockets/requests
//     if (!user?.id) return;

//     const axiosInstance = axios.create({
//       baseURL: API_URL,
//       withCredentials: true,
//     });

//     let socket = null;
//     try {
//       socket = io(API_URL, {
//         auth: { userId: user?.id }
//       });
//     } catch (err) {
//       console.error('Failed to initialize socket:', err);
//     }

//     let mounted = true;

//     async function fetchDashboardData() {
//       try {
//         const [statsRes, gigsRes, appsRes, analyticsRes] = await Promise.all([
//           axiosInstance.get('/api/dashboard/stats'),
//           axiosInstance.get('/api/dashboard/gigs/active'),
//           axiosInstance.get('/api/dashboard/applications/recent'),
//           axiosInstance.get('/api/dashboard/analytics')
//         ]);
//         if (!mounted) return;

//         const statsData = statsRes?.data?.data ?? statsRes?.data;
//         const gigsData = gigsRes?.data?.data ?? gigsRes?.data;
//         const appsData = appsRes?.data?.data ?? appsRes?.data;
//         const analyticsData = analyticsRes?.data?.data ?? analyticsRes?.data;

//         setStats(Array.isArray(statsData) ? statsData : (statsData ? [statsData] : []));
//         setActiveGigs(Array.isArray(gigsData) ? gigsData : (gigsData ? gigsData : []));
//         setRecentApplications(Array.isArray(appsData) ? appsData : (appsData ? appsData : []));
//         setAnalytics(Array.isArray(analyticsData) ? analyticsData : (analyticsData ? [analyticsData] : []));
//       } catch (error)
//       // initialize visible applications with first page
//         setVisibleApplications(Array.isArray(appsData) ? appsData.slice(0, pageSize) : []);
//         setPage(1);
//       } catch (error)  {
//         console.error('Dashboard fetch error:', error);
//       }
//     }

//     fetchDashboardData();

//     if (socket) {
//       socket.on('connect', () => {
//         console.log('Dashboard socket connected:', socket.id);
//       });
//       socket.on('connect_error', err => {
//         console.error('Dashboard socket connect error:', err);
//       });

//       if (socket.onAny) {
//         socket.onAny((event, ...args) => {
//           console.debug('socket event:', event, args);
//         });
//       }

//       socket.on('gigUpdated', updatedGig => {
//         console.debug('gigUpdated received:', updatedGig);
//         if (!updatedGig || !updatedGig.id) return;
//         setActiveGigs(prev =>
//           (Array.isArray(prev) ? prev : []).map(gig => (gig.id === updatedGig.id ? updatedGig : gig))
//         );
//       });

//       socket.on('newApplication', application => {
//         console.debug('newApplication received:', application);
//         if (!application) return;
//         setRecentApplications(prev => (Array.isArray(prev) ? [application, ...prev] : [application]));
//       });

//       socket.on('statsUpdated', newStats => {
//         console.debug('statsUpdated received:', newStats);
//         setStats(Array.isArray(newStats) ? newStats : (newStats ? [newStats] : []));
//       });

//       socket.on('analyticsUpdated', newAnalytics => {
//         console.debug('analyticsUpdated received:', newAnalytics);
//         setAnalytics(Array.isArray(newAnalytics) ? newAnalytics : (newAnalytics ? [newAnalytics] : []));
//       });
//     }

//     return () => {
//       mounted = false;
//       try {
//         if (socket) {
//           if (socket.offAny) socket.offAny();
//           socket.removeAllListeners();
//           if (typeof socket.disconnect === 'function') socket.disconnect();
//         }
//       } catch (e) {
//         // ignore if not supported or already disconnected
//       }
//     };
//   }, [user?.id]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">
//             Welcome back, {user?.name?.split(' ')[0] || 'Employer'}!
//           </h1>
//           <p className="text-muted-foreground">
//             Here's an overview of your hiring activity.
//           </p>
//         </div>
//         <Button>
//           <Plus className="mr-2" size={16} />
//           Post New Gig
//         </Button>
//       </div>

//       {/* Stats Grid */}
// <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//   {stats.map((stat, index) => {
//     const Icon = iconMap[stat.icon] || FileText;
//     const key = stat._id || stat.id || stat.title || index;
//     return (
//       <Card key={key}>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//               <p className="text-2xl font-bold">{String(stat.value)}</p>
//               <p
//                 className={`text-xs ${
//                   stat.trend === "up"
//                     ? "text-green-600"
//                     : stat.trend === "down"
//                     ? "text-red-600"
//                     : "text-muted-foreground"
//                 }`}
//               >
//                 {stat.change || ""}
//               </p>
//             </div>
//             <Icon className="h-8 w-8 text-muted-foreground" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   })}
// </div>

// <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//   {/* Active Gigs */}
//   <Card className="lg:col-span-2">
//     <CardHeader>
//       <CardTitle className="flex items-center justify-between">
//         Active Gigs
//         <Button variant="ghost" size="sm">
//           View All <ChevronRight size={16} className="ml-1" />
//         </Button>
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-4">
//         {activeGigs.map((gig, index) => (
//           <div
//             key={gig._id || gig.id || index}
//             className="flex items-center justify-between p-4 border rounded-lg"
//           >
//             <div className="flex-1">
//               <h4 className="font-medium">{gig.title || "Untitled Gig"}</h4>
//               <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
//                 <span className="flex items-center gap-1">
//                   <Users size={14} />
//                   {(gig.applications?.length || gig.applications || 0)} applications
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock size={14} />
//                   {gig.deadline || "N/A"} left
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <DollarSign size={14} />
//                   {gig.budget || "$0"}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2 mt-2">
//                 <Badge variant={gig.status === "active" ? "default" : "secondary"}>
//                   {gig.status || "unknown"}
//                 </Badge>
//                 <span className="text-sm text-muted-foreground">
//                   {gig.responses || 0} responses pending
//                 </span>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm">
//                 View Applications
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </CardContent>
//   </Card>

//   {/* Recent Applications */}
//   <Card>
//     <CardHeader>
//       <CardTitle className="flex items-center justify-between">
//         Recent Applications
//         <Button variant="ghost" size="sm">
//           <ChevronRight size={16} />
//         </Button>
//       </CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="space-y-3">
//         {recentApplications.map((application, index) => (
//           <div
//             key={application._id || application.id || index}
//             className="p-3 border rounded-lg"
//           >
//             <div className="flex items-start justify-between mb-2">
//               <div className="flex-1">
//                 <h4 className="font-medium text-sm">
//                   {application.applicantName ||
//                     application.student?.name ||
//                     "Unknown"}
//                 </h4>
//                 <p className="text-xs text-muted-foreground">
//                   {application.university ||
//                     application.student?.university ||
//                     ""}
//                 </p>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                 <span className="text-xs">{application.rating || "0"}</span>
//               </div>
//             </div>
//             <p className="text-xs text-muted-foreground mb-2">
//               Applied for: {application.gigTitle || "Untitled Gig"}
//             </p>
//             <div className="flex items-center justify-between">
//               <Badge variant="secondary" className="text-xs">
//                 {application.experience
//                   ? `${application.experience} exp`
//                   : "N/A"}
//               </Badge>
//               <span className="text-xs text-muted-foreground">
//                 {application.appliedDate
//                   ? new Date(application.appliedDate).toLocaleString()
//                   : ""}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </CardContent>
//   </Card>
// </div>

// {/* Analytics */}
// <Card>
//   <CardHeader>
//     <CardTitle>Performance Analytics</CardTitle>
//   </CardHeader>
//   <CardContent>
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {analytics.map((analytic, index) => {
//         const key = analytic._id || analytic.id || analytic.metric || index;
//         return (
//           <div key={key} className="p-4 border rounded-lg text-center">
//             <p className="text-2xl font-bold mb-2">{String(analytic.value)}</p>
//             <p className="font-medium mb-1">{analytic.metric}</p>
//             <p className="text-sm text-muted-foreground mb-2">
//               {analytic.description || ""}
//             </p>
//             <p
//               className={`text-xs ${
//                 analytic.trend === "up"
//                   ? "text-green-600"
//                   : analytic.trend === "down"
//                   ? "text-red-600"
//                   : "text-muted-foreground"
//               }`}
//             >
//               {analytic.trend}
//             </p>
//           </div>
//         );
//       })}
//     </div>
//   </CardContent>
// </Card>

//     </div>
//   );
// }

// export default Dashboard;

import React, { useState, useEffect } from "react";
import apiClient from "../../lib/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import {
  FileText,
  Users,
  Award,
  Clock,
  Star,
  ChevronRight,
  Plus,
  IndianRupee,
} from "lucide-react";

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState([]);
  const [activeGigs, setActiveGigs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [visibleApplications, setVisibleApplications] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalApplications, setModalApplications] = useState([]);
  const [modalGigTitle, setModalGigTitle] = useState("");
  const [showAll, setShowAll] = useState(false);


  const location = useLocation();
  const navigate = useNavigate();

  const iconMap = {
    FileText,
    filetext: FileText,
    fileText: FileText,
    Users,
    users: Users,
    Award,
    award: Award,
    IndianRupee,
    indianrupee: IndianRupee,
  };

  useEffect(() => {
    const API_URL =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_API_URL) ||
      (typeof window !== "undefined" && window.REACT_APP_API_URL) ||
      "http://localhost:5001";

    if (!user?.id) return;

    const socket = io(API_URL, {
      auth: { userId: user?.id },
    });

    let mounted = true;

    async function fetchDashboardData() {
      try {
        const [statsRes, gigsRes, appsRes, analyticsRes] = await Promise.all([
          apiClient.get("/dashboard/stats").catch(() => null),
          apiClient.get("/dashboard/gigs/active").catch(() => null),
          apiClient.get("/dashboard/applications/recent").catch(() => null),
          apiClient.get("/dashboard/analytics").catch(() => null),
        ]);
        if (!mounted) return;

        const statsData = statsRes?.data?.data ?? statsRes?.data;
        const gigsData = gigsRes?.data?.data ?? gigsRes?.data;
        const appsData = appsRes?.data?.data ?? appsRes?.data;
        const analyticsData = analyticsRes?.data?.data ?? analyticsRes?.data;

        setStats(
          Array.isArray(statsData) ? statsData : statsData ? [statsData] : []
        );
        setActiveGigs(
          Array.isArray(gigsData) ? gigsData : gigsData ? gigsData : []
        );
        setRecentApplications(
          Array.isArray(appsData) ? appsData : appsData ? appsData : []
        );
        setAnalytics(
          Array.isArray(analyticsData)
            ? analyticsData
            : analyticsData
            ? [analyticsData]
            : []
        );

        setVisibleApplications(
          Array.isArray(appsData) ? appsData.slice(0, pageSize) : []
        );
        setPage(1);
        setExpanded(false);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    }

    fetchDashboardData();

    socket.on("newApplication", (application) => {
      if (!application || !application.appliedDate) return;

      setRecentApplications((prev) => {
        const exists = prev.some((app) => app._id === application._id);
        return exists ? prev : [application, ...prev];
      });

      setVisibleApplications((prev) => {
        const exists = prev.some((app) => app._id === application._id);
        const updated = exists ? prev : [application, ...prev];
        return expanded ? updated : updated.slice(0, pageSize * page);
      });
    });

    return () => {
      mounted = false;
      try {
        socket.removeAllListeners("newApplication");
        socket.disconnect();
      } catch (e) {
        console.error("Socket cleanup error:", e);
      }
    };
  }, [location.pathname, user?.id, expanded, pageSize, page]);

  const loadMoreApplications = () => {
    const nextApps = recentApplications.slice(
      page * pageSize,
      (page + 1) * pageSize
    );
    setVisibleApplications((prev) => [...prev, ...nextApps]);
    setPage((prev) => prev + 1);
    if (
      visibleApplications.length + nextApps.length >=
      recentApplications.length
    ) {
      setExpanded(true);
    }
  };

  const seeLessApplications = () => {
    setVisibleApplications(recentApplications.slice(0, pageSize));
    setPage(1);
    setExpanded(false);
  };

  const handleViewApplications = (gigTitle) => {
    const filtered = recentApplications.filter(
      (app) => app.gigTitle === gigTitle
    );
    setModalApplications(filtered);
    setModalGigTitle(gigTitle);
    setShowModal(true);
  };

  const handleViewProfile = (studentId) => {
    if (!studentId) return;
    window.location.href = `/student-profile/${studentId}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Employer"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your hiring activity.
          </p>
        </div>
        <Button onClick={() => navigate("/post-gig")}>
          <Plus className="mr-2" size={16} />
          Post New Gig
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon] || FileText;
          const key = stat._id || stat.id || stat.title || index;
          return (
            <Card key={key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{String(stat.value)}</p>
                    <p
                      className={`text-xs ${
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change || ""}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Gigs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Gigs
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (showAll) {
                    seeLessApplications();
                    setShowAll(false);
                  } else {
                    setVisibleApplications(recentApplications);
                    setExpanded(true);
                    setShowAll(true);
                  }
                }}
              >
                {showAll ? "View Less" : "View All"} <ChevronRight size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGigs.map((gig, index) => (
                <div
                  key={gig._id || gig.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {gig.title || "Untitled Gig"}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {Array.isArray(gig.applications) ? gig.applications.length : 0} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {gig.deadline || "N/A"} left
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee size={14} />
                        {gig.budget || "₹0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          gig.status === "active" ? "default" : "secondary"
                        }
                      >
                        {gig.status || "unknown"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {gig.responses || 0} responses pending
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplications(gig.title)}
                    >
                      View Applications
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Applications
              <Button variant="ghost" size="sm">
                <ChevronRight size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleApplications.map((application, index) => (
                <div
                  key={application._id || application.id || index}
                  className="p-3 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {application.applicantName ||
                          application.student?.name ||
                          ""}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {application.university ||
                          application.student?.university ||
                          ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">
                        {application.rating || "0"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    Applied for: {application.gigTitle || "Untitled Gig"}
                  </p>

                  {/* ✅ Applicant message preview */}
                  <div className="text-xs text-muted-foreground mb-2">
                    <strong>Message:</strong>{" "}
                    <div className="mt-1 bg-muted p-2 rounded whitespace-pre-wrap">
                      {application.message ||
                        application.proposal ||
                        "No message provided"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {application.experience
                        ? `${application.experience} exp`
                        : "N/A"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const raw = application?.appliedDate;
                        if (!raw) return "Date not available";

                        const parsed = Date.parse(raw);
                        if (isNaN(parsed)) return "Date not available";

                        return new Date(parsed).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Load More / See Less buttons */}
              {!expanded &&
                visibleApplications.length < recentApplications.length && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/applications")}
                    >
                      Load More
                    </Button>
                  </div>
                )}

              {expanded && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={seeLessApplications}
                  >
                    See Less
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.map((analytic, index) => {
              const key =
                analytic._id || analytic.id || analytic.metric || index;
              return (
                <div key={key} className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold mb-2">
                    {String(analytic.value)}
                  </p>
                  <p className="font-medium mb-1">{analytic.metric}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {analytic.description || ""}
                  </p>
                  <p
                    className={`text-xs ${
                      analytic.trend === "up"
                        ? "text-green-600"
                        : analytic.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {analytic.trend}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Applications Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Applications for: {modalGigTitle}
              </h2>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              {modalApplications.map((application, index) => (
                <div
                  key={application._id || index}
                  className="border p-4 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium">
                      {application.applicantName ||
                        application.student?.name ||
                        ""}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {application.student?.university || ""}
                    </p>
                    <p className="text-sm mt-1">
                      Experience: {application.experience || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applied on:{" "}
                      {new Date(application.appliedDate).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    {/* ✅ Student's message */}
                    <div className="mt-2 text-sm">
                      <strong className="text-muted-foreground">
                        Message from applicant:
                      </strong>
                      <div className="mt-1 p-2 rounded-md bg-muted text-muted-foreground whitespace-pre-wrap">
                        {application.message ||
                          application.proposal ||
                          "No message provided"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleViewProfile(application.student?._id)
                      }
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
