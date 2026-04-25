import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Star,
  Bookmark,
  ChevronRight,
  Award,
  Users,
  Target,
} from "lucide-react";

export function Dashboard({ user }) {
  const navigate = useNavigate();

  const handleApplyToNewGigs = () => {
    navigate("/student-dashboard/find-gigs");
  };

  const stats = [
    {
      title: "Total Earnings",
      value: "$2,450",
      change: "+12% from last month",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Gigs Completed",
      value: "23",
      change: "+3 this month",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Credits Earned",
      value: user?.credits || "850",
      change: "+150 this week",
      icon: Award,
      trend: "up",
    },
    {
      title: "Average Rating",
      value: "4.9",
      change: "Excellent feedback",
      icon: Star,
      trend: "stable",
    },
  ];

  const recentGigs = [
    {
      id: 1,
      title: "React Component Development",
      company: "TechStart Inc.",
      status: "completed",
      pay: "$450",
      rating: 5,
      completedDate: "2 days ago",
    },
    {
      id: 2,
      title: "UI Design for Mobile App",
      company: "DesignFlow",
      status: "in-progress",
      pay: "$350",
      progress: 75,
      dueDate: "3 days",
    },
    {
      id: 3,
      title: "Content Writing",
      company: "ContentCorp",
      status: "pending",
      pay: "$200",
      submittedDate: "1 day ago",
    },
  ];

  const savedGigs = [
    {
      id: 1,
      title: "Python Data Analysis",
      company: "DataLabs",
      pay: "$35/hour",
      type: "Remote",
      urgent: true,
    },
    {
      id: 2,
      title: "Social Media Manager",
      company: "BrandBoost",
      pay: "$20/hour",
      type: "Part-time",
      urgent: false,
    },
    {
      id: 3,
      title: "Video Editor",
      company: "Creative Studios",
      pay: "$25/hour",
      type: "Freelance",
      urgent: false,
    },
  ];

  const achievements = [
    {
      title: "First Gig Completed",
      description: "Successfully completed your first gig",
      icon: Target,
      earned: true,
      credits: 50,
    },
    {
      title: "5-Star Performer",
      description: "Received 5-star rating on 10 gigs",
      icon: Star,
      earned: true,
      credits: 100,
    },
    {
      title: "Team Player",
      description: "Completed 5 team collaborations",
      icon: Users,
      earned: false,
      progress: 60,
      credits: 75,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your gigs today.
          </p>
        </div>
        <Button onClick={handleApplyToNewGigs} className="w-full md:w-auto">
          <FileText className="mr-2" size={16} />
          Apply to New Gigs
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p
                      className={`text-xs ${
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Gigs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Gigs
              <Button variant="ghost" size="sm">
                View All <ChevronRight size={16} className="ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGigs.map((gig) => (
                <div
                  key={gig.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{gig.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {gig.company}
                    </p>

                    {gig.status === "completed" && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Completed
                        </Badge>
                        <div className="flex items-center">
                          {[...Array(gig.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {gig.completedDate}
                        </span>
                      </div>
                    )}

                    {gig.status === "in-progress" && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-600"
                        >
                          In Progress
                        </Badge>
                        <div className="mt-2">
                          <Progress value={gig.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            Due in {gig.dueDate}
                          </span>
                        </div>
                      </div>
                    )}

                    {gig.status === "pending" && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-600"
                        >
                          Pending Review
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          Submitted {gig.submittedDate}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{gig.pay}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saved Gigs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark size={16} />
                Saved Gigs
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedGigs.map((gig) => (
                <div key={gig.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{gig.title}</h4>
                    {gig.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{gig.company}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">{gig.pay}</span>
                    <Badge variant="secondary" className="text-xs">
                      {gig.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    achievement.earned
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      className={`h-6 w-6 ${
                        achievement.earned
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge
                      variant={achievement.earned ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {achievement.credits} Credits
                    </Badge>
                  </div>

                  {!achievement.earned && achievement.progress && (
                    <div>
                      <Progress value={achievement.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}% complete
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
