import type { ReactNode } from "react";

export function Card({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {title ? <h2 className="text-base font-semibold text-stone-950">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "teal" | "amber" | "rose";
}) {
  const tones = {
    neutral: "border-stone-200 bg-white text-stone-950",
    teal: "border-teal-200 bg-teal-50 text-teal-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
      {children}
    </span>
  );
}
