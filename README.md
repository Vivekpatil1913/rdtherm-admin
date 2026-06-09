# R&D Therm — CMS Admin Panel

A modern, scalable Admin CMS frontend for the [R&D Therm website](../rdtherm-web).
It lets administrators manage every content surface of the public site — hero,
products, blogs, testimonials, team, leads, SEO and more — without touching code.

This is a **frontend-only** implementation. All data is mocked behind a service
layer designed so real backend APIs can be dropped in later with minimal change.

## Stack

Identical to the public website, by design:

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (`@theme` tokens, no config file)
- **framer-motion** (animations, drag-and-drop reordering)
- **lucide-react** (icons) · **clsx** + **tailwind-merge** (`cn`)

No extra heavy dependencies were added — the rich-text editor, charts, toasts,
modals and drag-and-drop are all built in-house on the same stack.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3001
npm run build    # production build
npm run lint
```

Login is in **demo mode** — any credentials work (fields are prefilled).

## Architecture

```
src/
├─ app/
│  ├─ (auth)/            # Login + forgot-password (split-screen layout)
│  ├─ (admin)/           # Protected CMS — every module lives here
│  │   ├─ dashboard, hero, features, testimonials, industries,
│  │   ├─ products[+new,+id], blogs[+new,+id], case-studies, faqs,
│  │   ├─ team, clients, integrations, careers, leads,
│  │   └─ seo, navigation, media, settings
│  ├─ layout.tsx         # Root: fonts, providers, no-flash theme script
│  └─ globals.css        # Design tokens + light/dark themes
├─ components/
│  ├─ ui/                # Button, Input, Select, Modal, Card, Badge, Tabs…
│  ├─ layout/            # Sidebar, Topbar, AdminShell, PageHeader, ThemeToggle
│  ├─ data-table/        # DataTable, TableToolbar, RowActions
│  ├─ form/              # Field, RichTextEditor, ImageUpload, TagInput
│  ├─ charts/            # AreaChart, BarChart, DonutChart (SVG, no lib)
│  └─ cms/               # ResourceManager, BlogEditor, ProductEditor, SortableList…
├─ providers/            # Theme (dark/light/system), Toast, Auth
├─ hooks/                # useResource, useCrud, useForm, useSelection, useDisclosure…
├─ services/             # Mock API client + per-resource collections
├─ data/                 # Seed data extracted from the live website
├─ config/               # Sidebar navigation IA
├─ types/                # Content types mirroring the website schema
└─ lib/                  # cn, format, validation, storage
```

### Reusable CRUD pattern

Most modules are a few lines of config over a single component:

- **`ResourceManager<T, FormValues>`** — list + search + filters + status tabs +
  row selection + bulk delete + create/edit modal + delete confirm, all driven
  by a column config and a form render-prop. Powers testimonials, FAQs, team,
  industries, careers, logos, case studies, features and SEO.
- **`useResource`** — list state (debounced search, filters, sort, pagination)
  bound to any service collection.
- **`useCrud`** — create/update/delete/bulk-delete with toast feedback.
- **`useForm`** — controlled form state with synchronous schema validation.

Rich content modules (Blogs, Products) use dedicated full-page editors
(`BlogEditor`, `ProductEditor`) with the in-house `RichTextEditor`.

### Swapping in a real backend

Every component talks to a typed `Collection<T>` from `src/services`. Today those
are created by `createCollection()` (an in-memory mock with simulated latency,
filtering, sorting and pagination). To go live, reimplement `createCollection`
against `fetch` — **no component, hook or page needs to change.**

## CMS modules (derived from the actual website)

| Module | Manages | Source on the site |
| --- | --- | --- |
| Dashboard | Overview cards, traffic, activity, quick actions | — |
| Hero Section | Founder quote, hero stats, "Why Us" intro, support card | `data/home.ts` |
| Features / Why Us | Value props, strengths, process steps | `data/home.ts`, `data/manufacturing.ts` |
| Testimonials | Client quotes carousel | `data/home.ts` |
| Industries | "Industries We Serve" sectors | `data/home.ts` |
| Products | Equipment catalogue (+ rich detail editor) | `data/products.ts` |
| Blogs / Articles | Insights articles (+ rich editor) | `data/blog.ts` |
| Case Studies | Project success stories | footer / blog category |
| FAQs | Product-page Q&A | `data/products.ts` |
| Team Members | Board of directors + team | `data/about.ts` |
| Client Logos | "Trusted by" marquee | `data/home.ts` |
| Integrations & Certs | Approval partners + certification marks | `data/manufacturing.ts` |
| Careers | Job openings | `data/careers.ts` |
| Contact Leads | Enquiry inbox + status pipeline | contact form |
| SEO Metadata | Per-page meta + Open Graph | `app/layout.tsx` |
| Navbar & Footer | Drag-to-reorder navigation links | `data/site.ts` |
| Media Library | Image gallery + upload | shared galleries |
| Settings | Brand, contact, social, theme | `data/site.ts` |

## Notable UX

- **Dark / light / system theme** with no flash on load, persisted to localStorage.
- **Responsive** collapsible sidebar (desktop) + drawer (mobile).
- Skeleton loaders, empty states, toast notifications, confirm dialogs.
- Drag-and-drop ordering (framer-motion `Reorder`) in Navigation.
- Form validation, search-engine result preview (SEO), live reading-time (Blogs).
