import { type ReactNode } from "react";

export type IconName =
  | "home"
  | "tractor"
  | "users"
  | "warehouse"
  | "leaf"
  | "sun"
  | "cloud"
  | "speaker"
  | "mic"
  | "bell"
  | "map"
  | "phone"
  | "calendar"
  | "clock"
  | "check"
  | "close"
  | "tool"
  | "shield"
  | "briefcase"
  | "user"
  | "chevron"
  | "search"
  | "box"
  | "trash"
  | "edit"
  | "plus";

export function Icon({ name, size = 24, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    tractor: <><path d="M4 14h10l-2-6H8v6M14 11h4l3 3v3h-2" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6M8 8V5h4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7M15 14c3.5 0 6 2 6 6" /></>,
    warehouse: <><path d="m3 10 9-6 9 6v11H3z" /><path d="M7 21v-7h10v7M7 17h10" /></>,
    leaf: <><path d="M19 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 9-7 9-15Z" /><path d="M5 21c2-6 6-9 11-12" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    cloud: <path d="M6 19h12a4 4 0 0 0 .5-8A7 7 0 0 0 5 9a5 5 0 0 0 1 10Z" />,
    speaker: <><path d="M5 10v4h4l5 4V6L9 10zM17 9c1.5 1.5 1.5 4.5 0 6M19.5 6.5c3 3 3 8 0 11" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M7 3 4 5c-1 1 1 6 5 10s9 6 10 5l2-3-5-3-2 2c-2-1-5-4-6-6l2-2z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m4 12 5 5L20 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    tool: <><path d="M14 7a5 5 0 0 0-7-4l3 3-4 4-3-3a5 5 0 0 0 6 6l7 8 5-5-8-7a5 5 0 0 0 1-2Z" /></>,
    shield: <path d="M12 3 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6z" />,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-5 3-8 8-8s8 3 8 8" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    box: <><path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10" /></>,
    trash: <><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[name]}
    </svg>
  );
}

export function SpeakButton({ label, hidden = false }: { label: string; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <button aria-label={`Listen to ${label}`} className="icon-button">
      <Icon name="speaker" size={20} />
    </button>
  );
}
