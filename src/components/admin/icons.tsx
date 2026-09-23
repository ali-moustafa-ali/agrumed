type P = { className?: string };
const b = "h-5 w-5";
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IcGrid = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>
);
export const IcUsers = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><circle cx="9" cy="8" r="3.4"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.6M17 14.4A6 6 0 0 1 21 20"/></svg>
);
export const IcBox = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M21 8.5 12 3.5 3 8.5v7L12 20.5l9-5v-7Z"/><path d="M3 8.5 12 13.5l9-5M12 13.5V20.5"/></svg>
);
export const IcTag = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M3 12.5V4.5A1.5 1.5 0 0 1 4.5 3h8l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0L3 12.5Z"/><circle cx="7.8" cy="7.8" r="1.4"/></svg>
);
export const IcLog = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M8.5 13h7M8.5 17h5"/></svg>
);
export const IcOut = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16 6 12l4-4M6 12h9"/></svg>
);
export const IcSearch = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
);
export const IcPlus = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M12 5v14M5 12h14"/></svg>
);
export const IcArrow = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M19 12H5m6-7-7 7 7 7"/></svg>
);
export const IcUp = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
);
export const IcDown = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M12 5v14m7-7-7 7-7-7"/></svg>
);
export const IcPhone = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M5 4h3.2l1.5 4-2 1.4a12 12 0 0 0 6.9 6.9l1.4-2 4 1.5V19a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/></svg>
);
export const IcMail = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>
);
export const IcWhats = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.5-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.4.2.5.3.1.2.1.7-.1 1.4Z"/></svg>
);
export const IcTrash = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1L18 7"/></svg>
);
export const IcEye = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const IcCheck = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} strokeWidth={2.2} className={className}><path d="m5 12.5 4.5 4.5L19 7"/></svg>
);
export const IcMenu = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
);
export const IcClose = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><path d="m6 6 12 12M18 6 6 18"/></svg>
);
export const IcGear = ({ className = b }: P) => (
  <svg viewBox="0 0 24 24" {...s} className={className}><circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>
);
