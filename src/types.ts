// Cloudflare Bindings
export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
}

// Database Models
export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface StoreInfo {
  id: number;
  shoulder_name?: string;
  store_name: string;
  phone?: string;
  address?: string;
  nearest_station?: string;
  parking_info?: string;
  payment_methods?: string;
  other_info?: string;
  google_maps_url?: string;
  reservation_type: 'url' | 'phone' | 'none';
  reservation_value?: string;
  contact_form_url?: string;
  show_contact_form: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  ga4_id?: string;
  clarity_id?: string;
  updated_at: string;
}

export interface MainImage {
  id: number;
  media_type: 'image' | 'video';
  media_url: string;
  display_order: number;
  created_at: string;
}

export interface CommitmentItem {
  id: number;
  image_url?: string;
  title: string;
  description?: string;
  display_order: number;
  is_visible: number;
  created_at: string;
}

export interface Greeting {
  id: number;
  image_url?: string;
  title: string;
  message: string;
  updated_at: string;
}

export interface MenuImage {
  id: number;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface BanquetCourse {
  id: number;
  image_url?: string;
  course_name: string;
  course_description?: string;
  display_order: number;
  is_visible: number;
  created_at: string;
}

export interface News {
  id: number;
  title: string;
  content?: string;
  published_date: string;
  is_visible: number;
  created_at: string;
}

export interface Gallery {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
  display_order: number;
  is_visible: number;
  created_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_visible: number;
  created_at: string;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value?: string;
  updated_at: string;
}

// Session data
export interface SessionData {
  userId: number;
  username: string;
  loginTime: number;
}
