export function formatEventDate(starts: string, ends?: string | null): string {
  const s = new Date(starts);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  };
  if (!ends) return s.toLocaleString(undefined, opts);
  const e = new Date(ends);
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) {
    return `${s.toLocaleString(undefined, opts)} – ${e.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  }
  return `${s.toLocaleString(undefined, opts)} → ${e.toLocaleString(undefined, opts)}`;
}

export function isEventPast(ends: string): boolean {
  return new Date(ends) < new Date();
}

export function isEventLive(starts: string, ends: string): boolean {
  const now = new Date();
  return new Date(starts) <= now && now <= new Date(ends);
}

export function makeIcs(opts: {
  title: string; description?: string | null; location?: string | null;
  starts: string; ends: string; uid: string;
}): string {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const escape = (s = "") => s.replace(/[\\,;]/g, m => "\\" + m).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Gather//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@gather`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(opts.starts)}`,
    `DTEND:${fmt(opts.ends)}`,
    `SUMMARY:${escape(opts.title)}`,
    opts.description ? `DESCRIPTION:${escape(opts.description)}` : "",
    opts.location ? `LOCATION:${escape(opts.location)}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export function downloadFile(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "host";
}