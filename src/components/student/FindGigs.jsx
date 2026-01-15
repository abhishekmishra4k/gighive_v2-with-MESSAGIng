// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import {
//   Search,
//   Filter,
//   MapPin,
//   Clock,
//   DollarSign,
//   Star,
//   Bookmark,
//   Zap
// } from 'lucide-react';

// export function FindGigs({ user }) {
//   const [searchTerm, setSearchTerm] = useState('');

//   const gigs = [
//     {
//       id: 1,
//       title: "React Developer for E-commerce Platform",
//       company: "TechStart Inc.",
//       location: "Remote",
//       type: "Part-time",
//       duration: "3 months",
//       pay: "$25/hour",
//       credits: 150,
//       description: "Looking for a skilled React developer to help build our new e-commerce platform...",
//       skills: ["React", "JavaScript", "CSS", "Node.js"],
//       posted: "2 hours ago",
//       applicants: 23,
//       urgent: true,
//       aiMatch: 95
//     },
//     {
//       id: 2,
//       title: "UI/UX Designer for Mobile App",
//       company: "DesignFlow Studio",
//       location: "San Francisco, CA",
//       type: "Project",
//       duration: "6 weeks",
//       pay: "$30/hour",
//       credits: 200,
//       description: "Create intuitive user interface designs for our fitness tracking mobile app...",
//       skills: ["Figma", "UI Design", "Mobile", "Prototyping"],
//       posted: "4 hours ago",
//       applicants: 18,
//       urgent: false,
//       aiMatch: 88
//     }
//   ];

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold">Find Gigs</h1>
//         <p className="text-muted-foreground">Discover opportunities that match your skills</p>
//       </div>

//       {/* Search and Filters */}
//       <div className="mb-6 space-y-4">
//         <div className="flex gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
//             <Input
//               placeholder="Search gigs, companies, or skills..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Button variant="outline">
//             <Filter size={16} className="mr-2" />
//             Filters
//           </Button>
//           <Button variant="outline">
//             <Zap size={16} className="mr-2" />
//             AI Search
//           </Button>
//         </div>

//         {/* Quick Filters */}
//         <div className="flex gap-2 flex-wrap">
//           {['Remote', 'Part-time', 'Tech', 'Design', 'Urgent', 'High Pay'].map((filter) => (
//             <Badge key={filter} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
//               {filter}
//             </Badge>
//           ))}
//         </div>
//       </div>

//       {/* AI Recommendations */}
//       <Card className="mb-6 border-primary/20 bg-primary/5">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Zap className="text-primary" size={20} />
//             AI Recommendations for You
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-muted-foreground mb-4">
//             Based on your skills in React, JavaScript, and UI Design, we found these perfect matches:
//           </p>
//           <div className="flex gap-2">
//             <Badge variant="outline">3 Perfect Matches</Badge>
//             <Badge variant="outline">8 Good Matches</Badge>
//             <Badge variant="outline">15 Relevant Gigs</Badge>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Gig List */}
//       <div className="space-y-6">
//         {gigs.map((gig) => (
//           <Card key={gig.id} className="hover:shadow-lg transition-shadow">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-2">
//                     <h3 className="text-xl font-semibold">{gig.title}</h3>
//                     {gig.urgent && <Badge variant="destructive">Urgent</Badge>}
//                     <Badge variant="outline" className="text-green-600 border-green-600">
//                       {gig.aiMatch}% AI Match
//                     </Badge>
//                   </div>
//                   <p className="text-muted-foreground font-medium">{gig.company}</p>
//                 </div>
//                 <Button variant="ghost" size="sm">
//                   <Bookmark size={16} />
//                 </Button>
//               </div>

//               <p className="text-muted-foreground mb-4">{gig.description}</p>

//               <div className="flex flex-wrap gap-2 mb-4">
//                 {gig.skills.map((skill, index) => (
//                   <Badge key={index} variant="outline">{skill}</Badge>
//                 ))}
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                 <div className="flex items-center gap-2">
//                   <MapPin size={16} className="text-muted-foreground" />
//                   <span className="text-sm">{gig.location}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock size={16} className="text-muted-foreground" />
//                   <span className="text-sm">{gig.duration}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <DollarSign size={16} className="text-muted-foreground" />
//                   <span className="text-sm">{gig.pay}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Star size={16} className="text-yellow-500" />
//                   <span className="text-sm">{gig.credits} Credits</span>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm text-muted-foreground">
//                     {gig.applicants} applicants • Posted {gig.posted}
//                   </span>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="outline">
//                     View Details
//                   </Button>
//                   <Button>
//                     Apply Now
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="text-center mt-8">
//         <Button variant="outline" size="lg">
//           Load More Gigs
//         </Button>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  Zap,
} from "lucide-react";

import { toast } from "react-toastify";

