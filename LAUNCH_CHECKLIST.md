# Nufe Photo Map Launch Checklist

## Environment

- Set `NEXT_PUBLIC_SUPABASE_URL`
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Set `SUPABASE_SERVICE_ROLE_KEY`
- Set `SUPABASE_STORAGE_BUCKET`
- Set `NEXT_PUBLIC_SITE_URL`
- Set `NEXT_PUBLIC_SUPABASE_EMAIL_REDIRECT_PATH`

## Supabase

- Run `supabase/schema.sql`
- Optionally run `supabase/seed.sql`
- Confirm the `spot-photos` public bucket exists
- Enable Email auth in Supabase Authentication
- Add the local redirect URL for auth callback

## Roles and governance

- Create the first admin account
- Promote at least one second staff account to `moderator`
- Confirm staff can access `/admin`
- Confirm moderators cannot access merge or role-management flows
- Confirm admins can access all admin pages

## Content operations

- Seed at least 8 reviewed published spots
- Feature 3 to 4 strong spots
- Feature 4 to 6 strong published photos
- Review pending uploads before public launch
- Confirm merged spots redirect to canonical spots

## Workflow checks

- Upload as a normal active user
- Favorite and unfavorite a spot
- Submit a report
- Review and publish a pending photo as staff
- Merge a duplicate spot as admin
- Run a maintenance repair action as admin
- Restrict a user and verify uploads are blocked
- Ban a user and verify upload, favorite, and report actions are blocked
