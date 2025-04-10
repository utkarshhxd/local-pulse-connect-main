
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: UserRole;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'pending' | 'in-progress' | 'resolved';
export type IssueType = 'roads' | 'water' | 'electricity' | 'sanitation' | 'public-safety' | 'other';

export interface FeedbackItem {
  id: string;
  userId: string;
  userName?: string;
  phone?: string;
  locality: string;
  location?: {
    lat: number;
    lng: number;
  };
  issueType: IssueType;
  title: string;
  description: string;
  mediaUrls: string[];
  urgency: UrgencyLevel;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  adminId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
  phone?: string;
}
