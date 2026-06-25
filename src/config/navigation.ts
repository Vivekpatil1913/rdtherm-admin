import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Quote,
  Building2,
  HelpCircle,
  Newspaper,
  Users,
  BriefcaseBusiness,
  Trophy,
  Factory,
  Boxes,
  Inbox,
  FileText,
  ClipboardList,
  Settings,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional badge text (e.g. lead count). */
  badge?: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

/**
 * Sidebar information architecture — derived directly from the public
 * R&D Therm website's content surfaces (see rdtherm-web/src/data & /sections).
 */
export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Homepage",
    links: [
      { label: "Testimonials", href: "/testimonials", icon: Quote },
      { label: "Industries", href: "/industries", icon: Factory },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Products", href: "/products", icon: Boxes },
      { label: "Blogs / Articles", href: "/blogs", icon: Newspaper },
      { label: "Case Studies", href: "/case-studies", icon: Trophy },
      { label: "FAQs", href: "/faqs", icon: HelpCircle },
    ],
  },
  {
    title: "People & Brand",
    links: [
      { label: "Team Members", href: "/team", icon: Users },
      { label: "Client Logos", href: "/clients", icon: Building2 },
      { label: "Careers", href: "/careers", icon: BriefcaseBusiness },
    ],
  },
  {
    title: "Engagement",
    links: [
      { label: "Contact Leads", href: "/leads", icon: Inbox },
      { label: "Quote Requests", href: "/quotes", icon: FileText },
      { label: "Job Applications", href: "/applications", icon: ClipboardList },
    ],
  },
  {
    title: "System",
    links: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

/** Flat lookup used by the breadcrumb builder. */
export const allNavLinks: NavLink[] = navGroups.flatMap((g) => g.links);
