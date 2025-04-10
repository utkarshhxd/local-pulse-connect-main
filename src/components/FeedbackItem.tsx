
import { useState } from "react";
import { FeedbackItem as FeedbackItemType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { feedbackService } from "@/services/db";
import { toast } from "@/hooks/use-toast";

interface FeedbackItemProps {
  feedback: FeedbackItemType;
  onUpdate?: (updatedFeedback: FeedbackItemType) => void;
}

const FeedbackItem = ({ feedback, onUpdate }: FeedbackItemProps) => {
  const { user, isAdmin } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminResponse, setAdminResponse] = useState(feedback.adminResponse || "");
  const [status, setStatus] = useState(feedback.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "bg-urgency-low";
      case "medium":
        return "bg-urgency-medium";
      case "high":
        return "bg-urgency-high";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-status-pending";
      case "in-progress":
        return "bg-status-in-progress";
      case "resolved":
        return "bg-status-resolved";
      default:
        return "bg-gray-500";
    }
  };

  const handleUpdate = async () => {
    if (!isAdmin || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedFeedback = await feedbackService.updateFeedbackStatus(
        feedback.id,
        status,
        user.id,
        adminResponse
      );
      
      toast("The feedback status has been updated successfully");
      
      setIsUpdating(false);
      
      if (onUpdate) {
        onUpdate(updatedFeedback);
      }
    } catch (error) {
      toast.error("Failed to update the feedback status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full animate-fade-in" aria-label={`Feedback: ${feedback.title}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{feedback.title}</h3>
            <p className="text-sm text-muted-foreground">{feedback.locality}</p>
          </div>
          <div className="flex space-x-2">
            <Badge
              variant="outline"
              className={cn("border-none text-white", getUrgencyColor(feedback.urgency))}
              aria-label={`Urgency: ${feedback.urgency}`}
            >
              {feedback.urgency.charAt(0).toUpperCase() + feedback.urgency.slice(1)} Urgency
            </Badge>
            <Badge
              variant="outline"
              className={cn("border-none text-white", getStatusColor(status))}
              aria-label={`Status: ${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="mb-4">{feedback.description}</p>
        
        {feedback.mediaUrls && feedback.mediaUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {feedback.mediaUrls.map((url, index) => (
              <div key={index} className="aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Media for ${feedback.title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        
        {(feedback.adminResponse || isUpdating) && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-1">Response from Authority:</h4>
            {isUpdating ? (
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter your response..."
                className="mt-2"
                aria-label="Admin response"
              />
            ) : (
              <p className="text-sm">{feedback.adminResponse}</p>
            )}
          </div>
        )}
        
        {isAdmin && isUpdating && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Update Status:</h4>
            <div className="flex space-x-2">
              <Button
                variant={status === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('pending')}
                aria-pressed={status === 'pending'}
              >
                Pending
              </Button>
              <Button
                variant={status === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('in-progress')}
                aria-pressed={status === 'in-progress'}
              >
                In Progress
              </Button>
              <Button
                variant={status === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus('resolved')}
                aria-pressed={status === 'resolved'}
              >
                Resolved
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Submitted by {feedback.userName || 'Anonymous'} {formatDate(feedback.createdAt)}
        </div>
        {isAdmin && (
          <div>
            {isUpdating ? (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUpdating(false)}
                  disabled={isSubmitting}
                  aria-label="Cancel update"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  aria-label="Save changes"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpdating(true)}
                aria-label="Update feedback"
              >
                Update
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FeedbackItem;
