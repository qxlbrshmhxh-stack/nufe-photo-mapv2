# Nufe Photo Map

A Web MVP for campus photo-spot sharing at Nanjing University of Finance & Economics. Package 9 upgrades the project toward launch readiness with staff role separation, user governance controls, moderation notes, featured content operations, homepage editorial sections, and a practical launch checklist.

## Final file tree

```text
app/
  api/
    admin/
      maintenance/route.ts
      photos/
        [id]/route.ts
        batch/route.ts
      reports/[id]/route.ts
      spots/
        [id]/route.ts
        batch/route.ts
        merge/route.ts
      users/
        [id]/route.ts
    favorites/route.ts
    photos/route.ts
    profile/route.ts
    reports/route.ts
    visitor/route.ts
  admin/
    layout.tsx
    maintenance/page.tsx
    page.tsx
    photos/
      [id]/page.tsx
      page.tsx
    reports/page.tsx
    setup/page.tsx
    spots/
      [id]/page.tsx
      merge/page.tsx
      page.tsx
    users/
      [id]/page.tsx
      page.tsx
  auth/
    callback/route.ts
  globals.css
  layout.tsx
  login/page.tsx
  page.tsx
  signup/page.tsx
  spots/[slug]/page.tsx
  upload/page.tsx
  user/page.tsx
components/
  admin/
    admin-action-history.tsx
    admin-maintenance-panel.tsx
    admin-nav.tsx
    admin-overview-grid.tsx
    admin-photo-detail.tsx
    admin-photo-list.tsx
    admin-report-list.tsx
    admin-spot-detail.tsx
    admin-spot-list.tsx
    admin-spot-merge-form.tsx
    admin-trend-list.tsx
    admin-user-detail.tsx
    admin-user-list.tsx
  auth/
    auth-cta-card.tsx
    auth-form.tsx
    auth-nav.tsx
    auth-provider.tsx
  favorites/
    favorite-button.tsx
  home/
    filter-bar.tsx
    featured-spots.tsx
    hero-section.tsx
    home-explorer.tsx
  layout/
    site-header.tsx
    site-shell.tsx
  map/
    campus-map.tsx
    marker-popup-card.tsx
  reports/
    report-button.tsx
  spot/
    related-spots.tsx
    spot-favorite-toggle.tsx
    spot-gallery.tsx
    spot-meta.tsx
  ui/
    section-heading.tsx
    status-badge.tsx
    tag-chip.tsx
  upload/
    upload-form.tsx
  user/
    profile-editor.tsx
    profile-header.tsx
    saved-spots.tsx
    uploaded-photos.tsx
    user-dashboard.tsx
lib/
  admin-data.ts
  admin.ts
  auth.ts
  favorites.ts
  maintenance.ts
  mock-data.ts
  moderation-rules.ts
  permissions.ts
  profiles.ts
  queries.ts
  spot-filters.ts
  supabase.ts
  types.ts
  utils.ts
  visitor.ts
middleware.ts
LAUNCH_CHECKLIST.md
supabase/
  schema.sql
  seed.sql
```

## Environment variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=spot-photos
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH=/auth/callback
```

Required for package 9:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Supabase dashboard setup

1. Create a Supabase project.
2. In Authentication > Providers, enable Email.
3. In Authentication > URL Configuration, add `http://localhost:3000` as a local redirect URL.
4. Run `supabase/schema.sql` in the SQL editor.
5. Optional: run `supabase/seed.sql` for starter content.
6. In Storage, confirm there is a public bucket named `spot-photos`.
7. Promote at least one signed-in profile to admin:

```sql
update public.profiles
set role = 'admin'
where id = 'your-auth-user-uuid';
```

## What package 9 implements

- Centralized staff permission helpers for `moderator` and `admin`
- User governance status controls: `active`, `restricted`, `banned`
- Internal moderation notes and hide/rejection reasons on spots, photos, and reports
- Admin user management pages for role and account-state updates
- Manual featured content operations for spots and photos
- Homepage editorial upgrade with featured spots and recent published photos
- Launch checklist support in both the repo and `/admin/setup`

## Local run

1. Install dependencies with `npm install`
2. Add `.env.local`
3. Run `npm run dev`
4. Open `http://localhost:3000`

## Testing checklist

1. Sign in as an admin user.
2. Visit `/admin` and confirm overview cards, trend panels, and recent actions load.
3. Promote one staff account to `moderator` and another to `admin`, then confirm both can access `/admin`.
4. Confirm moderators can review spots, photos, and reports, but cannot access merge or role-management actions.
5. Visit `/admin/users`, filter by role and status, then update a user's governance state from the detail page.
6. Ban a user and confirm upload, favorite, and report actions are blocked for that account.
7. Restrict a user and confirm uploads are blocked while the account remains signed in.
8. Feature a published spot and a published photo from admin detail pages, then confirm they appear on the homepage.
9. Visit `/admin/spots/merge`, pick a source and target spot, confirm the preview counts and risks, and run a merge as an admin.
10. Visit the public merged spot URL `/spots/[slug]` and confirm it redirects to the canonical target spot.
11. Submit the same report twice within 24 hours and confirm the cooldown guard blocks the duplicate.
12. Visit `/admin/maintenance` and confirm issue categories render, then run a repair action as an admin.
13. Review `LAUNCH_CHECKLIST.md` and `/admin/setup` before launch.
