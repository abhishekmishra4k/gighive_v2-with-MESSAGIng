import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../lib/apiClient";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui";
import {
  Users,
  Star,
  MessageSquare,
  Eye,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { staggerContainer, cardVariants } from "../../lib/animations";

export function Applications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [messagingId, setMessagingId] = useState(null); // track which applicant we're opening
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = authUser || user;

  // ─── Fetch applications via apiClient ───
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/gigs/applications');
        setApplications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch applications:", err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // ─── Real-time update via socket — skipped (socket managed globally) ───

  // ─── Update application status via apiClient ───
  const updateStatus = async (gigTitle, studentId, newStatus) => {
    try {
      await apiClient.put('/gigs/update-status', { gigTitle, studentId, status: newStatus });
      setApplications(prev =>
        prev.map(app =>
          app?.applicant?._id === studentId && app?.gigTitle === gigTitle
            ? { ...app, status: newStatus }
            : app
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      toast.error('Failed to update status');
    }
  };

  // ─── Start conversation then navigate to messages ───
  const handleMessageClick = async (applicant) => {
    const myId = currentUser?._id || currentUser?.id;
    const studentId = applicant?._id;

    if (!myId || !studentId) return;

    setMessagingId(studentId);
    try {
      const res = await apiClient.post('/message/conversations/start', {
        initiatorId: myId,
        recipientId: studentId,
      });

      const conversation = res.data?.conversation;
      if (!conversation) throw new Error('No conversation returned');

      toast.success(`Opening chat with ${applicant.name}...`);
      navigate(`/employer-dashboard/messages`, {
        state: {
          openConversationId: conversation._id,
          otherUser: applicant,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start conversation');
    } finally {
      setMessagingId(null);
    }
  };

  const filteredApps =
    activeTab === "all"
      ? applications
      : applications.filter((app) => app?.status === activeTab);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Review and manage student applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
  {loading ? (
    <p className="text-muted-foreground text-center py-8">Loading applications...</p>
  ) : filteredApps.length === 0 ? (
    <p className="text-muted-foreground text-center py-8">No applications in this category</p>
  ) : (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
    {filteredApps.map((application, index) => {
      const applicant = application?.applicant ?? null;

      // ✅ Safe date formatting
    const formattedDate = (() => {
  const raw = application?.appliedDate;
  if (!raw || typeof raw !== "string") return "Date not available";

  const parsed = Date.parse(raw);
  if (isNaN(parsed)) return "Date not available";

  return new Date(parsed).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
})();


      return (
        <motion.div key={application._id ?? index} variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {application?.gigTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formattedDate}
                </p>
              </div>
              <Badge
                variant={
                  ["hired", "shortlisted", "declined"].includes(application?.status)
                    ? "default"
                    : "secondary"
                }
              >
                {application?.status ?? "unknown"}
              </Badge>
            </div>



                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Applicant Info */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                            <span className="font-semibold">
                              {applicant?.name
                                ? applicant.name.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {applicant?.name ?? "Unknown"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {applicant?.university ?? ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {applicant?.major ?? ""} • {applicant?.year ?? ""}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">
                              {applicant?.rating ?? "N/A"} rating
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {applicant?.completedGigs ?? 0} gigs completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Proposal & Actions */}
                      <div className="lg:col-span-2">
                        <h5 className="font-medium mb-2">Proposal</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          {application?.proposal ?? ""}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/profile/${applicant?._id ?? ""}`)
                            }
                          >
                            <Eye className="mr-2" size={16} /> View Profile
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus(application?.gigTitle, applicant?._id, "hired")
                            }
                          >
                            <Check className="mr-2" size={16} /> Hire
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMessageClick(applicant)}
                            disabled={messagingId === applicant?._id}
                          >
                            {messagingId === applicant?._id ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="animate-spin" size={14} /> Opening...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <MessageSquare size={16} /> Message
                              </span>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus(application?.gigTitle, applicant?._id, "shortlisted")
                            }
                          >
                            <Check className="mr-2" size={16} /> Shortlist
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatus(application?.gigTitle, applicant?._id, "declined")
                            }
                          >
                                                        <X className="mr-2" size={16} /> Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              );
            })}
          </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Applications;

