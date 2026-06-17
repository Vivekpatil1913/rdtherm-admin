/**
 * Resource service registry — now backed by the live rdtherm-api backend.
 *
 * Each export is a typed `Collection` whose interface (list / get / create /
 * update / remove / removeMany / reorder) is identical to the previous mock,
 * so every page and hook works unchanged.
 */

import { apiCollection } from "./apiCollection";
import { api } from "./apiClient";
import type {
  ActivityItem,
  AdminUser,
  BlogPost,
  CaseStudy,
  Faq,
  Industry,
  JobOpening,
  Lead,
  Logo,
  Product,
  QuoteRequest,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/types";

export const blogService = apiCollection<BlogPost>("/blogs");
export const productService = apiCollection<Product>("/products");
export const testimonialService = apiCollection<Testimonial>("/testimonials");
export const logoService = apiCollection<Logo>("/logos");
export const faqService = apiCollection<Faq>("/faqs");
export const teamService = apiCollection<TeamMember>("/team");
export const caseStudyService = apiCollection<CaseStudy>("/case-studies");
export const industryService = apiCollection<Industry>("/industries");
export const openingService = apiCollection<JobOpening>("/careers");
export const leadService = apiCollection<Lead>("/leads");
export const quoteService = apiCollection<QuoteRequest>("/quotes");

/** Site settings (singleton) — not a collection. */
export const settingsService = {
  get: () => api.get<SiteSettings>("/settings"),
  update: (payload: SiteSettings) => api.put<SiteSettings>("/settings", payload),
};

/** Recent admin activity for the dashboard feed. */
export const activityService = {
  recent: (limit = 8) => api.get<ActivityItem[]>("/activity", { limit }),
};

export interface DashboardStats {
  totals: {
    products: number;
    blogs: number;
    caseStudies: number;
    testimonials: number;
    team: number;
    faqs: number;
    industries: number;
    logos: number;
    careers: number;
    leads: number;
  };
  leadsNew: number;
  activeBlogs: number;
  activeProducts: number;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    company: string;
    leadStatus: Lead["leadStatus"];
    createdAt: string;
  }>;
}

/** Aggregated counts for the dashboard. */
export const dashboardService = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};

/** Current admin's profile & security. */
export const profileService = {
  updateProfile: (payload: { name: string; email: string; avatar?: string }) =>
    api.put<AdminUser>("/auth/profile", payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/auth/password", payload),
  logoutAll: () => api.post<{ message: string }>("/auth/logout-all"),
};

/** Upload an image file; returns its public URL. Pass `maxKb` to cap the size server-side. */
export async function uploadImage(file: File, opts: { maxKb?: number } = {}): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const path = opts.maxKb ? `/uploads?maxKb=${opts.maxKb}` : "/uploads";
  const res = await api.upload<{ url: string }>(path, form);
  return res.url;
}
