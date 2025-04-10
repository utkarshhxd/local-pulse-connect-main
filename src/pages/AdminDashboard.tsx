import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/services/db";
import { FeedbackItem as FeedbackItemType, FeedbackStatus, IssueType } from "@/types";
import FeedbackItemComponent from "@/components/FeedbackItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Search, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const statusColors = {
  pending: "#f59e0b",
  "in-progress": "#3b82f6",
  resolved: "#10b981",
};

const typeColors = {
  roads: "#ef4444",
  water: "#3b82f6",
  electricity: "#f59e0b",
  sanitation: "#8b5cf6",
  "public-safety": "#ec4899",
  other: "#6b7280",
};

const AdminDashboard = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackItemType[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFeedback = async () => {
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedback(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast("You need administrator privileges to access this page.");
      navigate("/");
      return;
    }

    if (!isLoading && user && isAdmin) {
      fetchFeedback();
    }
  }, [user, isLoading, isAdmin, navigate]);

  const filteredFeedback = feedback.filter((item) => {
    const statusMatch =
      filterStatus === "all" || item.status === filterStatus;
    const typeMatch = filterType === "all" || item.issueType === filterType;
    
    const searchMatch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userName && item.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && typeMatch && searchMatch;
  });

  const statusData = Object.entries(
    feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const issueTypeData = Object.entries(
    feedback.reduce((acc, item) => {
      acc[item.issueType] = (acc[item.issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const calculateStats = () => {
    const total = feedback.length;
    const pending = feedback.filter(
      (item) => item.status === "pending"
    ).length;
    const inProgress = feedback.filter(
      (item) => item.status === "in-progress"
    ).length;
    const resolved = feedback.filter(
      (item) => item.status === "resolved"
    ).length;
    
    const avgResolutionTime = feedback
      .filter((item) => item.status === "resolved")
      .reduce((sum, item) => {
        const created = new Date(item.createdAt).getTime();
        const updated = new Date(item.updatedAt).getTime();
        return sum + (updated - created);
      }, 0) / (resolved || 1);
    
    return {
      total,
      pending,
      inProgress,
      resolved,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60 * 24)),
    };
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "User Name", "Phone", "Locality", "Issue Type", 
      "Title", "Description", "Urgency", "Status", 
      "Created At", "Updated At", "Admin Response"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredFeedback.map(item => [
        item.id,
        `"${item.userName || 'Anonymous'}"`,
        `"${item.phone || 'N/A'}"`,
        `"${item.locality}"`,
        `"${item.issueType}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.urgency,
        item.status,
        new Date(item.createdAt).toLocaleString(),
        new Date(item.updatedAt).toLocaleString(),
        `"${item.adminResponse ? item.adminResponse.replace(/"/g, '""') : 'N/A'}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Feedback data exported successfully");
  };

  const stats = calculateStats();

  if (isLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resolved Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Feedback List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex flex-wrap gap-3 justify-between mb-6">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="roads">Roads</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="sanitation">Sanitation</SelectItem>
                    <SelectItem value="public-safety">Public Safety</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="mb-3 text-sm text-muted-foreground">
            Showing {filteredFeedback.length} of {feedback.length} items
          </div>

          <div className="space-y-6">
            {filteredFeedback.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No feedback items match your filters
              </p>
            ) : (
              filteredFeedback.map((item) => (
                <FeedbackItemComponent
                  key={item.id}
                  feedback={item}
                  onUpdate={fetchFeedback}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Status</CardTitle>
                <CardDescription>
                  Distribution of feedback by current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={statusColors[entry.name as keyof typeof statusColors] || "#64748b"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback by Issue Type</CardTitle>
                <CardDescription>
                  Distribution of feedback by reported issue type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={issueTypeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count">
                        {issueTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={typeColors[entry.name as keyof typeof typeColors] || "#64748b"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
