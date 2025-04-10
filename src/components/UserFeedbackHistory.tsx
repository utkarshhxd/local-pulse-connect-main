
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/services/db";
import { FeedbackItem as FeedbackItemType } from "@/types";
import FeedbackItem from "@/components/FeedbackItem";
import { toast } from "@/hooks/use-toast";
import { Clock, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const UserFeedbackHistory = () => {
  const { user } = useAuth();
  const [userFeedback, setUserFeedback] = useState<FeedbackItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFeedback = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const feedback = await feedbackService.getUserFeedback(user.id);
        
        // Sort by most recent first
        feedback.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setUserFeedback(feedback);
      } catch (error) {
        console.error("Error fetching user feedback:", error);
        toast.error("Failed to load your feedback history");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFeedback();
  }, [user]);

  const handleFeedbackUpdate = (updatedFeedback: FeedbackItemType) => {
    setUserFeedback(prev => 
      prev.map(item => (item.id === updatedFeedback.id ? updatedFeedback : item))
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userFeedback.length === 0) {
    return (
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Your Feedback History</CardTitle>
          <CardDescription>
            You haven't submitted any feedback yet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            When you submit feedback, it will appear here
          </p>
        </CardContent>
        <CardFooter className="bg-muted/30 py-3">
          <p className="text-sm text-muted-foreground">
            Submit feedback to help improve your community
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full mt-8">
      <div className="flex items-center mb-6">
        <Clock className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Your Feedback History</h2>
      </div>
      
      <div className="space-y-6">
        {userFeedback.map(item => (
          <FeedbackItem 
            key={item.id} 
            feedback={item}
            onUpdate={handleFeedbackUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default UserFeedbackHistory;
