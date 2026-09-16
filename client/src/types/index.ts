export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  htmlContent: string;
  isActive: boolean;
  createdByName: string;
  createdAt: string;
}

export enum CampaignStatus {
  Draft = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
}

export enum EmailSendingStatus {
  Pending = 0,
  Processing = 1,
  Sent = 2,
  Failed = 3,
}

export interface Campaign {
  id: string;
  name: string;
  templateName: string;
  createdByName: string;
  totalRecipients: number;
  status: CampaignStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignDetail extends Campaign {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  progressPercentage: number;
}

export interface DashboardSummary {
  totalSubscribers: number;
  totalTemplates: number;
  totalCampaigns: number;
  totalEmailsSent: number;
  successfulEmails: number;
  failedEmails: number;
  successRate: number;
}

export interface DailySend {
  date: string;
  count: number;
  successful: number;
  failed: number;
}

export interface StatusDistribution {
  status: EmailSendingStatus;
  count: number;
}

export interface TemplatePerformance {
  templateName: string;
  totalSent: number;
  successful: number;
  failed: number;
}

export interface RecentActivity {
  email: string;
  templateName: string;
  campaignName: string;
  status: EmailSendingStatus;
  sentAt?: string;
}

export interface ReportItem {
  email: string;
  templateName: string;
  campaignName: string;
  sentAt?: string;
  status: EmailSendingStatus;
  errorMessage?: string;
}

export interface ReportSummary {
  totalSent: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface SmtpSettings {
  host: string;
  port: number;
  enableSsl: boolean;
  username: string;
  senderEmail: string;
  senderName: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

