import Link from "next/link";
import { Camera, Heart, MapPinned, Upload } from "lucide-react";
import { AuthNav } from "@/components/auth/auth-nav";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { href: "/", label: "Home", icon: MapPinned },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/user", label: "My Page", icon: Heart }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-mist/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">{siteConfig.productName}</p>
            <p className="text-sm text-ink/60">{siteConfig.brandSubtitle}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-fern/40 hover:text-moss"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
