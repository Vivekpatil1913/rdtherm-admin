"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type AsLink = CommonProps & { href: string };

type ButtonProps = AsButton | AsLink;

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-strong)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm",
  secondary:
    "bg-[var(--color-content)] text-[var(--color-surface)] hover:opacity-90",
  outline:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-content)] hover:bg-[var(--color-surface-hover)]",
  ghost:
    "text-[var(--color-content-soft)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-content)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[8px]",
  md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-field)]",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-[var(--radius-field)]",
  icon: "h-10 w-10 rounded-[var(--radius-field)] justify-center",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    );
  }

  // Strip the design-system props so only valid DOM attributes reach <button>.
  const {
    variant: _v,
    size: _s,
    loading: _l,
    leftIcon: _li,
    rightIcon: _ri,
    className: _cn,
    children: _ch,
    type = "button",
    disabled,
    ...rest
  } = props as AsButton;

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {content}
    </button>
  );
}
