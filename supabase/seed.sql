insert into public.spots (id, slug, name, description, latitude, longitude, campus_area, best_time, created_by, status, tags, tips, reviewed_by, reviewed_at, created_at)
values
  ('11111111-aaaa-4aaa-8aaa-111111111111', 'main-library-steps', 'Main Library Steps', 'A symmetrical staircase scene with a formal facade that works beautifully for portraits and graduation photos.', 32.0298, 118.7895, 'Central Campus', '06:30 - 08:00', null, 'published', '{"graduation","symmetry","architecture"}', '{"Shoot from the lowest step for stronger symmetry","Use a 50mm lens for natural portraits"}', null, '2026-03-20T06:00:00Z', '2026-03-20T06:00:00Z'),
  ('22222222-bbbb-4bbb-8bbb-222222222222', 'moon-lake-boardwalk', 'Moon Lake Boardwalk', 'A calm lakeside spot with reflections, willow branches, and long leading lines for landscape and couple photos.', 32.0312, 118.7928, 'East Lake', '16:30 - 18:30', null, 'published', '{"lake","sunset","reflection"}', '{"Wait for still water after light wind fades","Shoot toward the sun for silhouettes"}', null, '2026-03-20T06:10:00Z', '2026-03-20T06:10:00Z'),
  ('33333333-cccc-4ccc-8ccc-333333333333', 'ginkgo-avenue', 'Ginkgo Avenue', 'A tree-lined road with strong seasonal color and enough depth for fashion shots, walking portraits, and cinematic frames.', 32.0285, 118.7868, 'West Garden', '09:00 - 11:00', null, 'published', '{"autumn","portrait","trees"}', '{"Use backlight in autumn for glowing leaves","Try burst mode for walking shots"}', null, '2026-03-20T06:20:00Z', '2026-03-20T06:20:00Z')
on conflict (id) do nothing;

insert into public.photos (id, spot_id, user_id, image_url, title, caption, photographer_name, visitor_id, shot_time, status, reviewed_by, reviewed_at, created_at)
values
  ('44444444-1111-4111-8111-444444444441', '11111111-aaaa-4aaa-8aaa-111111111111', null, 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=900&q=80', 'Morning symmetry', 'Shot from the lower landing to catch the full staircase geometry.', 'Campus Lens', 'visitor-seed-001', '2026-03-22T07:12:00Z', 'published', null, '2026-03-22T07:12:00Z', '2026-03-22T07:12:00Z'),
  ('44444444-2222-4222-8222-444444444442', '22222222-bbbb-4bbb-8bbb-222222222222', null, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', 'Lake edge stillness', 'The water was calm enough for a double reflection line.', 'Ming', 'visitor-seed-002', '2026-03-29T17:48:00Z', 'published', null, '2026-03-29T17:48:00Z', '2026-03-29T17:48:00Z'),
  ('44444444-3333-4333-8333-444444444443', '33333333-cccc-4ccc-8ccc-333333333333', null, 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80', 'Autumn corridor', 'A centered walking portrait with the trees framing both sides.', 'Qiao', 'visitor-seed-003', '2026-04-02T10:25:00Z', 'published', null, '2026-04-02T10:25:00Z', '2026-04-02T10:25:00Z')
on conflict (id) do nothing;

insert into public.favorites (id, user_id, visitor_id, spot_id, created_at)
values
  ('55555555-1111-4111-8111-555555555551', null, 'visitor-seed-001', '22222222-bbbb-4bbb-8bbb-222222222222', '2026-04-08T11:22:00Z'),
  ('55555555-2222-4222-8222-555555555552', null, 'visitor-seed-001', '11111111-aaaa-4aaa-8aaa-111111111111', '2026-04-10T09:10:00Z')
on conflict (id) do nothing;
