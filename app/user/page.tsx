import { AuthCtaCard } from "@/components/auth/auth-cta-card";
import { UserDashboard } from "@/components/user/user-dashboard";
import { getAccountDashboardData } from "@/lib/favorites";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";
import { siteConfig } from "@/lib/site-config";

export default async function UserPage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (!user || !profile) {
    return (
      <AuthCtaCard
        title={siteConfig.user.pageTitle}
        description={siteConfig.user.pageDescription}
        nextPath="/user"
      />
    );
  }

  const dashboard = await getAccountDashboardData(user.id);

  return (
    <UserDashboard
      initialProfile={profile}
      initialFavoriteSpotIds={dashboard.favoriteSpotIds}
      initialSavedSpots={dashboard.savedSpots}
      initialUploadedPhotos={dashboard.uploadedPhotos}
    />
  );
}
