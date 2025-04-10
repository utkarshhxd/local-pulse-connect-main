
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { feedbackService } from "@/services/db";
import { FeedbackItem, FeedbackStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: JSX.Element;
  trend?: number;
  color: string;
}

const StatCard = ({ title, value, description, icon, trend, color }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`${color} rounded-full p-2`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend !== undefined && (
        <div className="flex items-center text-xs pt-1">
          <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
          <span className="text-emerald-500">{trend}% increase</span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const Index = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allFeedback = await feedbackService.getAllFeedback();
        
        // Calculate stats
        const pending = allFeedback.filter(item => item.status === 'pending').length;
        const inProgress = allFeedback.filter(item => item.status === 'in-progress').length;
        const resolved = allFeedback.filter(item => item.status === 'resolved').length;
        
        setStats({
          total: allFeedback.length,
          pending,
          inProgress,
          resolved,
        });

        // Get recent feedback (last 3)
        const sorted = [...allFeedback].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentFeedback(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-status-pending text-white">Pending</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-status-in-progress text-white">In Progress</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-status-resolved text-white">Resolved</span>;
      default:
        return null;
    }
  };

  const handleViewDetails = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setDialogOpen(true);
  };

  const renderHeroSection = () => (
    <div className="relative bg-gradient-to-r from-primary to-primary/70 text-white rounded-lg p-8 mb-8 overflow-hidden">
      <div className="max-w-xl relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Voice Your Concerns, Shape Your Community
        </h1>
        <p className="mb-6 text-white/90">
          Submit and track your local feedback in one place. Help us make your locality better by reporting issues that matter to you.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg" variant="secondary">
            <Link to="/submit-feedback">
              Submit Feedback
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
            <Link to="/feedback">
              View Reports
            </Link>
          </Button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 opacity-10">
        <MessageSquare size={240} />
      </div>
    </div>
  );

  return (
    <div className="container py-8 max-w-7xl">
      {renderHeroSection()}
      
      <div className="grid gap-6 md:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Feedback"
              value={stats.total}
              description="Total reports submitted"
              icon={<Layers className="h-4 w-4 text-white" />}
              color="bg-blue-500"
              trend={8}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              description="Awaiting review"
              icon={<Clock className="h-4 w-4 text-white" />}
              color="bg-gray-500"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              description="Currently being addressed"
              icon={<AlertCircle className="h-4 w-4 text-white" />}
              color="bg-amber-500"
              trend={12}
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
              description="Successfully completed"
              icon={<CheckCircle className="h-4 w-4 text-white" />}
              color="bg-emerald-500"
              trend={24}
            />
          </>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Feedback</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/feedback" className="flex items-center">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentFeedback.length > 0 ? (
          <div className="space-y-4">
            {recentFeedback.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {item.locality}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No feedback available yet.</p>
              {user ? (
                <Button asChild className="mt-4">
                  <Link to="/submit-feedback">Submit Feedback</Link>
                </Button>
              ) : (
                <Button asChild className="mt-4">
                  <Link to="/login">Login to Submit Feedback</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12 bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">1. Submit Your Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Report issues in your locality with details and optional images.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">2. Authorities Review</h3>
            <p className="text-sm text-muted-foreground">
              Local authorities review and prioritize the submitted feedback.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">3. Track Resolution</h3>
            <p className="text-sm text-muted-foreground">
              Follow the status of your feedback until resolution is complete.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Status</h4>
              {selectedFeedback && getStatusBadge(selectedFeedback.status)}
            </div>
            <div>
              <h4 className="font-medium text-sm">Description</h4>
              <p className="text-sm mt-1">{selectedFeedback?.description}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Locality</h4>
              <p className="text-sm mt-1">{selectedFeedback?.locality}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Submitted by</h4>
              <p className="text-sm mt-1">{selectedFeedback?.userName || 'Anonymous'}</p>
            </div>
            {selectedFeedback?.adminResponse && (
              <div>
                <h4 className="font-medium text-sm">Official Response</h4>
                <p className="text-sm mt-1 bg-muted p-3 rounded">{selectedFeedback.adminResponse}</p>
              </div>
            )}
            {selectedFeedback?.mediaUrls && selectedFeedback.mediaUrls.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Media</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedFeedback.mediaUrls.map((url, i) => (
                    <div key={i} className="aspect-video rounded overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Media for ${selectedFeedback.title}`}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
              <Button asChild className="ml-2">
                <Link to="/feedback">View All Feedback</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
