# Community Events MVP — Plan

A friendly, lightweight web app for hosting and attending free community events. Demo-ready, clear flows, soft community-style UI.

## Design system

- Soft, warm palette (off-white background, muted primary like sage/indigo, soft accent)
- Rounded cards (lg radius), generous spacing, friendly sans-serif (Inter/Nunito)
- Primary CTAs: RSVP, Publish, Check-in — high contrast, prominent
- Desktop-first, responsive down to mobile
- Minimal top nav: Explore · My Tickets · My Events · (avatar menu)

## User types & auth

- Email-based sign-in (Lovable Cloud, email/password + magic link)
- Visitors browse Explore, event pages, host pages
- Sign-in gate on RSVP, hosting, check-in — return-to redirect after auth
- Roles stored in a separate `host_members` table per host org (host, checker)

## Core pages & flows

### Public
- **Explore** — search, date filter (Upcoming default), location text, "include past" toggle, card grid
- **Event page** — cover, details, host card, RSVP button (or "Ended" badge), social meta tags
- **Host page** — logo, bio, contact, list of published events
- **Sign in / Sign up**

### Attendee
- **RSVP flow** — instant confirmation OR waitlist if full; shows ticket (code + QR-style visual + Add to Calendar .ics)
- **My Tickets** — upcoming only, status (Confirmed/Waitlisted), cancel action
- **Post-event feedback** — 1–5 stars + optional comment, one per attendee, only after end time
- **Gallery upload** — photo upload pending host approval
- **Report** — report event or gallery photo

### Host
- **Become a host** — self-serve form (name, logo, bio, contact email)
- **Host dashboard** — upcoming/past events, per-event stats (Going / Waitlist / Checked-in)
- **Event editor** — title, description, start/end + timezone, venue or online link, capacity, cover image, visibility (Public/Unlisted), Free/Paid toggle (Paid disabled w/ "Coming soon" tooltip)
- **Event actions** — Publish, Unpublish, Duplicate, Delete
- **Attendee list + CSV export** (Name, Email, RSVP status, Check-in timestamp)
- **Gallery moderation** — approve/reject photos
- **Reports review** — list of reported events/photos, hide action
- **Invitations** — copyable role-based invite links (host / checker)

### My Events
- Aggregates all events where the user has any role
- Filters: host, date range, text
- Role-appropriate quick actions (manage vs. check-in only)

### Check-in
- Manual ticket code entry (no camera)
- Live counters: checked-in / remaining capacity
- Duplicate prevention, undo last check-in

## Waitlist logic

- FIFO queue per event
- On cancel or capacity increase: auto-promote next waitlisted attendee
- UI updates immediately (realtime subscription)
- No email — purely in-app

## Data model (high level)

```text
profiles (id, email, name, avatar)
hosts (id, name, slug, logo, bio, contact_email, owner_id)
host_members (host_id, user_id, role: 'host'|'checker')
host_invites (host_id, role, token, expires_at)
events (id, host_id, title, description, starts_at, ends_at, tz,
        venue, online_url, capacity, cover, state, visibility, is_paid)
rsvps (id, event_id, user_id, status: 'confirmed'|'waitlisted'|'cancelled',
       ticket_code, created_at, checked_in_at)
feedback (event_id, user_id, rating, comment)
gallery_photos (id, event_id, user_id, url, status: 'pending'|'approved'|'rejected')
reports (id, target_type, target_id, reporter_id, reason, status)
```

## Technical notes

- Lovable Cloud (Supabase): auth, Postgres, storage (logos, covers, gallery), realtime for waitlist promotion + check-in counters
- RLS on all tables; `has_role(user, host_id, role)` security-definer function
- Waitlist promotion: Postgres trigger on `rsvps` (cancel → promote oldest waitlisted)
- CSV export: client-side generation with proper UTF-8 BOM for Excel
- Add-to-calendar: client-generated `.ics` download
- Ticket QR-style visual: rendered from ticket code (no camera scanning needed)
- Social previews: per-event meta tags injected on event page

## Out of scope (per spec)

Payments, email notifications, advanced analytics, mobile apps, QR scanning, additional roles.

## Build order

1. Auth + profiles + base layout/nav
2. Hosts (become a host, host page, members/invites)
3. Events (CRUD, states, visibility, Explore, event page)
4. RSVP + tickets + waitlist + My Tickets
5. Check-in
6. Host dashboard + CSV export
7. Feedback + gallery + moderation + reports
8. Polish, empty states, demo seed data