export function FindGigs({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGig, setSelectedGig] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const handleApply = async (gigId) => {
    try {
      await axios.post(
        `http://localhost:5001/api/gigs/${gigId}/apply`,
        {
          message: applicationMessage, // ✅ student's description
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Application submitted!");
      setApplicationMessage("");
      setSelectedGig(null);
    } catch (err) {
      console.error("Apply error:", err);
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  };

  // 🔄 Fetch gigs from backend
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/gigs");
        const data = await res.json();
        setGigs(data);
      } catch (err) {
        console.error("❌ Failed to fetch gigs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  // 🔍 Filter gigs by search term
  const filteredGigs = gigs.filter(
    (gig) =>
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Find Gigs
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Discover opportunities that align with your passion and skill set
            </p>
          </div>
        </div>

        {/* Search & Global Filters */}
        <div className="mt-10 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              {/* <Search className="text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} /> */}
            </div>
            <Input
              placeholder="Search by title, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-lg"
            />
          </div>
          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </Button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
          {["Remote", "Part-time", "Tech", "Design", "Urgent", "High Pay"].map(
            (filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all whitespace-nowrap"
              >
                {filter}
              </Badge>
            )
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Main Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-200/50 animate-pulse rounded-3xl"
                />
              ))}
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No Gigs Found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or filters to find more opportunities.
              </p>
            </div>
          ) : (
            filteredGigs.map((gig) => {
              const id = gig._id || gig.id;
              const isExpanded = !!expanded[id];
              const desc = gig.description || "";
              const shortDesc =
                desc.length > 200 ? desc.slice(0, 200) + "..." : desc;

              return (
                <Card
                  key={id}
                  className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-8">
                    {/* Top Row: Urgent Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2">
                        {gig.urgent && (
                          <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold ring-1 ring-red-500/20">
                            Urgent
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-slate-100 -mt-2 -mr-2"
                      >
                        <Bookmark size={20} />
                      </Button>
                    </div>

                    {/* Content Row */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors mb-2 leading-tight">
                          {gig.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 font-medium mb-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-900 text-sm italic">
                            {gig.company?.charAt(0) || "U"}
                          </div>
                          {gig.company || "Unknown Company"}
                        </div>

                        <div className="text-slate-600 text-sm leading-relaxed mb-6">
                          {isExpanded ? desc : shortDesc}
                          {desc.length > 200 && (
                            <button
                              onClick={() => toggleExpand(id)}
                              className="ml-2 text-slate-900 font-bold hover:underline"
                            >
                              {isExpanded ? "Show Less" : "Read More"}
                            </button>
                          )}
                        </div>

                        {/* Bento Grid Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <MapPin size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Location
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">
                              {gig.location}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Clock size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Duration
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">
                              {gig.duration}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              ₹
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                PAYMENT
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">
                              {typeof gig.pay === "object"
                                ? gig.pay?.amount
                                : gig.pay}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Star size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Credits
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900">
                              {gig.credits || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedGig(gig)}
                          className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => setSelectedGig(gig)}
                          className="rounded-xl bg-slate-900 hover:bg-black text-white font-bold px-6 shadow-md transition-all active:scale-[0.98]"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for Gig Details & Application */}
      {selectedGig && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col h-full max-h-[85vh] overflow-hidden relative">
            {/* Header */}
            <div className="p-8 pb-4">
              <button
                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 shadow-sm z-10"
                onClick={() => {
                  setSelectedGig(null);
                  setApplicationMessage("");
                }}
              >
                <span className="text-2xl">✕</span>
              </button>

              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold ring-1 ring-slate-200">
                    {selectedGig.duration}
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                  {selectedGig.title}
                </h2>
                <p className="text-xl text-slate-900 font-bold">
                  {selectedGig.company || "Unknown Company"}
                </p>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Pay rate
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {typeof selectedGig.pay === "object"
                      ? selectedGig.pay?.amount
                      : selectedGig.pay}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Location
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {selectedGig.location}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b-2 border-slate-100 pb-2">
                  Job Description
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedGig.description}
                </p>
              </div>

              {selectedGig.requirements?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 border-b-2 border-slate-100 pb-2">
                    Requirements
                  </h3>
                  <ul className="grid grid-cols-1 gap-3 text-slate-600">
                    {selectedGig.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium"
                      >
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b-2 border-slate-100 pb-2">
                  Application Message
                </h3>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none"
                  rows={4}
                  placeholder="Briefly explain why you're a good fit for this gig..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                />
              </div>
            </div>

            {/* Footer (Fixed at Bottom) */}
            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGig(null);
                  setApplicationMessage("");
                }}
                className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Close
              </Button>
              <Button
                onClick={() => handleApply(selectedGig._id || selectedGig.id)}
                className="flex-[2] h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
