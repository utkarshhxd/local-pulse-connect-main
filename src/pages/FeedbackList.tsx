import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/services/db";
import { FeedbackItem as FeedbackItemType, IssueType, FeedbackStatus, UrgencyLevel } from "@/types";
import FeedbackItem from "@/components/FeedbackItem";
import UserFeedbackHistory from "@/components/UserFeedbackHistory";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const FeedbackList = () => {
  const { user, isAdmin } = useAuth();
  const [allFeedback, setAllFeedback] = useState<FeedbackItemType[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const issueTypes: { value: IssueType | "all"; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "roads", label: "Roads & Infrastructure" },
    { value: "water", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "sanitation", label: "Sanitation & Waste" },
    { value: "public-safety", label: "Public Safety" },
    { value: "other", label: "Other" },
  ];

  const statusOptions: { value: FeedbackStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  const urgencyOptions: { value: UrgencyLevel | "all"; label: string }[] = [
    { value: "all", label: "All Urgency Levels" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  useEffect(() => {
    const loadFeedback = async () => {
      setIsLoading(true);
      try {
        let feedbackData;
        
        if (isAdmin) {
          // Admins see all feedback
          feedbackData = await feedbackService.getAllFeedback();
        } else {
          // Not logged in users see all feedback (read-only)
          feedbackData = await feedbackService.getAllFeedback();
        }
        
        // Sort by most recent first
        feedbackData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAllFeedback(feedbackData);
        setFilteredFeedback(feedbackData);
      } catch (error) {
        console.error("Failed to load feedback:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeedback();
  }, [isAdmin]);

  useEffect(() => {
    // Apply filters
    let result = [...allFeedback];
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.locality.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(item => item.issueType === typeFilter);
    }
    
    // Urgency filter
    if (urgencyFilter !== "all") {
      result = result.filter(item => item.urgency === urgencyFilter);
    }
    
    setFilteredFeedback(result);
  }, [searchTerm, statusFilter, typeFilter, urgencyFilter, allFeedback]);

  const handleFeedbackUpdate = (updatedFeedback: FeedbackItemType) => {
    // Update the feedback item in both arrays
    setAllFeedback(prev => 
      prev.map(item => (item.id === updatedFeedback.id ? updatedFeedback : item))
    );
    
    setFilteredFeedback(prev => 
      prev.map(item => (item.id === updatedFeedback.id ? updatedFeedback : item))
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setUrgencyFilter("all");
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {isAdmin ? "All Community Feedback" : "Community Feedback"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Manage and respond to feedback from community members"
            : "View and track feedback submitted by the community"}
        </p>
      </div>

      {user && !isAdmin && (
        <Tabs defaultValue="community">
          <TabsList className="mb-6">
            <TabsTrigger value="community">Community Feedback</TabsTrigger>
            <TabsTrigger value="my-feedback">My Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-feedback">
            <UserFeedbackHistory />
          </TabsContent>
          
          <TabsContent value="community">
            <div className="flex justify-end mb-4">
              <Button asChild>
                <Link to="/submit-feedback" className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  Submit New Feedback
                </Link>
              </Button>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <span className="ml-1 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {(statusFilter !== "all" ? 1 : 0) + 
                     (typeFilter !== "all" ? 1 : 0) + 
                     (urgencyFilter !== "all" ? 1 : 0)}
                  </span>
                </Button>
              </div>

              {/* Expandable filters */}
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={showFilters ? "filters" : ""}
              >
                <AccordionItem value="filters">
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FeedbackStatus | "all")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as IssueType | "all")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueTypes.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as UrgencyLevel | "all")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Results summary */}
            <div className="text-sm text-muted-foreground mb-4">
              Showing {filteredFeedback.length} of {allFeedback.length} feedback items
            </div>

            {/* Feedback list */}
            <div className="space-y-6">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse border rounded-md p-4">
                    <div className="flex justify-between mb-4">
                      <div className="h-6 bg-muted rounded w-1/4"></div>
                      <div className="h-6 bg-muted rounded w-1/6"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-4"></div>
                  </div>
                ))
              ) : filteredFeedback.length > 0 ? (
                filteredFeedback.map((item) => (
                  <FeedbackItem 
                    key={item.id} 
                    feedback={item} 
                    onUpdate={handleFeedbackUpdate}
                  />
                ))
              ) : (
                <div className="text-center py-8 border rounded-md bg-muted/30">
                  <SlidersHorizontal className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium mb-1">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {!user && (
        <>
          <div className="flex justify-end mb-4">
            <Button asChild>
              <Link to="/submit-feedback" className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                Submit New Feedback
              </Link>
            </Button>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <span className="ml-1 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {(statusFilter !== "all" ? 1 : 0) + 
                   (typeFilter !== "all" ? 1 : 0) + 
                   (urgencyFilter !== "all" ? 1 : 0)}
                </span>
              </Button>
            </div>

            {/* Expandable filters */}
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={showFilters ? "filters" : ""}
            >
              <AccordionItem value="filters">
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FeedbackStatus | "all")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as IssueType | "all")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueTypes.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as UrgencyLevel | "all")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Results summary */}
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredFeedback.length} of {allFeedback.length} feedback items
          </div>

          {/* Feedback list */}
          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse border rounded-md p-4">
                  <div className="flex justify-between mb-4">
                    <div className="h-6 bg-muted rounded w-1/4"></div>
                    <div className="h-6 bg-muted rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-4"></div>
                </div>
              ))
            ) : filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <FeedbackItem 
                  key={item.id} 
                  feedback={item} 
                  onUpdate={handleFeedbackUpdate}
                />
              ))
            ) : (
              <div className="text-center py-8 border rounded-md bg-muted/30">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackList;
