import { Favorite, Photo, Spot, UserProfile } from "@/lib/types";

export const mockSpots: Spot[] = [
  {
    id: "spot-001",
    slug: "main-library-steps",
    name: "Main Library Steps",
    description: "A symmetrical staircase scene with a formal facade that works beautifully for portraits and graduation photos.",
    latitude: 32.0298,
    longitude: 118.7895,
    campusArea: "Central Campus",
    locationText: "In front of the main library entrance",
    bestTime: "06:30 - 08:00",
    tips: ["Shoot from the lowest step for stronger symmetry", "Use a 50mm lens for natural portraits", "Arrive early before foot traffic increases"],
    previewImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
    tags: ["graduation", "symmetry", "architecture"],
    gallery: [
      "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-002",
    slug: "moon-lake-boardwalk",
    name: "Moon Lake Boardwalk",
    description: "A calm lakeside spot with reflections, willow branches, and long leading lines for landscape and couple photos.",
    latitude: 32.0312,
    longitude: 118.7928,
    campusArea: "East Lake",
    locationText: "Wooden path along Moon Lake",
    bestTime: "16:30 - 18:30",
    tips: ["Wait for still water after light wind fades", "Shoot toward the sun for silhouettes", "Try portrait orientation to emphasize reflections"],
    previewImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    tags: ["lake", "sunset", "reflection"],
    gallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-003",
    slug: "ginkgo-avenue",
    name: "Ginkgo Avenue",
    description: "A tree-lined road with strong seasonal color and enough depth for fashion shots, walking portraits, and cinematic frames.",
    latitude: 32.0285,
    longitude: 118.7868,
    campusArea: "West Garden",
    locationText: "Pedestrian lane between the dorm area and west classrooms",
    bestTime: "09:00 - 11:00",
    tips: ["Stand near the center line when the path is clear", "Use backlight in autumn for glowing leaves", "Try burst mode for walking shots"],
    previewImage: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
    tags: ["autumn", "portrait", "trees"],
    gallery: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-004",
    slug: "teaching-building-corridor",
    name: "Teaching Building Corridor",
    description: "A clean corridor with repeating frames, soft side light, and an academic campus feeling for editorial portraits.",
    latitude: 32.0307,
    longitude: 118.7879,
    campusArea: "Teaching Zone",
    locationText: "Second-floor corridor of Teaching Building A",
    bestTime: "13:30 - 15:30",
    tips: ["Use the columns to create layered depth", "Shoot close to the wall for clean leading lines", "Cloudy afternoons give the smoothest light"],
    previewImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    tags: ["indoor", "clean-lines", "editorial"],
    gallery: [
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-005",
    slug: "playground-stands",
    name: "Playground Stands",
    description: "Open bleachers and a wide sky make this a strong location for youthful sports-style portraits and sunset silhouettes.",
    latitude: 32.0277,
    longitude: 118.7911,
    campusArea: "Sports Ground",
    locationText: "Main stadium stand on the east side",
    bestTime: "17:00 - 18:45",
    tips: ["Use the rows of seats as graphic lines", "Try wide shots for sky-heavy compositions", "A white shirt works well against the warm sunset tones"],
    previewImage: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=80",
    tags: ["sports", "sunset", "wide-shot"],
    gallery: [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-006",
    slug: "north-gate-arch",
    name: "North Gate Arch",
    description: "A recognizable campus entrance with strong identity, ideal for arrival shots, student portraits, and school-themed visuals.",
    latitude: 32.0331,
    longitude: 118.7881,
    campusArea: "North Gate",
    locationText: "Main archway near the north campus gate",
    bestTime: "08:00 - 10:00",
    tips: ["Shoot slightly off-center to avoid a flat frame", "Keep the full arch visible in wide shots", "Morning light gives the gate the cleanest contrast"],
    previewImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    tags: ["landmark", "campus", "entrance"],
    gallery: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-007",
    slug: "cherry-garden-path",
    name: "Cherry Garden Path",
    description: "A spring-focused path with soft blossom color and a romantic atmosphere that works especially well for close portraits.",
    latitude: 32.0291,
    longitude: 118.7942,
    campusArea: "South Garden",
    locationText: "Blossom path beside the south garden lawn",
    bestTime: "07:30 - 09:30",
    tips: ["Use backlight for translucent petals", "Stay close for soft background blur", "After light rain, petals on the ground add texture"],
    previewImage: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80",
    tags: ["spring", "flowers", "portrait"],
    gallery: [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    id: "spot-008",
    slug: "dormitory-rooftop-view",
    name: "Dormitory Rooftop View",
    description: "A high-angle view over campus buildings and tree lines, best for sunset skylines and moody wide campus scenes.",
    latitude: 32.0269,
    longitude: 118.7857,
    campusArea: "Dormitory Area",
    locationText: "Top floor rooftop access near Dormitory 3",
    bestTime: "18:00 - 19:00",
    tips: ["Use a tripod for blue hour scenes", "Keep the horizon level in wide frames", "Shoot just after sunset for richer city colors"],
    previewImage: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    tags: ["skyline", "blue-hour", "wide"],
    gallery: [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const mockPhotos: Photo[] = mockSpots.flatMap((spot, index) =>
  spot.gallery.map((image, galleryIndex) => ({
    id: `photo-${index + 1}-${galleryIndex + 1}`,
    spot_id: spot.id,
    image_url: image,
    title: `${spot.name} Frame ${galleryIndex + 1}`,
    caption: `Sample community photo for ${spot.name}.`,
    photographer_name: ["Campus Lens", "Ming", "Qiao"][galleryIndex % 3],
    shot_time: `2026-04-${String(10 + galleryIndex).padStart(2, "0")} 17:30`,
    created_at: `2026-04-${String(10 + galleryIndex).padStart(2, "0")}T09:00:00Z`
  }))
);

export const mockUsers: UserProfile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    nickname: "Campus Lens",
    avatar_url:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    created_at: "2026-03-01T08:00:00Z"
  }
];

export const mockFavorites: Favorite[] = [
  {
    id: "fav-1",
    user_id: "11111111-1111-1111-1111-111111111111",
    spot_id: "spot-002",
    created_at: "2026-04-08T11:22:00Z"
  },
  {
    id: "fav-2",
    user_id: "11111111-1111-1111-1111-111111111111",
    spot_id: "spot-001",
    created_at: "2026-04-10T09:10:00Z"
  },
  {
    id: "fav-3",
    user_id: "11111111-1111-1111-1111-111111111111",
    spot_id: "spot-007",
    created_at: "2026-04-10T09:10:00Z"
  }
];
