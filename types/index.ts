export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "super_admin";
  user_type: "student" | "graduate" | "professional" | "institution";
  profile_image?: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  job_type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salary?: string;
  deadline: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  application_link: string;
  contact_email?: string;
  image_url?: string;
  status: "active" | "expired";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  study_level: string;
  funding_type: "fully-funded" | "partial" | "tuition-only" | "stipend";
  deadline: string;
  description: string;
  benefits?: string;
  eligibility?: string;
  required_documents?: string;
  application_link: string;
  image_url?: string;
  status: "active" | "expired";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  duration: string;
  fee: string;
  mode: "online" | "physical" | "hybrid";
  location?: string;
  start_date: string;
  description: string;
  what_you_will_learn?: string;
  certificate_status?: string;
  instructor?: string;
  registration_link: string;
  image_url?: string;
  category?: string;
  level?: string;
  status: "active" | "expired";
  created_at: string;
}

export interface CampusUpdate {
  id: string;
  title: string;
  institution: string;
  category: "news" | "events" | "announcements" | "exams" | "results" | "scholarships";
  date: string;
  description: string;
  image_url?: string;
  status: "active" | "expired";
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string;
  image_url?: string;
  preview_url?: string;
  is_paid: boolean;
  price: number;
  currency: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface Message {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  organization: string;
  description: string;
  link?: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  module: string;
  details?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_jobs: number;
  total_scholarships: number;
  total_trainings: number;
  total_campus_updates: number;
  total_applications_clicks?: number;
  unread_messages?: number;
  newsletter_subscribers: number;
  pending_submissions: number;
  users_growth?: number;
  opportunities_growth?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
