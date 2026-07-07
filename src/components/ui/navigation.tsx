import Link from 'next/link';
import type { ReactNode } from 'react';

type BackLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
};

export function BackLink({ href, children, className = '', showArrow = true }: BackLinkProps) {
  return (
    <Link className={`inline-block rounded-2xl border border-[#c9d8f2] bg-white px-5 py-3 font-semibold text-watchnest-primary ${className}`} href={href}>
      {showArrow ? '← ' : null}{children}
    </Link>
  );
}

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions, className = '', children }: PageHeaderProps) {
  return (
    <header className={`rounded-card border border-watchnest-border bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-watchnest-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-watchnest-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{actions}</div> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
