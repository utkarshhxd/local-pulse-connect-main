
import { User, FeedbackItem, IssueType, UrgencyLevel, FeedbackStatus } from '@/types';

// In-memory data storage (simulates JSON files)
let users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User',
    phone: '555-123-4567',
    role: 'user'
  }
];

// Initial feedback data
let feedback: FeedbackItem[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Regular User',
    phone: '555-123-4567',
    locality: '123 Main Street',
    location: { lat: 37.7749, lng: -122.4194 },
    issueType: 'roads' as IssueType,
    title: 'Pothole on Main Street',
    description: 'There is a large pothole that has been present for several weeks',
    mediaUrls: [],
    urgency: 'medium' as UrgencyLevel,
    status: 'pending' as FeedbackStatus,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    userId: '2',
    userName: 'Regular User',
    locality: '456 Oak Avenue',
    issueType: 'water' as IssueType,
    title: 'Water outage in Oak neighborhood',
    description: 'No water in the entire street since this morning',
    mediaUrls: [],
    urgency: 'high' as UrgencyLevel,
    status: 'in-progress' as FeedbackStatus,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    adminResponse: 'Maintenance team dispatched',
    adminId: '1'
  },
  {
    id: '3',
    userId: '2',
    userName: 'Regular User',
    locality: '789 Pine Drive',
    issueType: 'electricity' as IssueType,
    title: 'Street light not working',
    description: 'The street light at the corner has been out for a week creating safety concerns',
    mediaUrls: [],
    urgency: 'low' as UrgencyLevel,
    status: 'resolved' as FeedbackStatus,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    adminResponse: 'Light replaced and working properly now',
    adminId: '1'
  }
];

// Helper function to simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to save data to localStorage (simulating file persistence)
const persistUsers = () => {
  try {
    localStorage.setItem('db_users', JSON.stringify(users));
  } catch (error) {
    console.error('Failed to persist users:', error);
  }
};

const persistFeedback = () => {
  try {
    localStorage.setItem('db_feedback', JSON.stringify(feedback));
  } catch (error) {
    console.error('Failed to persist feedback:', error);
  }
};

// Load data from localStorage on initialization
try {
  const storedUsers = localStorage.getItem('db_users');
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  } else {
    // Save initial data
    persistUsers();
  }

  const storedFeedback = localStorage.getItem('db_feedback');
  if (storedFeedback) {
    feedback = JSON.parse(storedFeedback);
  } else {
    // Save initial data
    persistFeedback();
  }
} catch (error) {
  console.error('Error loading data from localStorage:', error);
}

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    await delay(800); // Simulate network delay
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new Error('Invalid email or password');
  },
  
  signup: async (email: string, password: string, name?: string, phone?: string) => {
    await delay(800);
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email already in use');
    }
    
    const newUser: User = {
      id: `${users.length + 1}`,
      email,
      password,
      name,
      phone,
      role: 'user' // Default role for new signups
    };
    
    users = [...users, newUser];
    persistUsers();
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
};

// Feedback Service
export const feedbackService = {
  getAllFeedback: async () => {
    await delay(800);
    return feedback;
  },
  
  getUserFeedback: async (userId: string) => {
    await delay(800);
    return feedback.filter(item => item.userId === userId);
  },
  
  getFeedbackById: async (id: string) => {
    await delay(500);
    const item = feedback.find(item => item.id === id);
    if (!item) throw new Error('Feedback not found');
    return item;
  },
  
  submitFeedback: async (feedbackData: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    await delay(1000);
    
    const newFeedback: FeedbackItem = {
      ...feedbackData,
      id: `${feedback.length + 1}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    feedback = [...feedback, newFeedback];
    persistFeedback();
    return newFeedback;
  },
  
  updateFeedbackStatus: async (id: string, status: FeedbackStatus, adminId: string, adminResponse?: string) => {
    await delay(800);
    
    const itemIndex = feedback.findIndex(item => item.id === id);
    if (itemIndex === -1) throw new Error('Feedback not found');
    
    const updatedItem = {
      ...feedback[itemIndex],
      status,
      updatedAt: new Date().toISOString(),
      adminId,
      adminResponse: adminResponse || feedback[itemIndex].adminResponse
    };
    
    feedback = [
      ...feedback.slice(0, itemIndex),
      updatedItem,
      ...feedback.slice(itemIndex + 1)
    ];
    
    persistFeedback();
    return updatedItem;
  },
  
  deleteFeedback: async (id: string) => {
    await delay(800);
    
    const itemIndex = feedback.findIndex(item => item.id === id);
    if (itemIndex === -1) throw new Error('Feedback not found');
    
    feedback = [
      ...feedback.slice(0, itemIndex),
      ...feedback.slice(itemIndex + 1)
    ];
    
    persistFeedback();
    return { success: true };
  },

  getAnalytics: async () => {
    await delay(1000);
    
    // Calculate statistics for reports
    const total = feedback.length;
    
    // Status breakdown
    const statusCounts = feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Issue type breakdown
    const typeCounts = feedback.reduce((acc, item) => {
      acc[item.issueType] = (acc[item.issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Urgency level breakdown
    const urgencyCounts = feedback.reduce((acc, item) => {
      acc[item.urgency] = (acc[item.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Average resolution time (for resolved issues)
    const resolvedFeedback = feedback.filter(item => item.status === 'resolved');
    const totalResolutionTime = resolvedFeedback.reduce((acc, item) => {
      const createdDate = new Date(item.createdAt).getTime();
      const updatedDate = new Date(item.updatedAt).getTime();
      return acc + (updatedDate - createdDate);
    }, 0);
    
    const avgResolutionTime = resolvedFeedback.length 
      ? totalResolutionTime / resolvedFeedback.length / (1000 * 60 * 60 * 24) // in days
      : 0;
      
    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentActivity = feedback.filter(
      item => new Date(item.updatedAt).getTime() > thirtyDaysAgo
    ).length;
    
    return {
      totalFeedback: total,
      statusBreakdown: statusCounts,
      typeBreakdown: typeCounts,
      urgencyBreakdown: urgencyCounts,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Round to 1 decimal place
      recentActivity,
      resolvedPercentage: total ? Math.round((statusCounts['resolved'] || 0) * 100 / total) : 0,
      pendingPercentage: total ? Math.round((statusCounts['pending'] || 0) * 100 / total) : 0,
    };
  }
};
