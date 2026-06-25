/**
 * Shared content types for the R&D Therm CMS.
 * These mirror the data schema used by the public website
 * (rdtherm-web/src/data/*) so that backend integration is a 1:1 mapping.
 */

export type ID = string;

/** Common fields every CMS record carries. */
export interface BaseRecord {
  id: ID;
  /** Active = visible on the website (maps to the DB `is_active` column). */
  isActive: boolean;
  /** Manual ordering position for drag-and-drop sortable lists. */
  order: number;
  createdAt: string;
  updatedAt: string;
}

/* ----------------------------- Hero / Home ----------------------------- */

export interface HeroContent {
  quoteText: string;
  quoteAuthor: string;
  quoteRole: string;
  statDeliveryValue: string;
  statDeliveryLabel: string;
  statProfessionalsValue: string;
  statProfessionalsLabel: string;
  whyEyebrow: string;
  whyHeading: string;
  whyDescription: string;
  supportTitle: string;
  supportBody: string;
  supportCtaLabel: string;
  supportCtaHref: string;
}

export interface Feature extends BaseRecord {
  title: string;
  body: string;
  group: "why" | "strength" | "process";
}

/* ----------------------------- Testimonials ---------------------------- */

export interface Testimonial extends BaseRecord {
  author: string;
  role: string;
  body: string;
  rating: number;
  avatarUrl?: string;
}

/* ------------------------------- Logos --------------------------------- */

export type LogoKind = "client" | "integration" | "certification";

export interface Logo extends BaseRecord {
  name: string;
  imageUrl?: string;
  kind: LogoKind;
}

/* -------------------------------- FAQ ---------------------------------- */

export interface Faq extends BaseRecord {
  question: string;
  answer: string;
}

/* ------------------------------- Blogs --------------------------------- */

export interface BlogPost extends BaseRecord {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  /** Wide 21:9 banner shown on the article detail page. */
  cover: string;
  /** Square 1:1 thumbnail shown on the blog grid cards. */
  cardImage: string;
  /** Rich HTML produced by the editor. */
  content: string;
  views: number;
}

/* ------------------------------ Team ----------------------------------- */

export type TeamGroup = "director" | "team";

export interface TeamMember extends BaseRecord {
  name: string;
  role: string;
  bio: string;
  photo: string;
  group: TeamGroup;
}

/* --------------------------- Case Studies ------------------------------ */

export interface CaseStudy extends BaseRecord {
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  cover: string;
  metrics: { label: string; value: string }[];
  content: string;
}

/* ------------------------------ Products ------------------------------- */

export interface ProductImage {
  url: string;
  alt: string;
  label?: string;
}

export interface Product extends BaseRecord {
  slug: string;
  title: string;
  summary: string;
  specs: string[];
  applications: string[];
  materials: string[];
  compliance: string[];
  benefits: string[];
  inclusions: string[];
  cover: string;
  images: ProductImage[];
  content: string;
  featured: boolean;
}

/* ----------------------------- Industries ------------------------------ */

export interface Industry extends BaseRecord {
  key: string;
  label: string;
  description: string;
  cover: string;
}

/* ------------------------------ Careers -------------------------------- */

export interface JobOpening extends BaseRecord {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

/* --------------------------- Contact Leads ----------------------------- */

export type LeadStatus = "new" | "in-progress" | "qualified" | "closed";

export interface Lead extends BaseRecord {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  source: string;
  leadStatus: LeadStatus;
  feedback?: string;
}

/* --------------------------- Quote Requests ---------------------------- */

export type QuoteStatus = "new" | "in-progress" | "quoted" | "closed";

/** A single label/value row of an attached product configuration. */
export interface QuoteConfigLine {
  label: string;
  value: string;
}

export interface QuoteRequest extends BaseRecord {
  name: string;
  email: string;
  mobile: string;
  company: string;
  country: string;
  city: string;
  message: string;
  productName: string;
  quoteType: "standard" | "custom";
  configuration: QuoteConfigLine[];
  source: string;
  quoteStatus: QuoteStatus;
}

/* -------------------------- Job Applications --------------------------- */

export type ApplicationStatus = "new" | "reviewing" | "shortlisted" | "rejected";

export interface JobApplication extends BaseRecord {
  name: string;
  email: string;
  phone: string;
  role: string;
  portfolio: string;
  message: string;
  resumeUrl: string;
  resumeName: string;
  source: string;
  appStatus: ApplicationStatus;
  feedback?: string;
}

/* ------------------------------- SEO ----------------------------------- */

export interface SeoEntry extends BaseRecord {
  page: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  noindex: boolean;
}

/* ----------------------------- Navigation ------------------------------ */

export interface NavItem {
  id: ID;
  label: string;
  href: string;
  order: number;
}

/* ------------------------------- Media --------------------------------- */

export interface MediaAsset {
  id: ID;
  name: string;
  url: string;
  type: "image" | "document" | "video";
  size: number;
  width?: number;
  height?: number;
  folder: string;
  uploadedAt: string;
}

/* ------------------------------ Settings ------------------------------- */

export interface SiteSettings {
  name: string;
  shortName: string;
  parent: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  social: { label: string; href: string; active?: boolean }[];
  hours: { label: string; value: string }[];
}

/* ------------------------------ Activity ------------------------------- */

export interface ActivityItem {
  id: ID;
  actor: string;
  action: string;
  target: string;
  module: string;
  at: string;
}

/* ------------------------------- Auth ---------------------------------- */

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
