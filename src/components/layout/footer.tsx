import Link from "next/link";
import { Aperture, Globe, ExternalLink } from "lucide-react";
import { Container } from "./container";
import { siteConfig, navigation } from "@/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <Container className="py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Aperture className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-6">
            {navigation.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="GitHub"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Twitter"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
