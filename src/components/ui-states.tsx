import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <header className="rounded-card border border-watchnest-border bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-watchnest-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}

type BackLinkProps = {
  href: string;
  children: ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-2xl border border-[#c9d8f2] bg-white px-5 py-3 font-semibold text-watchnest-primary transition hover:border-watchnest-primary"
      href={href}
    >
      {children}
    </Link>
  );
}

type StateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
};

function StateCard({ title, description, action, eyebrow }: StateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-card border border-watchnest-border bg-white p-8 text-center shadow-sm">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-3xl font-bold">{title}</h1>
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-watchnest-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </section>
  );
}

export function EmptyState(props: StateProps) {
  return <StateCard eyebrow="Nothing here yet" {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StateCard eyebrow="Needs attention" {...props} />;
}

export function LoadingState({
  message = "Loading WatchNest…",
}: {
  message?: string;
}) {
  return (
    <div
      className="rounded-card border border-watchnest-border bg-white p-8 text-center text-watchnest-muted shadow-sm"
      role="status"
    >
      <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-watchnest-primary/20" />
      <p className="font-semibold">{message}</p>
    </div>
  );
}
