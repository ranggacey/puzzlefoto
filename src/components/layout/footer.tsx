import Link from "next/link";
import { Aperture, Globe, ExternalLink } from "lucide-react";
import { Container } from "./container";
import { siteConfig, navigation } from "@/constants/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <Container className="py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
                <Aperture className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-50">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-xs text-zinc-500">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-6">
            {navigation.main.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
              aria-label="GitHub"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
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
