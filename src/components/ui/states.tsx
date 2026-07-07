import Link from 'next/link';
import type { ReactNode } from 'react';

type StateAction = {
  href: string;
  label: string;
};

type BaseStateProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: StateAction;
  className?: string;
};

function StatePanel({ eyebrow, title, description, action, className = '' }: BaseStateProps) {
  return (
    <section className={`rounded-card border border-dashed border-watchnest-border bg-white p-10 text-center shadow-sm ${className}`}>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">{eyebrow}</p> : null}
      <h2 className="mt-3 text-2xl font-bold text-watchnest-foreground">{title}</h2>
      {description ? <p className="mx-auto mt-3 max-w-xl text-watchnest-muted">{description}</p> : null}
      {action ? (
        <Link className="mt-6 inline-block rounded-2xl bg-watchnest-primary px-5 py-3 font-semibold text-white" href={action.href}>
          {action.label}
        </Link>
      ) : null}
    </section>
  );
}

export function EmptyState(props: BaseStateProps) {
  return <StatePanel eyebrow="Nothing here yet" {...props} />;
}

export function ErrorState(props: BaseStateProps) {
  return <StatePanel eyebrow="Something needs attention" {...props} />;
}

type LoadingStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function LoadingState({ title = 'Loading', description = 'Getting things ready for you.', className = '' }: LoadingStateProps) {
  return (
    <section className={`rounded-card border border-watchnest-border bg-white p-6 shadow-sm ${className}`} aria-busy="true" aria-live="polite">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">{title}</p>
      <p className="mt-2 text-watchnest-muted">{description}</p>
      <div className="mt-5 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-watchnest-border" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-watchnest-border" />
      </div>
    </section>
  );
}
