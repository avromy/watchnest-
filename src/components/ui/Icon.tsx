import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "library"
  | "plus"
  | "collection"
  | "children"
  | "inbox"
  | "controls"
  | "settings"
  | "search"
  | "heart"
  | "user"
  | "lock"
  | "switch"
  | "play"
  | "check"
  | "clock"
  | "upload"
  | "more";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
    </>
  ),
  library: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m10 9 5 3-5 3Z" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  collection: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 5V3h8v2M8 10h8M8 14h5" />
    </>
  ),
  children: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.5 20c.5-4 2.4-6 5.5-6s5 2 5.5 6M13.5 15c3.9-.8 6.5 1.1 7.5 5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 5h16v14H4Z" />
      <path d="m4 13 4-3h8l4 3M9 15h6" />
    </>
  ),
  controls: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19 13.5v-3l-2-.6a7 7 0 0 0-.8-1.9l1-1.8-2.1-2.1-1.8 1a7 7 0 0 0-2-.8L10.5 2h-3l-.6 2.2a7 7 0 0 0-1.9.8L3.2 4 1.1 6.1l1 1.8a7 7 0 0 0-.8 2L-1 10.5v3l2.2.6a7 7 0 0 0 .8 1.9l-1 1.8 2.1 2.1 1.8-1a7 7 0 0 0 2 .8l.6 2.2h3l.6-2.2a7 7 0 0 0 1.9-.8l1.8 1 2.1-2.1-1-1.8a7 7 0 0 0 .8-2Z"
        transform="translate(2) scale(.83)"
      />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  heart: (
    <path d="M20.8 5.8a5.4 5.4 0 0 0-7.7 0L12 7l-1.1-1.2a5.4 5.4 0 1 0-7.7 7.7L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.7-5 3.3-7 8-7s7.3 2 8 7" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  switch: (
    <>
      <path d="m8 7-4 4 4 4M4 11h13M16 17l4-4-4-4M20 13H7" />
    </>
  ),
  play: <path d="m9 6 9 6-9 6Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </>
  ),
};

export default function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
