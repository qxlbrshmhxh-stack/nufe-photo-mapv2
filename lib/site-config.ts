export const siteConfig = {
  schoolDisplayName: "NUFE",
  schoolFullName: "Nanjing University of Finance & Economics",
  campusDisplayName: "Xianlin Campus",
  productName: "Nufe Photo Map",
  brandSubtitle: "Campus photo spots for NUFE",
  metadataDescription: "A campus photo-spot sharing MVP for Nanjing University of Finance & Economics Xianlin Campus.",
  home: {
    heroEyebrow: "Photo spots across NUFE",
    heroTitle: "Explore the most photogenic corners of campus before your next shoot.",
    heroDescription:
      "Browse campus locations on the map, open spot previews, check sample images and shooting tips, and discover what the NUFE Xianlin community is sharing.",
    heroPrimaryCta: "Open the map",
    heroSecondaryCta: "Prepare an upload",
    mapEyebrow: "Campus map",
    mapTitle: "Browse photo spots around NUFE",
    mapDescription:
      "Filter the map by campus area, best shooting time, or keyword, then save the spots you want to revisit around Xianlin Campus.",
    featuredEyebrow: "Featured spots",
    featuredTitle: "Start with the editorial picks for this week",
    featuredDescription:
      "These reviewed campus spots are manually featured so the homepage stays sharp and useful.",
    featuredEmpty:
      "No featured spots are set yet. Add a few recommended NUFE Xianlin locations to shape the homepage.",
    recentEyebrow: "Recent photos",
    recentTitle: "Fresh published shots from the NUFE community",
    recentDescription:
      "A lightweight public gallery of recently reviewed campus photos, with featured images pinned first.",
    recentEmpty:
      "No published photos are available yet. Feature a few reviewed uploads to make the homepage feel more alive.",
    recentFallbackCaption: "A recent community photo from campus.",
    signedOutSaveHint: "Sign in to save favorite spots to your account.",
    filteredEmpty: "No spots match the current filters."
  },
  upload: {
    authTitle: "Log in before uploading",
    authDescription:
      "Photo uploads and new spot submissions are tied to your real account, so you need to sign in before posting.",
    eyebrow: "Upload flow",
    title: "Share a campus shot in a few steps",
    description:
      "Pick your photo, attach it to an existing spot or create a new one with a map click, then add a short caption.",
    boundaryHint: "Keep uploads focused on NUFE Xianlin Campus locations and scenes.",
    searchPlaceholder: "Library, lake, playground...",
    searchLabel: "Search campus spot",
    selectLabel: "Select spot",
    existingFallback: "Choose an existing photo spot first.",
    newSpotMissingName: "Please enter a name for the new spot.",
    newSpotMissingLocation: "Please click the map to place the new spot.",
    captionPlaceholder: "What makes this shot or spot worth sharing?",
    advancedTitle: "Advanced details",
    advancedDescription: "Optional fields for extra context",
    defaultPhotoTitle: "Campus photo",
    defaultSpotDescriptionSuffix: "campus photo spot",
    defaultCampusArea: "Xianlin Campus",
    defaultBestTime: "Flexible",
    locationHint: "Click once to place the spot",
    selectedSpotFallback: "Search campus spots and attach your photo to the right place.",
    newSpotHelper:
      "Name the spot, tap the map to place it, and add extra details only if they help future photographers.",
    noMatches: "No matching spots found",
    noFileSelected: "No file selected"
  },
  user: {
    pageTitle: "Sign in to open your page",
    pageDescription: "Your page shows real account-owned uploads, favorites, and profile details.",
    uploadedTitle: "Photos posted from your account",
    savedTitle: "Favorite places to revisit",
    bioPlaceholder: "Tell other NUFE photographers what you like to shoot."
  },
  auth: {
    signupTitle: "Start your NUFE photo profile",
    loginTitle: "Sign in to save your campus workflow",
    signupDescription: "New uploads and favorites will be tied to this real Supabase account.",
    loginDescription: "Use your email account to manage uploads, favorites, and your profile.",
    nicknamePlaceholder: "Campus Lens",
    emailPlaceholder: "you@nufe.edu.cn"
  }
} as const;
