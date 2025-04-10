
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackForm from "@/components/FeedbackForm";

const SubmitFeedback = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in and we've checked the auth state, redirect to login
    if (!isLoading && !user) {
      navigate("/login?redirect=/submit-feedback");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Submit Feedback</h1>
        <p className="text-muted-foreground">
          Report an issue in your locality by providing the details below
        </p>
      </div>

      <FeedbackForm />
    </div>
  );
};

export default SubmitFeedback;
