import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} R&amp;D Therm (I) Pvt. Ltd. — A Konark Global Co.
        </p>
      </div>

      {/* Brand column */}
      <div className="relative hidden overflow-hidden bg-[var(--color-bg-dark,#0d0d0d)] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/60 to-[var(--color-brand-strong)]/40" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium">
            <span className="size-1.5 rounded-[2px] bg-[var(--color-brand)]" />
            Content Management System
          </span>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Manage every word, image and lead across the R&amp;D Therm website.
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/70">
            Design. Fabricate. Deliver — now with a single place to keep your digital presence
            as precise as your engineering.
          </p>
        </div>
      </div>
    </div>
  );
}
