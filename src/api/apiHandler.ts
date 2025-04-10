
import { authService, feedbackService } from '@/services/db';
import { LoginCredentials, SignupCredentials, FeedbackItem, FeedbackStatus } from '@/types';

// Simulate server-side API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login(
          credentials.email, 
          credentials.password
        );
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    signup: async (credentials: SignupCredentials) => {
      try {
        const response = await authService.signup(
          credentials.email,
          credentials.password,
          credentials.name,
          credentials.phone
        );
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    }
  },
  
  // Feedback endpoints
  feedback: {
    getAll: async () => {
      try {
        const response = await feedbackService.getAllFeedback();
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await feedbackService.getFeedbackById(id);
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    getByUser: async (userId: string) => {
      try {
        const response = await feedbackService.getUserFeedback(userId);
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    submit: async (data: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      try {
        const response = await feedbackService.submitFeedback(data);
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    updateStatus: async (
      id: string, 
      status: FeedbackStatus, 
      adminId: string, 
      adminResponse?: string
    ) => {
      try {
        const response = await feedbackService.updateFeedbackStatus(
          id, 
          status, 
          adminId, 
          adminResponse
        );
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await feedbackService.deleteFeedback(id);
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    }
  },
  
  // Reports/Analytics endpoint
  reports: {
    getAnalytics: async () => {
      try {
        const response = await feedbackService.getAnalytics();
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'An unknown error occurred' 
        };
      }
    }
  }
};

// For debugging
(window as any).api = api;
