import { AuthCtaCard } from "@/components/auth/auth-cta-card";
import { UploadForm } from "@/components/upload/upload-form";
import { getCurrentProfile, getCurrentUser } from "@/lib/profiles";
import { getSpots } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export default async function UploadPage() {
  const [user, profile, spots] = await Promise.all([getCurrentUser(), getCurrentProfile(), getSpots()]);

  if (!user) {
    return (
      <AuthCtaCard
        title={siteConfig.upload.authTitle}
        description={siteConfig.upload.authDescription}
        nextPath="/upload"
      />
    );
  }

  return (
    <UploadForm
      spots={spots}
      initialPhotographerName={profile?.nickname || user.email?.split("@")[0] || ""}
    />
  );
}
